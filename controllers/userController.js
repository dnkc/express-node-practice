const catchAsync = require('../utils/catchAsync');
const UserSchema = require('../models/userSchema');
const AppError = require('../utils/appError');
const { User } = UserSchema;
const Factory = require('./handleFactory');
const { deleteOne, updateOne, getOne, getAll } = Factory;

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // loop through object
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = getAll(User);

// user updates themselves
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email'); // fields you want to keep from the body, discard others
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody, // mmust restrict which fields can be updated by user, i.e. they can not make themselves an admin
    {
      new: true, // returns updated object
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use sign up instead.',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = getOne(User);

// admin updates only - do not use to allow users to update own passwords
exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);
