// used to catch async errors
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // sends async error to global error handler
  };
};
