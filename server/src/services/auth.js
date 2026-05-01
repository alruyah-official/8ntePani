const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

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
  return await prisma.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    },
  });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  createUser,
  findUserByEmail,
};