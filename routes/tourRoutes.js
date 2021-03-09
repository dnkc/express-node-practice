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
  // checkID,
  // confirmCreateTourFields,
} = tourController;

// if route is very popular & commonly used, can use below:
// i.e., localhost:8000/api/v1/tours?limit=5&sort=-ratingsAverange,price (top 5 rated and cheapest)
// best to use middleware
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// router.param('id', checkID);
router.route('/').get(getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .delete(deleteTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
