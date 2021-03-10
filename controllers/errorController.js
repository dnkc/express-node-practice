// error handling middleware
// requires 4 parameters for express to recognize it as error handling middleware
module.exports = (err, req, res, next) => {
  //   console.log(err.stack); // shows where error happened
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // 500 = error
  // 400 = fail

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
