// asyncHandler is a wrapper for async route handlers. It catches any errors and passes them to Express's error handler.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};