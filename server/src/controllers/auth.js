const authService = require('../services/auth');
const User = require('../models/user');

// ── helpers ──────────────────────────────────────────────────────────────────

const generateUsername = async (base) => {
  let username = base.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  if (!username) username = `user${Date.now()}`;

  let unique = username;
  let counter = 1;
  while (await User.exists({ username: unique })) {
    unique = `${username}${counter}`;
    counter += 1;
  }
  return unique;
};

/**
 * Strip password and return a safe user object.
 * Mongoose's toObject() transform already removes password & __v,
 * but we call it explicitly here in case toObject isn't wired.
 */
const safeUser = (user) => {
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

// ── signup ────────────────────────────────────────────────────────────────────

const signup = async (req, res) => {
  try {
    const data = req.body; // Already validated by validateBody middleware

    const existingUser = await authService.findUserByEmail(data.email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    if (!data.username) {
      data.username = await generateUsername(data.email.split('@')[0] || data.name);
    }

    const user = await authService.createUser(data);
    const token = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.status(201).json({
      token,
      refreshToken,
      user: safeUser(user),
      message: 'Account created successfully',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── login ─────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email, true /* include password */);
    if (!user || !(await authService.comparePassword(password, user.password))) {
      // Generic message — don't reveal which field is wrong
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    // Flat shape: { token, refreshToken, user }
    // Client reads data.token / data.user after Axios unwraps response.data
    res.json({
      token,
      refreshToken,
      user: safeUser(user),
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

// ── refresh token ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Returns a new access token (and rotates the refresh token).
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    let decoded;
    try {
      decoded = authService.verifyRefreshToken(token);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        message: isExpired ? 'Refresh token has expired. Please log in again.' : 'Invalid refresh token.',
        code: isExpired ? 'REFRESH_TOKEN_EXPIRED' : 'REFRESH_TOKEN_INVALID',
      });
    }

    const user = await authService.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    // Issue new tokens (rotation)
    const newAccessToken = authService.generateToken(user);
    const newRefreshToken = authService.generateRefreshToken(user);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not refresh token.' });
  }
};

// ── logout ────────────────────────────────────────────────────────────────────

const logout = async (req, res) => {
  // Stateless JWT: no server-side session to destroy.
  // If you add a refresh-token denylist (Redis) in the future, invalidate here.
  res.json({ message: 'Logged out successfully' });
};

// ── me ────────────────────────────────────────────────────────────────────────

const me = async (req, res) => {
  res.json({ user: req.user, message: 'Success' });
};

// ── updatePassword ─────────────────────────────────────────────────────────────

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await authService.findUserById(req.user.id, true);
    if (!user || !(await authService.comparePassword(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    const hashedPassword = await authService.hashPassword(newPassword);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ── forgotPassword ────────────────────────────────────────────────────────────

const forgotPassword = async (req, res) => {
  // TODO: generate a secure reset token, store expiry, send email via nodemailer/sendgrid
  res.json({ message: 'If this email is registered, a reset link has been sent.' });
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  me,
  updatePassword,
  forgotPassword,
};