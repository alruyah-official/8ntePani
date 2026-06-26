/**
 * restrictTo(...roles) — Role-based access control middleware factory.
 *
 * Usage: router.post('/route', protect, restrictTo('FREELANCER'), controller)
 *
 * Returns a middleware that reads req.user.role (set by the protect middleware)
 * and blocks the request with 403 if the role is not in the allowed list.
 *
 * @param  {...string} roles - One or more allowed roles, e.g. 'CLIENT', 'FREELANCER'
 * @returns {Function} Express middleware
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action',
        error: 'FORBIDDEN',
      });
    }
    next();
  };
};
