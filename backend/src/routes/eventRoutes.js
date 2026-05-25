const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  bookTicket,
  getMyTickets,
  getDashboardSummary,
  getRewardsSummary,
  getNetworkingSuggestions,
  checkInTicket,
  getEventTickets,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my/tickets', protect, getMyTickets);
router.get('/dashboard/summary', protect, getDashboardSummary);
router.get('/rewards/summary', protect, getRewardsSummary);
router.get('/networking/suggestions', protect, getNetworkingSuggestions);
router.post('/checkin', protect, checkInTicket);
router.get('/', getEvents);
router.post('/', protect, createEvent);
router.get('/:eventId', getEventById);
router.post('/:eventId/book', protect, bookTicket);
router.get('/:eventId/tickets', protect, getEventTickets);

module.exports = router;
