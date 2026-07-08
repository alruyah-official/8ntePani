import { registerUser, loginUser } from '../services/auth.service.js';

/**
 * POST /api/auth/register
 * Creates a new user account.
 * Expects: { name, email, password, role } in req.body
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await registerUser(name, email, password, role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Registration failed',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a signed JWT.
 * Expects: { email, password } in req.body
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed',
      error: error.message,
    });
  }
};
