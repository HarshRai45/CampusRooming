const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthed } = require('../middleware/auth');

router.get('/register', redirectIfAuthed, authController.showRegister);
router.post('/register', redirectIfAuthed, authController.register);
router.get('/login', redirectIfAuthed, authController.showLogin);
router.post('/login', redirectIfAuthed, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
