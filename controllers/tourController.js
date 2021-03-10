// const fs = require('fs');
// // import file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
const API_FEATURES = require('../utils/apiFeatures');
const { APIFeatures } = API_FEATURES;
const tourSchema = require('../models/tourSchema');
const { Tour } = tourSchema;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// top 5 cheapest
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const checkForIDError = (tour, type) => {
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  } else if (type === 'upd') {
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } else if (type === 'del') {
    res.status(204).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } else if (type === 'getTour') {
    res.status(200).json({
      // status: 'success',
      // data: {
      //   tour,
      // },
      status: 'success',
      data: {
        tour,
      },
    });
  }
};

const getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  // EXECUTE A QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // can now copy this to other uses, and just do not include one (say .sort or .filter)
  // can chain methods bc this is returned in each

  const allTours = await features.query;
  // possibly queries: query.sort.select().skip().limit()

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: allTours.length,
    data: {
      tours: allTours,
    },
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
});

// route handlers
const getTour = catchAsync(async (req, res, next) => {
  // const id = req.params.id * 1; // the *1 converts it to an integer
  // const tour = tours.find((el) => el.id === id);
  const tour = await Tour.findById(req.params.id);
  checkForIDError(tour, 'getTour');
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  newTour.save();
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });

  // try {

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  checkForIDError(tour, 'del');
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // sends updated document to client
    runValidators: true, // runs validators upon update of document (min, max length, etc)
  });
  checkForIDError(tour, 'upd');
});

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
};
