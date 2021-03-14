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
