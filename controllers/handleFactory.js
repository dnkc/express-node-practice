// REFERENCE FUNCTION:
// const deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//       return next(new AppError('No tour found with that ID', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   });

// const getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

// });

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const API_FEATURES = require('../utils/apiFeatures');
const { APIFeatures } = API_FEATURES;

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // sends updated document to client
      runValidators: true, // runs validators upon update of document (min, max length, etc)
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    newDoc.save();
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // filter variable is to allow nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    // console.log(req.query);
    // EXECUTE A QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // can now copy this to other uses, and just do not include one (say .sort or .filter)
    // can chain methods bc this is returned in each

    // const allDocs = await features.query.explain();
    const allDocs = await features.query;
    // possibly queries: query.sort.select().skip().limit()

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: allDocs.length,
      data: {
        data: allDocs,
      },
      // results: tours.length,
      // data: {
      //   tours,
      // },
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
