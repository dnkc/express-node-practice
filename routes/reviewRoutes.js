const express = require('express');
// mergeParams required bc it is called from tourRoutes (i.e., to pass tourId to reviewRoutes)
const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const { isAuthenticated, restrictTo } = authController;

const reviewController = require('../controllers/reviewController');
const { getAllReviews, getReview, createReview } = reviewController;

router
  .route('/')
  .get(getAllReviews)
  // POST /tour/:tourId/reviews
  // POST /reviews
  .post(isAuthenticated, restrictTo('user'), createReview);

router.route('/:id').get(getReview);

module.exports = router;
