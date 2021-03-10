const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
require('dotenv').config({ path: (__dirname, './config.env') });
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
//middleware
// middleware is executed in order it is placed
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));

// routes
const tourRouter = require('./routes/tourRoutes');
app.use('/api/v1/tours', tourRouter);
const userRouter = require('./routes/userRoutes');
app.use('/api/v1/users', userRouter);

// bad route middleware
// to handle all routes (post, get, etc) can use app.all with * to catch all routes
app.all('*', (req, res, next) => {
  //   const err = new Error(`Can not find ${req.originalUrl}`);
  //   err.status = 'fail';
  //   err.statusCode = 404;

  // IF NEXT IS EVER GIVEN AN ARGUMENT IT WILL ASSUME IT IS AN ERROR AND BE SENT TO ERROR HANDLING MIDDLEWARE
  next(new AppError(`Can not find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
