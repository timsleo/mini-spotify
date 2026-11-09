import express from 'express';
import auth from '../middleware/auth.js';
import { register, login, updateUser, deleteUser } from '../controllers/authController.js';
import { userValidators } from '../utils/validators.js';

const router = express.Router();

router.post('/register', userValidators.register, register);
router.post('/login', userValidators.login, login);
router.put('/update', auth, updateUser);
router.delete('/delete', auth, deleteUser);

export default router;
