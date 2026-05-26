const User = require('../models/User');

const XP_RULES = {
  signup: 20,
  profile: 30,
  freeEvent: 50,
  paidEvent: 80,
  careerEvent: 100,
  entertainmentEvent: 60,
  weekendEvent: 40,
  checkin: 25,
  joinCommunity: 20,
  discussionPost: 15,
  uploadResource: 25,
  connection: 25,
  networkingEvent: 40,
  sameEventConnections: 30,
  attendWithFriend: 40,
  growthBoost: 75,
  threeDayStreak: 50,
  fiveDayStreak: 100,
  createEvent: 100,
  successfulEvent: 200,
  event50: 100,
  event100: 200,
  organizerNetworking: 50,
  educationalEvent: 100,
};

const LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 200 },
  { level: 3, xp: 500 },
  { level: 4, xp: 900 },
  { level: 5, xp: 1500 },
  { level: 6, xp: 2500 },
  { level: 7, xp: 4000 },
  { level: 8, xp: 6000 },
  { level: 9, xp: 8500 },
  { level: 10, xp: 12000 },
];

const calculateLevel = (totalXp) => {
  let level = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xp) {
      level = LEVELS[i].level;
      break;
    }
  }
  return level;
};

const addXp = async (userId, ruleKey) => {
  const xpAmount = XP_RULES[ruleKey] || 0;
  if (xpAmount === 0) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  user.xp = (user.xp || 0) + xpAmount;
  user.level = calculateLevel(user.xp);
  
  await user.save();
  return user;
};

module.exports = {
  XP_RULES,
  LEVELS,
  calculateLevel,
  addXp,
};
