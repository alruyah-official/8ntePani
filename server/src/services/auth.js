const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
  createUser,
  findUserByEmail,
  findUserById,
};