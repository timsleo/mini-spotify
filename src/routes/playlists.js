import express from 'express';
import auth from '../middleware/auth.js';
import Playlist from '../models/Playlist.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

router.post('/', [auth, [
  check('name', 'Name is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const playlist = await Playlist.create({
      name: req.body.name,
      userId: req.user.userId
    });
    res.json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:playlistId/songs/:songId', auth, async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const userId = req.user.userId;
    console.log('Received playlistId:', playlistId, 'Type:', typeof playlistId);
    console.log('Received userId:', userId);
    console.log('Received songId:', songId, 'Type:', typeof songId);
    const updatedPlaylist = await Playlist.addSong(playlistId, songId, userId);
    res.json(updatedPlaylist);
  } catch (err) {
    console.error('Error in playlist route:', err);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.getUserPlaylists(req.user.userId);
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    const updatedPlaylist = await Playlist.update(id, { name }, userId);
    res.json(updatedPlaylist);
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await Playlist.delete(id, userId);
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).send('Server error');
  }
});

export default router;