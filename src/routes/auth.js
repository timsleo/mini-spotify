import express from 'express';
import auth from '../middleware/auth.js';
import { register, login, updateUser } from '../controllers/authController.js';
import { userValidators } from '../utils/validators.js';

const router = express.Router();

router.post('/register', userValidators.register, register);
router.post('/login', userValidators.login, login);
router.put('/update', auth, updateUser);

router.delete('/delete', auth, async (req, res, next) => {
    try {
      const userId = req.user.userId;
  
      // Remover o usuário do banco
      await User.delete(userId);
  
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  });
  
export default router;