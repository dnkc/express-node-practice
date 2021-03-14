const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/reviewSchema');

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  console.log(review);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  newReview.save();
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

module.exports = {
  getAllReviews,
  getReview,
  createReview,
};
