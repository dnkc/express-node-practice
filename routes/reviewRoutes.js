const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isAuthenticated, restrictTo } = authController;

const reviewController = require('../controllers/reviewController');
const { getAllReviews, getReview, createReview } = reviewController;

router
  .route('/')
  .get(getAllReviews)
  .post(isAuthenticated, restrictTo('user'), createReview);

router.route('/:id').get(getReview);

module.exports = router;
