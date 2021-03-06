const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
require('dotenv').config({ path: (__dirname, './config.env') });
//middleware
app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(`${__dirname}/public`));

// routes
const tourRouter = require('./routes/tourRoutes');
app.use('/api/v1/tours', tourRouter);
const userRouter = require('./routes/userRoutes');
app.use('/api/v1/users', userRouter);

module.exports = app;
