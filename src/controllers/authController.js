import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { ErrorResponse } from '../utils/errorHandler.js';

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse('Validation error', 400));
  }

  try {
    const { email, password, name } = req.body;
    let user = await User.findByEmail(email);

    if (user) {
      return next(new ErrorResponse('User already exists', 400));
    }

    user = await User.create({ email, password, name });
    
    const token = generateToken(user.id);
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse('Validation error', 400));
  }

  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = generateToken(user.id);
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.userId;

    const updatedData = {};
    if (name){
      updatedData.name = name;
    } 
    if (email){
      updatedData.email = email;
    } 
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ success: false, error: 'No data to update' });
    }

    const updatedUser = await User.update(userId, updatedData);

    // Nunca devolver o hash da senha
    res.json({
      success: true,
      data: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.delete(req.user.userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export { register, login, updateUser, deleteUser };