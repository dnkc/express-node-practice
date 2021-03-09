// const fs = require('fs');
// // import file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const tourSchema = require('../models/tourSchema');
const { Tour } = tourSchema;

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    // 3) ADVANCED FILTERING - SORTING BY PRICE
    if (this.queryString.sort) {
      const sortBy = req.query.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
      // if two docs have same price, can use:
      // sort('price ratingsAverage')
    } else {
      // default sorting
      this.query = this.query.sort('-createdAt'); // sort by newest first
    }
    return this;
  }
  limitFields() {
    // 4) ADVANCED FILTERING - FIELD LIMITING
    if (this.queryString.fields) {
      const fields = req.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // default in case user does not specify fields
      this.query = this.query.select('-__v'); // excludes the field __v
    }
    return this;
  }
  paginate() {
    // 5) PAGINATION using API
    const page = this.queryString.page * 1 || 1; // convert string to number by *1 , default page 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // localhost:8000/api/v1/tours?page=2&limit=10
    // 1-10 for page 1, 11-20 for page 2, etc...
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}

// top 5 cheapest
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = async (req, res) => {
  console.log(req.query);

  //BUILD A QUERY
  //create a copy of query object so it is not referenced
  try {
    // 1) FILTERING BY QUERY
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // {difficulty: 'easy', duration: {$gte: 5}}
    // 2) ADVANCED FILTERING - greater than equal to, greater than, lesser than or equal to, lesser than

    // convert query object to string
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));
    // // 3) ADVANCED FILTERING - SORTING BY PRICE
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');

    //   query = query.sort(sortBy);
    //   // if two docs have same price, can use:
    //   // sort('price ratingsAverage')
    // } else {
    //   // default sorting
    //   query = query.sort('-createdAt'); // sort by newest first
    // }

    // // 4) ADVANCED FILTERING - FIELD LIMITING
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   // default in case user does not specify fields
    //   query = query.select('-__v'); // excludes the field __v
    // }

    // // 5) PAGINATION using API
    // const page = req.query.page * 1 || 1; // convert string to number by *1 , default page 1
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // // localhost:8000/api/v1/tours?page=2&limit=10
    // // 1-10 for page 1, 11-20 for page 2, etc...
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    // EXECUTE A QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
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
      runValidators: true,
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

module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  // checkID,
  // confirmCreateTourFields,
  updateTour,
  aliasTopTours,
};
