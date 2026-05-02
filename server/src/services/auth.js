const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BCRYPT_SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Access token — short-lived (7d), includes id, email, and role.
 * The role is embedded so the middleware can authorize without a DB round-trip.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Refresh token — long-lived (30d), signed with a separate secret.
 * Store the hashed version in the DB; only the plaintext is sent to the client.
 */
const generateRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
  return jwt.sign(
    { id: user.id },
    secret,
    { expiresIn: '30d' }
  );
};

const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
  return jwt.verify(token, secret);
};

const createUser = async (data) => {
  const hashedPassword = await hashPassword(data.password);
  const user = new User({
    ...data,
    email: data.email.toLowerCase(),
    password: hashedPassword,
  });
  return await user.save();
};

const findUserByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) query.select('+password');
  return await query;
};

const findUserById = async (id, includePassword = false) => {
  const query = User.findById(id);
  if (includePassword) query.select('+password');
  return await query;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
};