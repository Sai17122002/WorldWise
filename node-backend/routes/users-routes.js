const express = require('express');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;