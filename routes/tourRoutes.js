const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  // checkID,
  // confirmCreateTourFields,
} = tourController;
const authController = require('../controllers/authController');
const { isAuthenticated, restrictTo } = authController;
// const reviewController = require('../controllers/reviewController');
// const { createReview } = reviewController;
const reviewRouter = require('./reviewRoutes');
// NESTED ROUTES EXAMPLE:
// POST /tour/:user_id/reviews
// GET /tour/:tour_id/reviews
// GET /tour/:tour_id/reviews/:review_id
// not best practice as it creates a review under tour routes - use review router instead
// router
//   .route('/:tourId/reviews')
//   .post(isAuthenticated, restrictTo('user'), createReview);

router.use('/:tourId/reviews', reviewRouter);

// if route is very popular & commonly used, can use below:
// i.e., localhost:8000/api/v1/tours?limit=5&sort=-ratingsAverange,price (top 5 rated and cheapest)
// best to use middleware
router.route('/top-5-cheap').get(aliasTopTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

// router.param('id', checkID);
router
  .route('/')
  .get(isAuthenticated, getAllTours)
  .post(isAuthenticated, restrictTo('admin'), createTour);
router
  .route('/:id')
  .get(getTour)
  .delete(isAuthenticated, restrictTo('admin', 'lead-guide'), deleteTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
