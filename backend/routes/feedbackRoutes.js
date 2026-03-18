const express = require('express');
const router = express.Router();

const {
  createFeedback,
  getFeedbacks,
  getNumberOfFeedbacks,
} = require('../controllers/feedbackController');

router.post('/', createFeedback);
router.get('/', getFeedbacks);
router.get('/count', getNumberOfFeedbacks);

module.exports = router;
