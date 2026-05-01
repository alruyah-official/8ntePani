const { z } = require('zod');
const authService = require('../services/auth');
const prisma = require('../config/database');

const signup = async (req, res) => {
  try {
    const data = req.body; // Already validated
    const existingUser = await authService.findUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await authService.createUser(data);
    const token = authService.generateToken(user);
    res.status(201).json({ data: { user, token }, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user || !(await authService.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = authService.generateToken(user);
    res.json({ data: { user, token }, message: 'Login successful' });
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
    if (!(await authService.comparePassword(currentPassword, req.user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await authService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });
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