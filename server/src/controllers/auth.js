const { z } = require('zod');
const authService = require('../services/auth');
const User = require('../models/user');

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

const signup = async (req, res) => {
  try {
    const data = req.body; // Already validated
    const existingUser = await authService.findUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (!data.username) {
      data.username = await generateUsername(data.email.split('@')[0] || data.name);
    }

    const user = await authService.createUser(data);
    const token = authService.generateToken(user);
    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({ data: { user: userObject, token }, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email, true);
    if (!user || !(await authService.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = authService.generateToken(user);
    const userObject = user.toObject();
    delete userObject.password;
    res.json({ data: { user: userObject, token }, message: 'Login successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const me = async (req, res) => {
  res.json({ data: req.user, message: 'Success' });
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await authService.findUserById(req.user.id, true);
    if (!user || !(await authService.comparePassword(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await authService.hashPassword(newPassword);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  // Placeholder: implement email sending
  res.json({ message: 'Password reset email sent' });
};

module.exports = {
  signup,
  login,
  logout,
  me,
  updatePassword,
  forgotPassword,
};