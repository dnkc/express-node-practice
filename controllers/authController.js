const { promisify } = require('util'); // allows you to promise-ify methods that are not promises
const UserSchema = require('../models/userSchema');
const { User } = UserSchema;
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  // correctPassword is async
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

const isAuthenticated = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) Token verification
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded', decoded);
  // 3) Check if user still exists
  // check if user is removed or password changed after issuing token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // grant access to protected route
  req.user = currentUser; // allows data to be available at a later point
  next();
});

// normally CAN NOT pass arguments to middleware
const restrictTo = (...roles) => {
  // roles is an array i.e., ['admin', 'lead-guide']. role='user' therefore user does not have permission
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with eamil address', 404));
  }
  // 2) generate random reset token
  const resetToken = user.createPasswordResetToken();
  // above line only modifies user info, must save
  await user.save({ validateBeforeSave: false });
  // 3) Send it to users email
});

const resetPassword = (req, res, next) => {};

module.exports = {
  signUp,
  login,
  isAuthenticated,
  restrictTo,
  forgotPassword,
  resetPassword,
};
