const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const csrf = require('csurf');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


const csrfProtection = csrf({ cookie: true });

//router.get('/', authController.login);

router.get('/login', csrfProtection, authController.getLoginForm);
router.post('/login', csrfProtection, authController.login);
router.post('/logout', authController.logout);

router.get('/register', csrfProtection, (req, res) => {
    const registerFilePath = path.join(__dirname, '../views/inregistrare.html');
    fs.readFile(registerFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        const modifiedData = data.replace(/{{csrfToken}}/g, req.csrfToken());
       
        res.send(modifiedData);
    });
});

router.post('/register', csrfProtection, async (req, res) => {
    try {
        const { name, email, password, role, department, captcha } = req.body;
        
        // Add validation here
        if (!name || !email || !password || !role || !department || !captcha) {
            return res.status(400).json({
                error: 'Toate câmpurile sunt obligatorii'
            });
        }
        
        // Add password complexity check
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            console.log('Parola nepotrivită:', password);
            return res.status(400).json({
                error: 'Parola trebuie să conțină cel puțin 8 caractere, o literă, o cifră și un caracter special'
            });
        }
        
        // Add email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Email nepotrivit:', email);
            return res.status(400).json({
                error: 'Formatul adresei de email este invalid'
            });
        }

         // Hash the password
         const hashedPassword = await bcrypt.hash(password, 10);

         // Save the user to the database
         const newUser = await User.create({
             name,
             email,
             password: hashedPassword,
             role,
             department
         });
         
        console.log('Inregistrare reusita...  : ', name, email, password, role, department, captcha);
        // After successful validation, send success response
        // return res.status(200).json({
        //     success: true,
        //     redirect: '/auth/login',
        //     message: 'Înregistrare reușită! Vă rugăm să vă autentificați.'
        // });
        const responseData = {
            id: newUser.id,
            timestamp: new Date().toISOString(),
            name,
            email,
            role,
            department,
            message:`Înregistrare reușită pentru utilizator ${name}! Vă rugăm să vă autentificați.`,
        };
        // res.json({
        //     success: true,
        //     message:`Înregistrare reușită pentru utilizator ${username}! Vă rugăm să vă autentificați.`,
        //  });
          // Send back the processed data
        res.json(responseData);

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'A apărut o eroare la înregistrare. Vă rugăm încercați din nou.'
        });
    }
});

module.exports = router;