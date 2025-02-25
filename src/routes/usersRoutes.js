const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Mock user data
const users = [
    {
        id: 1,
        name: 'user1',
        email: 'user1@rocnee.ro',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    },
    {
        id: 2,
        name: 'user2',
        email: 'user2@rocnee.ro',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    },
    {
        id: 3,
        name: 'user3',
        email: 'user3@rocnee.ro',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    }
];

router.get('/users', csrfProtection, (req, res) => {
    res.render('users', { users, csrfToken: req.csrfToken() });
});

module.exports = router;