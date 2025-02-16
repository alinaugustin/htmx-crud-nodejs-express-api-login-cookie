//const User = require('../models/User'); // Assuming you have a User model for database interactions
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss = require('xss');

const users = [
    {
        id: 1,
        username: 'user',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    }
];


const findUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

const authController = {
    login: async (req, res) => {
        //const { username, password } = req.body;
        const username = xss(req.body.username);
        const password = xss(req.body.password);
        console.log('password: ', password);
        try {
            const user = findUserByUsername(username);
            console.log('user: ', user);
            if (!user) {
                return res.status(401).send('<p> Invalid1 username or password. <br> <a href="/login">Login here</a></p>');
            }
            console.log('user?.password: ', user?.password);
            const isMatch = await bcrypt.compare(password, user?.password);
            //const isMatch = await bcrypt.compare('password', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4a2Z8F6k6Q8z1F9Z5eW');
            console.log('isMatch: ', isMatch);
            if (!isMatch) {
                return res.status(401).send('<p>Invalid3 username or password. <br> <a href="/login">Login here</a></p>');
            }

            setTimeout(async () => {
                // Create a session and set a cookie
                const idd = user.id;
                console.log('process.env.JWT_SECRET: ', process.env.JWT_SECRET);
                const token = jwt.sign({ id: idd }, process.env.JWT_SECRET, { expiresIn: '15min' });
                res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                //res.send('Login successful');
                res.redirect('/dashboard');
            }, 100);

        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        //res.send('Logout successful');
        //res.send('<p>You have been logged out. <a href="/login">Login again</a></p>');.
        //res.redirect('/login');
        res.send('<script>window.location.href="/login";</script>');
    }
};

module.exports = authController;