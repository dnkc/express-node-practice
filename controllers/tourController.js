// const fs = require('fs');
// // import file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
const API_FEATURES = require('../utils/apiFeatures');
const { APIFeatures } = API_FEATURES;
const tourSchema = require('../models/tourSchema');
const { Tour } = tourSchema;

// top 5 cheapest
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = async (req, res) => {
  console.log(req.query);
  try {
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
  } catch (err) {
    console.log(err);
  }
};

// route handlers
const getTour = async (req, res) => {
  console.log(req.params);
  // const id = req.params.id * 1; // the *1 converts it to an integer
  // const tour = tours.find((el) => el.id === id);
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id})
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'ID not found',
    });
  }
};

const createTour = async (req, res) => {
  const newTour = await Tour.create(req.body);
  try {
    newTour.save();
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // sends updated document to client
      runValidators: true, // runs validators upon update of document (min, max length, etc)
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

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
const getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// get monthly tours
const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

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
