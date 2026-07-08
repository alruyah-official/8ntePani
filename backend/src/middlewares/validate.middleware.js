/**
 * Middleware factory for validating request bodies using Zod schemas.
 * Returns 400 with a list of extracted error messages on validation failure.
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = result.data;
    next();
  };
};
