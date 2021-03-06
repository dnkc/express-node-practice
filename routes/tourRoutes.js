const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  checkID,
  confirmCreateTourFields,
} = tourController;

router.param('id', checkID);
router.route('/').get(getAllTours).post(confirmCreateTourFields, createTour);
router.route('/:id').get(getTour).delete(deleteTour);

module.exports = router;
