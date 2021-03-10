const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
require('dotenv').config({ path: (__dirname, './config.env') });

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
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can not find ${req.originalUrl}`,
  });
});

module.exports = app;
