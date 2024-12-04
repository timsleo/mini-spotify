import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js'; // Atualizado para usar import
import { ErrorResponse } from '../utils/errorHandler.js'; // Atualizado para usar import

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
    console.log('Update user request received:', req.body);
    console.log('Authenticated user ID:', req.user.userId);
    const { name, email, password } = req.body;
    const userId = req.user.userId; // Extraído do token JWT pelo middleware

    // Criar um objeto para armazenar os dados a serem atualizados
    let updatedData = {};

    // Atualizar os campos permitidos
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
    // Adicionar log para verificar o conteúdo de `updatedData`
    console.log('Updated data before updating user:', updatedData);

    // Verificar se há dados para atualizar
    if (Object.keys(updatedData).length === 0) {
    return res.status(400).json({ success: false, error: 'No data to update' });
    }

    // Salvar as alterações no banco
    const updatedUser = await User.update(userId, updatedData);

    res.json({
      success: true,
      data: updatedData,
    });
  } catch (err) {
    next(err);
  }
};

export { register, login, updateUser };