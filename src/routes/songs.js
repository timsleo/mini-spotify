import express from 'express';
import auth from '../middleware/auth.js';
import Song from '../models/Song.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

router.post('/', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('artist', 'Artist is required').not().isEmpty(),
  check('duration', 'Duration is required').isNumeric()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const song = await Song.create({
      ...req.body,
      userId: req.user.userId
    });
    res.json(song);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;