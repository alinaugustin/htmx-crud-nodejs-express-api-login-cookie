const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });

//router.get('/', authController.login);

router.get('/login', csrfProtection, authController.getLoginForm);
router.post('/login', csrfProtection, authController.login);
router.post('/logout', authController.logout);

module.exports = router;