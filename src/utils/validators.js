import { check } from 'express-validator';

const userValidators = {
  register: [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('name', 'Name is required').not().isEmpty()
  ],
  login: [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ]
};

const playlistValidators = {
  create: [
    check('name', 'Name is required').not().isEmpty()
  ]
};

const songValidators = {
  create: [
    check('title', 'Title is required').not().isEmpty(),
    check('artist', 'Artist is required').not().isEmpty(),
    check('duration', 'Duration is required').isNumeric()
  ]
};

export { userValidators, playlistValidators, songValidators };