const crypto = require('crypto');
const Razorpay = require('razorpay');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Community = require('../models/Community');
const Discussion = require('../models/Discussion');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

const buildQrPayload = ({ ticketCode, eventId, attendeeId }) => {
  const payload = {
    ticketCode,
    eventId,
    attendeeId,
    issuedAt: new Date().toISOString(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      eventType,
      venue,
      startDate,
      endDate,
      capacity,
      price,
      networkingEnabled,
      communityEnabled,
      aiRecommendationsEnabled,
      bannerImage,
      tags,
      ticketTiers,
      discountCodes,
      agenda,
      speakers,
      faqs,
      mapUrl,
    } = req.body;

    if (!title || !description || !venue || !startDate || !endDate || capacity == null || price == null) {
      return res.status(400).json({ message: 'All event fields are required' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Event end date must be after the start date' });
    }

    const event = await Event.create({
      title,
      description,
      category: category || 'General',
      eventType: eventType || 'In-Person',
      venue,
      startDate,
      endDate,
      capacity,
      price,
      organizer: req.user.id,
      networkingEnabled: Boolean(networkingEnabled),
      communityEnabled: Boolean(communityEnabled),
      aiRecommendationsEnabled: Boolean(aiRecommendationsEnabled),
      bannerImage: bannerImage || '',
      tags: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 20) : [],
      ticketTiers: Array.isArray(ticketTiers) && ticketTiers.length
        ? ticketTiers
        : [{ name: price > 0 ? 'General Admission' : 'Free Ticket', price: Number(price), capacity: Number(capacity), description: 'Standard access' }],
      discountCodes: Array.isArray(discountCodes) ? discountCodes : [],
      agenda: Array.isArray(agenda) ? agenda : [],
      speakers: Array.isArray(speakers) ? speakers : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      mapUrl: mapUrl || '',
    });

    await Community.create({
      name: `${event.title} Community`,
      description: `A space for attendees, organisers, and collaborators to continue discussions around ${event.title}.`,
      category: event.category || 'General',
      type: event.category === 'Entertainment' ? 'entertainment' : event.category === 'Career' ? 'career' : 'event',
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin', xpContribution: 20 }],
      events: [event._id],
    });

    return res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const query = {};
    const now = new Date();

    if (req.query.category) query.category = new RegExp(String(req.query.category), 'i');
    if (req.query.city) query.venue = new RegExp(String(req.query.city), 'i');
    if (req.query.eventType) query.eventType = new RegExp(String(req.query.eventType), 'i');
    if (req.query.networking === 'true') query.networkingEnabled = true;
    if (req.query.free === 'true') query.price = 0;
    if (req.query.paid === 'true') query.price = { $gt: 0 };
    if (req.query.dateFrom || req.query.dateTo) {
      query.startDate = {};
      if (req.query.dateFrom) query.startDate.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.startDate.$lte = new Date(req.query.dateTo);
    }
    if (req.query.weekend === 'true') query.startDate = { ...(query.startDate || {}), $gte: now };

    const search = String(req.query.search || '').trim();
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { venue: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .lean();

    const tickets = await Ticket.aggregate([
      { $match: { status: { $in: ['booked', 'checked-in'] } } },
      { $group: { _id: '$event', sold: { $sum: 1 } } },
    ]);

    const soldByEvent = tickets.reduce((acc, item) => {
      acc[item._id.toString()] = item.sold;
      return acc;
    }, {});

    const payload = events
      .filter((event) => req.query.weekend === 'true' ? isWeekend(event.startDate) : true)
      .map((event) => {
      const sold = soldByEvent[event._id.toString()] || 0;
      return {
        ...event,
        sold,
        seatsRemaining: Math.max(event.capacity - sold, 0),
        trendingScore: sold + Math.max(0, Math.round((new Date(event.startDate) - now) / 86400000) * -1),
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const sold = await Ticket.countDocuments({
      event: event._id,
      status: { $in: ['booked', 'checked-in'] },
    });

    return res.status(200).json({
      ...event.toObject(),
      sold,
      seatsRemaining: Math.max(event.capacity - sold, 0),
    });
  } catch (error) {
    next(error);
  }
};

exports.bookTicket = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const soldTickets = await Ticket.countDocuments({
      event: event._id,
      status: { $in: ['booked', 'checked-in'] },
    });

    if (soldTickets >= event.capacity) {
      return res.status(400).json({ message: 'Event is sold out' });
    }

    const quantity = Math.min(Math.max(Number(req.body.quantity) || 1, 1), 10);
    const ticketType = String(req.body.ticketType || 'General').trim();
    const tickets = [];

    for (let index = 0; index < quantity; index += 1) {
      const ticketCode = crypto.randomUUID();
      const qrPayload = buildQrPayload({
        ticketCode,
        eventId: event._id.toString(),
        attendeeId: req.user.id,
      });

      tickets.push(await Ticket.create({
        event: event._id,
        attendee: req.user.id,
        ticketCode,
        qrPayload,
        ticketType,
        quantity: 1,
        amountPaid: Number(event.price) || 0,
      }));
    }

    await Notification.create({
      user: req.user.id,
      type: 'ticket',
      title: 'Ticket confirmed',
      message: `Your ticket for ${event.title} is confirmed.`,
      link: '/app/tickets',
    });

    res.status(201).json({
      tickets: tickets.map((ticket) => ({
        ticketId: ticket._id,
        event: event._id,
        ticketCode: ticket.ticketCode,
        qrPayload: ticket.qrPayload,
        ticketType: ticket.ticketType,
        status: ticket.status,
        bookedAt: ticket.bookedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ attendee: req.user.id })
      .populate('event', 'title venue startDate endDate price')
      .lean();

    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

const getConsecutiveDayStreak = (dates) => {
  const dayKeys = new Set(
    dates
      .filter(Boolean)
      .map((date) => new Date(date).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const LEVELS = [
  { level: 1, xp: 0, benefit: 'Member access' },
  { level: 2, xp: 200, benefit: 'Profile customization' },
  { level: 3, xp: 500, benefit: 'Community badge' },
  { level: 4, xp: 900, benefit: 'Priority recommendations' },
  { level: 5, xp: 1500, benefit: 'Event discounts' },
  { level: 6, xp: 2500, benefit: 'Early access tickets' },
  { level: 7, xp: 4000, benefit: 'Premium networking' },
  { level: 8, xp: 6000, benefit: 'VIP profile glow' },
  { level: 9, xp: 8500, benefit: 'Featured community profile' },
  { level: 10, xp: 12000, benefit: 'Elite member status' },
];

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

const getEventCategory = (event = {}) => {
  const raw = `${event.category || ''} ${event.title || ''} ${event.description || ''}`.toLowerCase();

  if (raw.includes('entertainment') || raw.includes('music') || raw.includes('festival')) return 'Entertainment';
  if (raw.includes('career') || raw.includes('workshop') || raw.includes('hackathon') || raw.includes('startup')) return 'Career';
  if (raw.includes('education') || raw.includes('learning') || raw.includes('seminar')) return 'Educational';

  return event.category || 'General';
};

const isCareerGrowthEvent = (event = {}) => {
  const raw = `${event.category || ''} ${event.title || ''} ${event.description || ''}`.toLowerCase();
  return raw.includes('workshop') || raw.includes('hackathon') || raw.includes('startup') || raw.includes('career');
};

const isEducationalEvent = (event = {}) => {
  const category = getEventCategory(event).toLowerCase();
  return ['career', 'educational', 'technology', 'business', 'design'].includes(category);
};

const tokenize = (value = '') => String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const getEventTokens = (event = {}) => new Set([
  ...tokenize(event.title),
  ...tokenize(event.description),
  ...tokenize(event.category),
  ...tokenize(event.venue),
]);

const getUserPreferenceTokens = (user = {}) => [
  ...(user.interests || []),
  ...(user.goals || []),
  user.eventPreference || '',
].flatMap(tokenize);

const scoreEventForUser = ({ event, user, sold = 0, attendedCategories = [] }) => {
  const eventTokens = getEventTokens(event);
  const preferenceTokens = getUserPreferenceTokens(user);
  const category = getEventCategory(event);
  let score = 35;
  const reasons = [];

  const matchedPreferences = preferenceTokens.filter((token) => eventTokens.has(token));
  if (matchedPreferences.length) {
    score += Math.min(matchedPreferences.length * 12, 35);
    reasons.push('matches your interests');
  }

  if (user.eventPreference === category || user.eventPreference === 'Both') {
    score += 15;
    reasons.push(`fits your ${user.eventPreference.toLowerCase()} preference`);
  }

  if ((user.goals || []).includes('Networking') && event.networkingEnabled) {
    score += 15;
    reasons.push('networking is enabled');
  }

  if (attendedCategories.includes(category)) {
    score += 10;
    reasons.push('similar to events you attended');
  }

  if (isWeekend(event.startDate) && category === 'Entertainment') {
    score += 8;
    reasons.push('good weekend balance');
  }

  if (sold > 0) {
    score += Math.min(Math.round(sold / 5), 10);
  }

  return {
    match: Math.min(score, 100),
    reason: reasons.length ? reasons.slice(0, 2).join(' and ') : `Upcoming at ${event.venue}`,
  };
};

const scoreUserMatch = ({ currentUser, candidate, sharedEventCount = 0 }) => {
  const currentInterests = new Set((currentUser.interests || []).map((item) => item.toLowerCase()));
  const candidateInterests = (candidate.interests || []).map((item) => item.toLowerCase());
  const sharedInterests = candidateInterests.filter((item) => currentInterests.has(item));
  const currentGoals = new Set((currentUser.goals || []).map((item) => item.toLowerCase()));
  const sharedGoals = (candidate.goals || []).filter((item) => currentGoals.has(item.toLowerCase()));
  let score = 20;
  const reasons = [];

  if (sharedInterests.length) {
    score += Math.min(sharedInterests.length * 15, 35);
    reasons.push(`${sharedInterests.slice(0, 2).join(', ')} interest match`);
  }

  if (sharedGoals.length) {
    score += Math.min(sharedGoals.length * 10, 20);
    reasons.push(`${sharedGoals[0]} goal match`);
  }

  if (sharedEventCount > 0) {
    score += Math.min(sharedEventCount * 15, 30);
    reasons.push('attended similar events');
  }

  if (currentUser.networkingEnabled && candidate.networkingEnabled) {
    score += 15;
    reasons.push('AI networking enabled');
  }

  return {
    match: Math.min(score, 100),
    reason: reasons.length ? reasons.slice(0, 2).join(' and ') : 'Similar EventSphere activity',
    sharedInterests: sharedInterests.slice(0, 3),
  };
};

const buildLevel = (xp) => {
  const current = [...LEVELS].reverse().find((level) => xp >= level.xp) || LEVELS[0];
  const next = LEVELS.find((level) => level.xp > xp) || LEVELS[LEVELS.length - 1];
  const currentBase = current.xp;
  const span = Math.max(next.xp - currentBase, 1);

  return {
    current: current.level,
    currentXp: xp,
    currentLevelXp: currentBase,
    nextLevel: current.level === 10 ? 10 : next.level,
    nextLevelXp: current.level === 10 ? current.xp : next.xp,
    progressPercent: current.level === 10 ? 100 : Math.min(Math.round(((xp - currentBase) / span) * 100), 100),
    xpToNextLevel: current.level === 10 ? 0 : Math.max(next.xp - xp, 0),
    benefit: current.benefit,
    nextBenefit: current.level === 10 ? current.benefit : next.benefit,
  };
};

const calculateRewardSummary = async (user) => {
  const now = new Date();
  const userId = (user._id || user.id).toString();

  const [tickets, organizedEvents, ticketCounts, joinedCommunities, discussionCount, resourceCommunities, explicitConnections] = await Promise.all([
    Ticket.find({ attendee: userId })
      .populate('event', 'title description category eventType venue startDate endDate capacity price organizer networkingEnabled')
      .lean(),
    Event.find({ organizer: userId }).lean(),
    Ticket.aggregate([
      { $match: { status: { $in: ['booked', 'checked-in'] } } },
      { $group: { _id: '$event', sold: { $sum: 1 }, checkedIn: { $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] } } } },
    ]),
    Community.find({ 'members.user': userId }).lean(),
    Discussion.countDocuments({ user: userId }),
    Community.find({ 'resources.uploadedBy': userId }).lean(),
    Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }).lean(),
  ]);

  const soldByEvent = ticketCounts.reduce((acc, item) => {
    acc[item._id.toString()] = { sold: item.sold, checkedIn: item.checkedIn };
    return acc;
  }, {});

  const validTickets = tickets.filter((ticket) => ticket.event);
  const attendedTickets = validTickets.filter((ticket) => ticket.status === 'checked-in');
  const bookedTickets = validTickets.filter((ticket) => ticket.status === 'booked' || ticket.status === 'checked-in');
  const attendedEventIds = attendedTickets.map((ticket) => ticket.event._id);

  const sharedAttendees = attendedEventIds.length
    ? await Ticket.find({
        event: { $in: attendedEventIds },
        attendee: { $ne: userId },
        status: { $in: ['booked', 'checked-in'] },
      }).lean()
    : [];

  const connectionIds = new Set([
    ...sharedAttendees.map((ticket) => ticket.attendee.toString()),
    ...explicitConnections.map((c) => (c.sender.toString() === userId.toString() ? c.receiver.toString() : c.sender.toString())),
  ]);
  const attendedWithFriendCount = new Set(sharedAttendees.map((ticket) => ticket.event.toString())).size;
  const dayStreak = getConsecutiveDayStreak(attendedTickets.map((ticket) => ticket.checkedInAt));
  const weekendEvents = attendedTickets.filter((ticket) => isWeekend(ticket.event.startDate)).length;
  const careerEvents = attendedTickets.filter((ticket) => getEventCategory(ticket.event) === 'Career').length;
  const entertainmentEvents = attendedTickets.filter((ticket) => getEventCategory(ticket.event) === 'Entertainment').length;
  const growthEvents = attendedTickets.filter((ticket) => isCareerGrowthEvent(ticket.event)).length;
  const networkingEvents = attendedTickets.filter((ticket) => ticket.event.networkingEnabled).length;
  const completedOrganizedEvents = organizedEvents.filter((event) => new Date(event.endDate) < now);
  const successfulOrganizedEvents = completedOrganizedEvents.filter((event) => (soldByEvent[event._id.toString()]?.checkedIn || 0) > 0);

  const xpRules = [
    { key: 'signup', label: 'Account Signup', count: 1, xpEach: 20 },
    { key: 'profile', label: 'Complete Profile', count: user.name && user.email ? 1 : 0, xpEach: 30 },
    { key: 'freeEvent', label: 'Attend Free Event', count: attendedTickets.filter((ticket) => Number(ticket.event.price) === 0).length, xpEach: 50 },
    { key: 'paidEvent', label: 'Attend Paid Event', count: attendedTickets.filter((ticket) => Number(ticket.event.price) > 0).length, xpEach: 80 },
    { key: 'careerEvent', label: 'Attend Career Event', count: careerEvents, xpEach: 100 },
    { key: 'entertainmentEvent', label: 'Attend Entertainment Event', count: entertainmentEvents, xpEach: 60 },
    { key: 'weekendEvent', label: 'Attend Weekend Event', count: weekendEvents, xpEach: 40 },
    { key: 'checkin', label: 'Check-In Successfully', count: attendedTickets.length, xpEach: 25 },
    { key: 'joinCommunity', label: 'Join Community', count: joinedCommunities.length, xpEach: 20 },
    { key: 'discussionPost', label: 'Create Discussion', count: discussionCount, xpEach: 15, dailyLimit: 15 },
    { key: 'uploadResource', label: 'Upload Resource', count: resourceCommunities.reduce((total, community) => total + community.resources.filter((resource) => resource.uploadedBy.toString() === userId.toString()).length, 0), xpEach: 25 },
    { key: 'connection', label: 'Connect with attendee', count: connectionIds.size, xpEach: 25, dailyLimit: 10 },
    { key: 'networkingEvent', label: 'Join networking-enabled event', count: networkingEvents, xpEach: 40 },
    { key: 'sameEventConnections', label: 'Attend same event with connections', count: attendedWithFriendCount, xpEach: 30 },
    { key: 'attendWithFriend', label: 'Attend Event With Friend', count: attendedWithFriendCount, xpEach: 40 },
    { key: 'growthBoost', label: 'AI Growth Boost XP', count: growthEvents >= 2 ? 1 : 0, xpEach: 75 },
    { key: 'fiveDayStreak', label: 'Complete 5-Day Streak', count: dayStreak >= 5 ? 1 : 0, xpEach: 100 },
    { key: 'threeDayStreak', label: '3-Day Streak Bonus', count: dayStreak >= 3 ? 1 : 0, xpEach: 50 },
    { key: 'createEvent', label: 'Create Event', count: organizedEvents.length, xpEach: 100 },
    { key: 'successfulEvent', label: 'Successful Event Completion', count: successfulOrganizedEvents.length, xpEach: 200 },
    { key: 'event50', label: 'Event Reaches 50 Attendees', count: organizedEvents.filter((event) => (soldByEvent[event._id.toString()]?.sold || 0) >= 50).length, xpEach: 100 },
    { key: 'event100', label: 'Event Reaches 100 Attendees', count: organizedEvents.filter((event) => (soldByEvent[event._id.toString()]?.sold || 0) >= 100).length, xpEach: 200 },
    { key: 'organizerNetworking', label: 'Enable Networking', count: organizedEvents.filter((event) => event.networkingEnabled).length, xpEach: 50 },
    { key: 'educationalEvent', label: 'Create Educational Event', count: organizedEvents.filter(isEducationalEvent).length, xpEach: 100 },
    { key: 'saveEvent', label: 'Save Event for Later', count: Math.min((user.behavior?.savedEvents || []).length, 5), xpEach: 10 },
  ];

  const xpBreakdown = xpRules
    .map((rule) => ({
      ...rule,
      xp: rule.count * rule.xpEach,
    }))
    .filter((rule) => rule.count > 0);

  const totalXp = xpBreakdown.reduce((total, rule) => total + rule.xp, 0);

  const badges = [
    { name: 'Explorer', description: 'Attend first event', progress: attendedTickets.length, goal: 1 },
    { name: 'Social Starter', description: 'Make first connection', progress: connectionIds.size, goal: 1 },
    { name: 'Community Member', description: 'Join first community', progress: joinedCommunities.length, goal: 1 },
    { name: 'Event Enthusiast', description: 'Attend 10 events', progress: attendedTickets.length, goal: 10 },
    { name: 'Network Builder', description: 'Make 20 connections', progress: connectionIds.size, goal: 20 },
    { name: 'Weekend Explorer', description: 'Attend 5 weekend events', progress: weekendEvents, goal: 5 },
    { name: 'Knowledge Seeker', description: 'Attend 5 career events', progress: careerEvents, goal: 5 },
    { name: 'Top Networker', description: '100+ connections', progress: connectionIds.size, goal: 100 },
    { name: 'Community Leader', description: 'Active in 10 discussions', progress: discussionCount, goal: 10 },
    { name: 'Elite Organizer', description: 'Host 10 successful events', progress: successfulOrganizedEvents.length, goal: 10 },
    { name: 'Opportunity Hunter', description: 'Attend 20 career events', progress: careerEvents, goal: 20 },
    { name: 'Special Streak Badge', description: 'Reach a 7-day streak', progress: dayStreak, goal: 7 },
    { name: 'Premium Badge', description: 'Reach a 30-day streak', progress: dayStreak, goal: 30 },
    { name: 'Balanced Explorer', description: 'Balance career and entertainment events', progress: careerEvents > 0 && entertainmentEvents > 0 ? 1 : 0, goal: 1 },
    { name: 'Meaningful Connection', description: 'Attend events with recurring connections', progress: attendedWithFriendCount, goal: 2 },
  ].map((badge) => ({
    ...badge,
    unlocked: badge.progress >= badge.goal,
  }));

  const availableRewards = [
    { name: '5% Ticket Discount', description: 'Attend 5 events', progress: attendedTickets.length, goal: 5, unlocked: attendedTickets.length >= 5 },
    { name: '10% Ticket Discount', description: 'Attend 10 events', progress: attendedTickets.length, goal: 10, unlocked: attendedTickets.length >= 10 },
    { name: 'VIP Early Access', description: 'Attend 20 events', progress: attendedTickets.length, goal: 20, unlocked: attendedTickets.length >= 20 },
    { name: 'Reduced Platform Fee', description: 'Organise 3 events', progress: organizedEvents.length, goal: 3, unlocked: organizedEvents.length >= 3 },
    { name: 'Premium Rewards', description: 'Reach a 30-day streak', progress: dayStreak, goal: 30, unlocked: dayStreak >= 30 },
    { name: '5% Streak Discount', description: 'Reach a 14-day streak', progress: dayStreak, goal: 14, unlocked: dayStreak >= 14 },
  ];

  const organizerTrustLevel = organizedEvents.length >= 25
    ? 'Elite Organizer'
    : successfulOrganizedEvents.length >= 10
      ? 'Trusted Organizer'
      : successfulOrganizedEvents.length >= 5
        ? 'Verified Organizer'
        : organizedEvents.length >= 1
          ? 'Starter Organizer'
          : 'Not an organizer yet';

  return {
    user: {
      id: userId.toString(),
      name: user.name,
      email: user.email,
    },
    level: buildLevel(totalXp),
    stats: {
      totalXp,
      eventsAttended: attendedTickets.length,
      dayStreak,
      connectionsMade: connectionIds.size,
      eventsOrganized: organizedEvents.length,
      successfulEvents: successfulOrganizedEvents.length,
      weekendEvents,
      careerEvents,
      entertainmentEvents,
    },
    xpBreakdown,
    badges,
    availableRewards,
    organizerTrustLevel,
    levelBenefits: LEVELS,
    antiSpamLimits: [
      { action: 'Save Event XP', limit: '5/day' },
      { action: 'Connection XP', limit: '10/day' },
      { action: 'Discussion XP', limit: '15/day' },
      { action: 'Share XP', limit: '5/day' },
    ],
    aiRewards: [
      {
        name: 'Career Growth Bonus',
        unlocked: growthEvents >= 2,
        description: growthEvents >= 2 ? 'Growth Boost XP applied' : 'Attend workshops, hackathons, or startup events',
      },
      {
        name: 'Wellness Balance Reward',
        unlocked: careerEvents > 0 && entertainmentEvents > 0,
        description: careerEvents > entertainmentEvents + 2 ? 'Try an entertainment event to unlock balance rewards' : 'Balance career and entertainment participation',
      },
      {
        name: 'Networking Success Reward',
        unlocked: attendedWithFriendCount >= 2,
        description: 'Connect, attend the same events, and build meaningful relationships',
      },
    ],
  };
};

exports.getRewardsSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const summary = await calculateRewardSummary(user);
    const users = await User.find().select('name email').limit(20).lean();
    const leaderboardSummaries = await Promise.all(users.map((item) => calculateRewardSummary(item)));
    const leaderboard = leaderboardSummaries
      .map((item) => ({
        userId: item.user.id,
        name: item.user.id === summary.user.id ? 'You' : item.user.name,
        xp: item.stats.totalXp,
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    return res.status(200).json({
      ...summary,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNetworkingSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.networkingEnabled) {
      return res.status(200).json({
        suggestions: [],
        message: 'AI networking is disabled in your profile.',
      });
    }

    const myTickets = await Ticket.find({ attendee: currentUser._id })
      .select('event')
      .lean();
    const myEventIds = myTickets.map((ticket) => ticket.event.toString());
    const sharedTickets = myEventIds.length
      ? await Ticket.find({
          event: { $in: myEventIds },
          attendee: { $ne: currentUser._id },
        }).lean()
      : [];

    const sharedEventsByUser = sharedTickets.reduce((acc, ticket) => {
      const attendeeId = ticket.attendee.toString();
      acc[attendeeId] = (acc[attendeeId] || 0) + 1;
      return acc;
    }, {});

    const candidates = await User.find({
      _id: { $ne: currentUser._id },
      profileVisible: true,
      networkingEnabled: true,
    })
      .select('name email city bio interests goals eventPreference networkingEnabled')
      .limit(30)
      .lean();

    const candidateIds = candidates.map((candidate) => candidate._id);
    const connections = await Connection.find({
      status: 'accepted',
      $or: [
        { sender: currentUser._id, receiver: { $in: candidateIds } },
        { receiver: currentUser._id, sender: { $in: candidateIds } },
      ],
    }).lean();

    const connectionByUser = connections.reduce((acc, connection) => {
      const otherId = connection.sender.toString() === currentUser._id.toString()
        ? connection.receiver.toString()
        : connection.sender.toString();
      acc[otherId] = connection;
      return acc;
    }, {});

    const suggestions = candidates
      .map((candidate) => {
        const existingConnection = connectionByUser[candidate._id.toString()];
        const score = scoreUserMatch({
          currentUser,
          candidate,
          sharedEventCount: sharedEventsByUser[candidate._id.toString()] || 0,
        });

        return {
          id: candidate._id,
          name: candidate.name,
          city: candidate.city,
          bio: candidate.bio,
          interests: candidate.interests || [],
          goals: candidate.goals || [],
          match: score.match,
          reason: score.reason,
          sharedInterests: score.sharedInterests,
          sharedEvents: sharedEventsByUser[candidate._id.toString()] || 0,
          connected: existingConnection?.status === 'accepted' || false,
          following: existingConnection?.following || false,
        };
      })
      .filter((candidate) => candidate.match >= 35)
      .sort((a, b) => b.match - a.match)
      .slice(0, 8);

    return res.status(200).json({ suggestions });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const user = await User.findById(req.user._id || req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const rewards = await calculateRewardSummary(user);
    const userId = user._id;

    const myTickets = await Ticket.find({ attendee: userId })
      .populate('event', 'title description category venue startDate endDate capacity price organizer networkingEnabled')
      .sort({ bookedAt: -1 })
      .lean();

    const validTickets = myTickets.filter((ticket) => ticket.event);
    const bookedEventIds = validTickets.map((ticket) => ticket.event._id);
    const bookedEventIdStrings = new Set(bookedEventIds.map((id) => id.toString()));

    const savedEventIdStrings = new Set((user.behavior?.savedEvents || []).map((id) => id.toString()));

    const attendedTickets = validTickets.filter((ticket) => ticket.status === 'checked-in');
    const attendedCategories = attendedTickets.map((ticket) => getEventCategory(ticket.event));
    const upcomingTickets = validTickets
      .filter((ticket) => ticket.event.startDate && new Date(ticket.event.startDate) >= now)
      .sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate))
      .slice(0, 3);

    const sharedAttendees = bookedEventIds.length
      ? await Ticket.find({
          event: { $in: bookedEventIds },
          attendee: { $ne: userId },
          status: { $in: ['booked', 'checked-in'] },
        })
          .populate('attendee', 'name email')
          .populate('event', 'title')
          .sort({ updatedAt: -1 })
          .lean()
      : [];

    const uniqueConnections = new Map();
    sharedAttendees.forEach((ticket) => {
      if (ticket.attendee?._id) {
        uniqueConnections.set(ticket.attendee._id.toString(), ticket);
      }
    });

    const candidateEvents = await Event.find({
      _id: { $nin: Array.from(bookedEventIdStrings) },
      startDate: { $gte: now },
    })
      .sort({ startDate: 1 })
      .limit(6)
      .lean();

    const ticketCounts = await Ticket.aggregate([
      { $match: { status: { $in: ['booked', 'checked-in'] } } },
      { $group: { _id: '$event', sold: { $sum: 1 } } },
    ]);

    const soldByEvent = ticketCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.sold;
      return acc;
    }, {});

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      stats: {
        ...rewards.stats,
        xpPoints: rewards.stats.totalXp,
      },
      level: rewards.level,
      upcomingEvents: upcomingTickets.map((ticket) => ({
        id: ticket.event._id,
        title: ticket.event.title,
        startDate: ticket.event.startDate,
        attendees: soldByEvent[ticket.event._id.toString()] || 0,
        category: ticket.event.price > 0 ? 'Paid' : 'Free',
      })),
      recommendations: candidateEvents
        .map((event) => {
          const sold = soldByEvent[event._id.toString()] || 0;
          const score = scoreEventForUser({
            event,
            user,
            sold,
            attendedCategories,
          });

          return {
            id: event._id,
            title: event.title,
            match: score.match,
            reason: score.reason,
            isSaved: savedEventIdStrings.has(event._id.toString()),
          };
        })
        .sort((a, b) => b.match - a.match)
        .slice(0, 3),
      networkActivity: Array.from(uniqueConnections.values()).slice(0, 3).map((ticket) => ({
        name: ticket.attendee.name,
        event: ticket.event.title,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.checkInTicket = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({ message: 'Ticket code is required for entry' });
    }

    const ticket = await Ticket.findOne({ ticketCode }).populate('event');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!ticket.event) {
      return res.status(404).json({ message: 'Associated event not found' });
    }

    if (ticket.event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the event organizer can validate entry' });
    }

    if (ticket.status === 'checked-in') {
      return res.status(400).json({ message: 'Ticket has already been used for entry' });
    }

    ticket.status = 'checked-in';
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket verified successfully.',
      ticketId: ticket._id,
      status: ticket.status,
      checkedInAt: ticket.checkedInAt,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventTickets = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can view event tickets' });
    }

    const tickets = await Ticket.find({ event: event._id })
      .populate('attendee', 'name email')
      .lean();

    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(event.price * 100), // amount in smallest currency unit
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(10).toString('hex')}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment verified, now create ticket
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const ticketCode = crypto.randomUUID();
    const qrPayload = buildQrPayload({
      ticketCode,
      eventId: event._id.toString(),
      attendeeId: req.user.id,
    });

    const ticket = await Ticket.create({
      event: event._id,
      attendee: req.user.id,
      ticketCode,
      qrPayload,
      ticketType: req.body.ticketType || 'General',
      amountPaid: Number(event.price) || 0,
    });

    await Notification.create({
      user: req.user.id,
      type: 'ticket',
      title: 'Payment successful',
      message: `Your ticket for ${event.title} is ready.`,
      link: '/app/tickets',
    });

    res.status(201).json({
      message: 'Payment verified and ticket booked successfully',
      ticketId: ticket._id,
      event: event._id,
      ticketCode,
      qrPayload,
      status: ticket.status,
      bookedAt: ticket.bookedAt,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    if (!user || !eventId) {
      return res.status(404).json({ message: 'User or event not found' });
    }

    const saved = user.behavior?.savedEvents || [];
    const exists = saved.some((id) => id.toString() === eventId);

    if (exists) {
      user.behavior.savedEvents = saved.filter((id) => id.toString() !== eventId);
    } else {
      user.behavior.savedEvents = [...saved, eventId];
      await Notification.create({
        user: req.user.id,
        type: 'event',
        title: 'Event saved',
        message: 'We will remind you about this event.',
        link: `/app/event/${eventId}`,
      });
    }

    await user.save();
    return res.status(200).json({ saved: !exists, savedEvents: user.behavior.savedEvents });
  } catch (error) {
    next(error);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('behavior.savedEvents')
      .lean();

    return res.status(200).json(user?.behavior?.savedEvents || []);
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const rating = Number(req.body.rating);
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    event.reviews = (event.reviews || []).filter((review) => review.user.toString() !== req.user.id);
    event.reviews.push({
      user: req.user.id,
      rating,
      comment: String(req.body.comment || '').trim(),
    });
    await event.save();

    return res.status(201).json(event.reviews[event.reviews.length - 1]);
  } catch (error) {
    next(error);
  }
};

exports.generateDescription = async (req, res) => {
  const bullets = Array.isArray(req.body.bullets)
    ? req.body.bullets.map((item) => String(item).trim()).filter(Boolean)
    : String(req.body.bullets || '').split('\n').map((item) => item.trim()).filter(Boolean);

  const title = String(req.body.title || 'EventSphere event').trim();
  const highlights = bullets.slice(0, 5);

  return res.status(200).json({
    description: `${title} brings together attendees for a focused, high-value experience. ${highlights.join(' ')} Expect practical takeaways, meaningful networking, and a polished event flow designed for both learning and connection.`,
    highlights,
    marketingCopy: `Join ${title} for curated sessions, smart networking, and moments worth sharing.`,
  });
};

exports.buildSmartSchedule = async (req, res) => {
  const sessions = Array.isArray(req.body.sessions) ? req.body.sessions : [];
  const ordered = sessions
    .map((session, index) => ({ ...session, order: index + 1 }))
    .sort((a, b) => {
      const score = (value) => /keynote|opening/i.test(value.title || '') ? 0 : /break|lunch/i.test(value.title || '') ? 2 : 1;
      return score(a) - score(b);
    })
    .map((session, index) => ({
      ...session,
      suggestedTime: `${String(10 + index).padStart(2, '0')}:00`,
      reason: /break|lunch/i.test(session.title || '') ? 'Placed after focused sessions for audience flow' : 'Optimized for attention and continuity',
    }));

  return res.status(200).json({
    schedule: ordered,
    suggestions: [
      'Start with a high-energy session.',
      'Place breaks after dense learning blocks.',
      'End with networking or Q&A for retention.',
    ],
  });
};

exports.getOrganizerIntelligence = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).lean();
    const eventIds = events.map((event) => event._id);
    const tickets = await Ticket.find({ event: { $in: eventIds } })
      .populate('attendee', 'city interests goals')
      .lean();

    const checkedIn = tickets.filter((ticket) => ticket.status === 'checked-in').length;
    const sold = tickets.length;
    const revenue = tickets.reduce((total, ticket) => total + Number(ticket.amountPaid || 0), 0);
    const interests = {};
    tickets.forEach((ticket) => (ticket.attendee?.interests || []).forEach((interest) => {
      interests[interest] = (interests[interest] || 0) + 1;
    }));

    const healthScore = Math.min(100, Math.round((sold * 8) + (checkedIn * 12) + (events.length * 5)));

    return res.status(200).json({
      summary: { events: events.length, sold, checkedIn, revenue, healthScore },
      audienceInterests: Object.entries(interests).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count })),
      bestTimingSuggestions: ['Weekend evenings for entertainment events', 'Weekday late afternoons for career events'],
      improvementSuggestions: [
        sold < events.reduce((sum, event) => sum + Number(event.capacity || 0), 0) * 0.4 ? 'Add early bird pricing or community promotion.' : 'Maintain current promotion cadence.',
        checkedIn < sold * 0.5 ? 'Send reminder notifications before event day.' : 'Check-in flow is healthy.',
      ],
    });
  } catch (error) {
    next(error);
  }
};
