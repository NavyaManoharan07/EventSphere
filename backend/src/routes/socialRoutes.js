const express = require('express');
const router = express.Router();
const {
  connectWithUser,
  toggleFollowUser,
  getSocialProfile,
  createPost,
  getFeed,
} = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/feed', getFeed);
router.post('/posts', createPost);
router.get('/profile/:userId', getSocialProfile);
router.post('/connections/:userId/connect', connectWithUser);
router.post('/connections/:userId/follow', toggleFollowUser);

module.exports = router;
