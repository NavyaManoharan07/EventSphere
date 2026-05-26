const Community = require('../models/Community');
const Discussion = require('../models/Discussion');
const Connection = require('../models/Connection');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const TeamInvitation = require('../models/TeamInvitation');
const Notification = require('../models/Notification');
const { addXp } = require('../utils/xpHelper');

const cleanText = (value, fallback = '') => String(value || fallback).trim();

const isMember = (community, userId) => (
  community.members || []
).some((member) => member.user.toString() === userId.toString());

const getCommunityStats = async (communityIds) => {
  const discussionCounts = await Discussion.aggregate([
    { $match: { community: { $in: communityIds } } },
    { $group: { _id: '$community', posts: { $sum: 1 }, replies: { $sum: { $size: '$replies' } } } },
  ]);

  return discussionCounts.reduce((acc, item) => {
    acc[item._id.toString()] = {
      posts: item.posts,
      replies: item.replies,
    };
    return acc;
  }, {});
};

const serializeCommunity = (community, stats = {}, userId = '') => {
  const id = community._id.toString();
  const memberCount = community.members?.length || 0;
  const stat = stats[id] || { posts: 0, replies: 0 };

  return {
    id,
    name: community.name,
    description: community.description,
    category: community.category,
    type: community.type,
    visibility: community.visibility,
    members: memberCount,
    posts: stat.posts,
    replies: stat.replies,
    resources: community.resources?.length || 0,
    events: community.events?.length || 0,
    rules: community.rules || [],
    joined: userId ? isMember(community, userId) : false,
    createdAt: community.createdAt,
  };
};

const communityMatchScore = (community, user) => {
  const profileTokens = new Set([
    ...(user.interests || []),
    ...(user.goals || []),
    user.eventPreference || '',
  ].map((item) => String(item).toLowerCase()));

  const communityTokens = [
    community.name,
    community.description,
    community.category,
    community.type,
  ].flatMap((item) => String(item || '').toLowerCase().split(/[^a-z0-9]+/));

  const matched = communityTokens.filter((token) => profileTokens.has(token));
  let score = 45 + Math.min(new Set(matched).size * 15, 40);

  if (user.eventPreference && community.category === user.eventPreference) score += 10;
  if ((user.goals || []).includes('Networking') && community.type !== 'entertainment') score += 5;

  return Math.min(score, 100);
};

const userMatchScore = ({ currentUser, candidate, sharedEventCount = 0 }) => {
  const currentInterests = new Set((currentUser.interests || []).map((item) => item.toLowerCase()));
  const sharedInterests = (candidate.interests || []).filter((item) => currentInterests.has(item.toLowerCase()));
  const currentGoals = new Set((currentUser.goals || []).map((item) => item.toLowerCase()));
  const sharedGoals = (candidate.goals || []).filter((item) => currentGoals.has(item.toLowerCase()));
  let score = 25;

  score += Math.min(sharedInterests.length * 18, 40);
  score += Math.min(sharedGoals.length * 12, 25);
  score += Math.min(sharedEventCount * 12, 25);
  if (currentUser.networkingEnabled && candidate.networkingEnabled) score += 10;

  return {
    matchScore: Math.min(score, 100),
    reason: sharedInterests.length
      ? `${sharedInterests.slice(0, 2).join(', ')} interest match`
      : sharedEventCount
        ? 'Shared event participation'
        : 'Similar goals and community activity',
    sharedInterests: sharedInterests.slice(0, 3),
  };
};

exports.getCommunities = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const communities = await Community.find({ visibility: 'public' })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    const stats = await getCommunityStats(communities.map((community) => community._id));

    const myCommunities = communities
      .filter((community) => isMember(community, req.user.id))
      .map((community) => serializeCommunity(community, stats, req.user.id));

    const suggestedCommunities = communities
      .filter((community) => !isMember(community, req.user.id))
      .map((community) => ({
        ...serializeCommunity(community, stats, req.user.id),
        match: communityMatchScore(community, user || {}),
        reason: 'Based on your interests and goals',
      }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 8);

    const discussions = await Discussion.find({
      community: { $in: communities.map((community) => community._id) },
    })
      .populate('community', 'name category')
      .populate('user', 'name')
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    const trendingTopics = Array.from(new Set([
      ...(user?.interests || []),
      'Networking',
      'Hackathons',
      'StartupLife',
      'TeamFormation',
    ])).slice(0, 6).map((topic, index) => ({
      topic: `#${String(topic).replace(/\s+/g, '')}`,
      posts: 120 + index * 73,
    }));

    return res.status(200).json({
      myCommunities,
      suggestedCommunities,
      recentDiscussions: discussions.map((discussion) => ({
        id: discussion._id,
        title: discussion.title,
        message: discussion.message,
        type: discussion.type,
        community: discussion.community?.name || 'Community',
        author: discussion.user?.name || 'Member',
        replies: discussion.replies?.length || 0,
        likes: discussion.likes,
        createdAt: discussion.createdAt,
      })),
      trendingTopics,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCommunity = async (req, res, next) => {
  try {
    const name = cleanText(req.body.name);
    const description = cleanText(req.body.description);

    if (!name || !description) {
      return res.status(400).json({ message: 'Community name and description are required' });
    }

    const community = await Community.create({
      name,
      description,
      category: cleanText(req.body.category, 'General'),
      type: req.body.type || 'interest',
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin', xpContribution: 20 }],
    });

    return res.status(201).json(serializeCommunity(community.toObject(), {}, req.user.id));
  } catch (error) {
    next(error);
  }
};

exports.joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!isMember(community, req.user.id)) {
      community.members.push({ user: req.user.id, role: 'member', xpContribution: 20 });
      await community.save();
      await addXp(req.user.id, 'joinCommunity');
    }

    return res.status(200).json(serializeCommunity(community.toObject(), {}, req.user.id));
  } catch (error) {
    next(error);
  }
};

exports.getCommunityFeed = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.communityId)
      .populate('members.user', 'name city interests goals xp')
      .populate('resources.uploadedBy', 'name')
      .lean();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const discussions = await Discussion.find({ community: community._id })
      .populate('user', 'name city interests')
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      community: serializeCommunity(community, {}, req.user.id),
      members: community.members.map((member) => ({
        id: member.user?._id,
        name: member.user?.name,
        city: member.user?.city,
        interests: member.user?.interests || [],
        role: member.role,
        xpContribution: member.xpContribution,
      })),
      discussions: discussions.map((discussion) => ({
        id: discussion._id,
        title: discussion.title,
        message: discussion.message,
        type: discussion.type,
        author: discussion.user?.name || 'Member',
        replies: discussion.replies?.length || 0,
        likes: discussion.likes,
        createdAt: discussion.createdAt,
      })),
      resources: (community.resources || []).map((resource) => ({
        id: resource._id,
        title: resource.title,
        fileUrl: resource.fileUrl,
        uploadedBy: resource.uploadedBy?.name || 'Member',
        createdAt: resource.createdAt,
      })),
      leaderboard: [...community.members]
        .sort((a, b) => (b.user?.xp || 0) - (a.user?.xp || 0))
        .slice(0, 5)
        .map((member, index) => ({
          rank: index + 1,
          name: member.user?.name || 'Member',
          xpContribution: member.user?.xp || 0,
        })),
    });
  } catch (error) {
    next(error);
  }
};

exports.createDiscussion = async (req, res, next) => {
  try {
    const community = await Community.findById(req.body.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!isMember(community, req.user.id)) {
      community.members.push({ user: req.user.id, role: 'member', xpContribution: 20 });
    }

    const title = cleanText(req.body.title);
    const message = cleanText(req.body.message);

    if (!title || !message) {
      return res.status(400).json({ message: 'Discussion title and message are required' });
    }

    const discussion = await Discussion.create({
      community: community._id,
      user: req.user.id,
      title,
      message,
      type: req.body.type || 'discussion',
    });

    const member = community.members.find((item) => item.user.toString() === req.user.id);
    if (member) member.xpContribution += 15;
    await community.save();
    await addXp(req.user.id, 'discussionPost');

    return res.status(201).json(discussion);
  } catch (error) {
    next(error);
  }
};

exports.uploadResource = async (req, res, next) => {
  try {
    const community = await Community.findById(req.body.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const title = cleanText(req.body.title);
    const fileUrl = cleanText(req.body.fileUrl);

    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Resource title and link are required' });
    }

    if (!isMember(community, req.user.id)) {
      community.members.push({ user: req.user.id, role: 'member', xpContribution: 20 });
    }

    community.resources.push({ title, fileUrl, uploadedBy: req.user.id });
    const member = community.members.find((item) => item.user.toString() === req.user.id);
    if (member) member.xpContribution += 25;
    await community.save();
    await addXp(req.user.id, 'uploadResource');

    return res.status(201).json({ message: 'Resource uploaded' });
  } catch (error) {
    next(error);
  }
};

exports.getCommunitySuggestions = async (req, res, next) => {
  try {
    const [community, currentUser] = await Promise.all([
      Community.findById(req.params.communityId).populate('members.user', 'name city bio interests goals networkingEnabled profileVisible').lean(),
      User.findById(req.user.id).lean(),
    ]);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const myTickets = await Ticket.find({ attendee: req.user.id }).select('event').lean();
    const myEventIds = myTickets.map((ticket) => ticket.event.toString());
    const candidateIds = community.members
      .map((member) => member.user?._id)
      .filter((id) => id && id.toString() !== req.user.id);

    const sharedTickets = candidateIds.length && myEventIds.length
      ? await Ticket.find({ attendee: { $in: candidateIds }, event: { $in: myEventIds } }).lean()
      : [];

    const sharedEventsByUser = sharedTickets.reduce((acc, ticket) => {
      const attendeeId = ticket.attendee.toString();
      acc[attendeeId] = (acc[attendeeId] || 0) + 1;
      return acc;
    }, {});

    const suggestions = community.members
      .map((member) => member.user)
      .filter((user) => user && user._id.toString() !== req.user.id && user.profileVisible !== false && user.networkingEnabled !== false)
      .map((candidate) => {
        const score = userMatchScore({
          currentUser,
          candidate,
          sharedEventCount: sharedEventsByUser[candidate._id.toString()] || 0,
        });

        return {
          id: candidate._id,
          name: candidate.name,
          city: candidate.city,
          bio: candidate.bio,
          matchScore: score.matchScore,
          reason: score.reason,
          sharedInterests: score.sharedInterests,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    return res.status(200).json({ suggestions });
  } catch (error) {
    next(error);
  }
};

exports.createConnection = async (req, res, next) => {
  try {
    const receiverId = req.body.receiverId;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver is required' });
    }

    if (receiverId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id },
      ],
    });

    if (existing) {
      existing.status = 'accepted';
      existing.following = true;
      existing.matchScore = Number(req.body.matchScore) || existing.matchScore;
      if (req.body.communityId) existing.community = req.body.communityId;
      await existing.save();
      return res.status(200).json(existing);
    }

    const connection = await Connection.create({
      sender: req.user.id,
      receiver: receiverId,
      community: req.body.communityId || undefined,
      matchScore: Number(req.body.matchScore) || 0,
      status: 'accepted',
      following: true,
    });

    return res.status(201).json(connection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }
    next(error);
  }
};

exports.createTeamInvitation = async (req, res, next) => {
  try {
    const receiverId = req.body.receiverId;
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver is required' });
    }

    const existing = await TeamInvitation.findOne({
      sender: req.user.id,
      receiver: receiverId,
      community: req.body.communityId || null,
      event: req.body.eventId || null,
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const invitation = await TeamInvitation.create({
      sender: req.user.id,
      receiver: receiverId,
      community: req.body.communityId || undefined,
      event: req.body.eventId || undefined,
      message: req.body.message || 'Want to team up for this opportunity?',
    });

    await Notification.create({
      user: receiverId,
      type: 'network',
      title: 'Team invitation',
      message: invitation.message,
      link: '/app/communities',
    });

    return res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
};

exports.getTeamInvitations = async (req, res, next) => {
  try {
    const invitations = await TeamInvitation.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate('sender', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .populate('community', 'name')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(invitations);
  } catch (error) {
    next(error);
  }
};
