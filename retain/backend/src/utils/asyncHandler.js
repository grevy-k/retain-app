// Wraps an async route so any thrown error goes to our error middleware
// instead of crashing the request or leaving it hanging.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};