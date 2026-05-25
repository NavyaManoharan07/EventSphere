const express = require('express');
const router = express.Router();
const {
  getCommunities,
  createCommunity,
  joinCommunity,
  getCommunityFeed,
  createDiscussion,
  uploadResource,
  getCommunitySuggestions,
  createConnection,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCommunities);
router.post('/', protect, createCommunity);
router.post('/:communityId/join', protect, joinCommunity);
router.get('/:communityId/feed', protect, getCommunityFeed);
router.get('/:communityId/suggestions', protect, getCommunitySuggestions);
router.post('/discussions', protect, createDiscussion);
router.post('/resources', protect, uploadResource);
router.post('/connections', protect, createConnection);

module.exports = router;
