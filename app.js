const express = require('express');
const router = express.Router();
const fs = require('fs');
const app = express();
const morgan = require('morgan');
require('dotenv').config({ path: (__dirname, './config.env') });
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// express-rate-limit prevents too many requests from one IP address
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//middleware
// middleware is executed in order it is placed
// 1) GLOBAL MIDDLEWARE

// best to use helmet at beginning of stack
// helmet is for setting security HTTP Headers
app.use(helmet());

// development logging of routes
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limits requests from same IP for API
const limiter = rateLimit({
  max: 100, // 100 requests per hour
  windowMs: 60 * 60 * 1000, // 60 minutes 60 seconds 1000 ms
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter); // affects only routes that start with /api

// body parser, reading data from body into req.body
app.use(
  express.json({
    // can limit amount of data that comes into body
    limit: '10kb', // does not accept anything larger than 10kb
  })
);

// data sanitzation against NoSQL query injection
app.use(mongoSanitize()); // looks at request, request body, and request params and removes all $ and . characters
// data sanitzation against XSS
app.use(xss()); // cleans user input from malicious HTML and JS code

// prevents http parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // will allow multiple duration fields in route, not others (such as sort)
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// ROUTES
// REST routes
//tours
const tourRouter = require('./routes/tourRoutes');
app.use('/api/v1/tours', tourRouter);
//users
const userRouter = require('./routes/userRoutes');
app.use('/api/v1/users', userRouter);
//reviews
const reviewRouter = require('./routes/reviewRoutes');
app.use('/api/v1/reviews', reviewRouter);

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
