// const fs = require('fs');
// // import file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const tourSchema = require('../models/tourSchema');
const { Tour } = tourSchema;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handleFactory');
const { deleteOne, updateOne, createOne, getOne, getAll } = Factory;

// top 5 cheapest
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// const getAllTours = catchAsync(async (req, res, next) => {
//   // console.log(req.query);
//   // EXECUTE A QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   // can now copy this to other uses, and just do not include one (say .sort or .filter)
//   // can chain methods bc this is returned in each

//   const allTours = await features.query;
//   // possibly queries: query.sort.select().skip().limit()

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: allTours.length,
//     data: {
//       tours: allTours,
//     },
//     // results: tours.length,
//     // data: {
//     //   tours,
//     // },
//   });
// });
const getAllTours = getAll(Tour);

// route handlers
// const getTour = catchAsync(async (req, res, next) => {
//   // const id = req.params.id * 1; // the *1 converts it to an integer
//   // const tour = tours.find((el) => el.id === id);
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   console.log(tour);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     // status: 'success',
//     // data: {
//     //   tour,
//     // },
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
const getTour = getOne(Tour, 'reviews');

const createTour = createOne(Tour);

const deleteTour = deleteOne(Tour);

const updateTour = updateOne(Tour);

// const testTour = new Tour({
//   name: 'The Park Camper1',
//   rating: 3.7,
//   price: 299,
// });

// testTour.save().then((doc) => {
//   console.log(doc);
// });

// const checkID = (req, res, next, val) => {
//   console.log(`Tour ID ${val} is valid`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// const confirmCreateTourFields = (req, res, next) => {
//   if (req.body.name && req.body.price) {
//     next();
//   } else {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Name and price of tour required',
//     });
//   }
// };

// calculates statistics about tours
// using MONGO aggregation feature
const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // select or filter certain documents in mongoDB
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' }, // will separate below stats based on difficulty
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgrating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // NOT EQUAL TO "EASY"
    // },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

// get monthly tours
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      // deconstructs array fields from input docs and output one doc for each element of array
      $unwind: '$startDates',
    },
    {
      // filter between these dates below
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // separate them by month
        _id: { $month: '$startDates' },
        // count how many tours per month
        numTourStarts: { $sum: 1 },
        // which tours are in each month
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0, // id will no longer show up, if 1 then it would
      },
    },
    {
      $sort: { numTourStarts: -1 }, // sort by number of tours starting per month, -1 for descending
    },
    {
      $limit: 12, // limits the amount of outputs
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

// '/tours-within/:distance/center/:latlng/unit/:unit',
// /tours-within/233/center/-40,45/unit/mi
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // distance needs to be in radians for geospatial query
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  // filter by tour start location
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// /distances/:latlng/unit/:unit
const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    // one stage for geospatial aggregation
    {
      // geoNear must always be first in pipeline
      // requires that one of our fields contain a geospatial index (i.e., startLocation: 2dsphere)
      // by default uses the only one with geospatial index, need to specify if more than one
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // multiply by 1 to convert to number
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      // which fields we want to keep for output
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

module.exports = {
  getAllTours,
  getTourStats,
  getTour,
  getMonthlyPlan,
  createTour,
  deleteTour,
  // checkID,
  // confirmCreateTourFields,
  updateTour,
  aliasTopTours,
  getToursWithin,
  getDistances,
};
