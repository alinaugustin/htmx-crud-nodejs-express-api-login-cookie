const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const xss = require('xss');
const pdfMake = require('pdfmake');

// Mock user data
let users = [
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

// Middleware to get user details
function getUserDetails(req, res, next) {
    console.log('req.cookies:', req.cookies.token);
    const userId = req.cookies.id; // Assuming userId is stored in cookies
    const user = users.find(u => u.id === parseInt(userId));
    if (user) {
        req.user = user;
        console.log('user getUserDetails:', user);
    }
    next();
}

router.get('/users', authMiddleware, (req, res) => {
    const userRows = users.map(user => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="bg-blue-500 text-white px-4 py-2 rounded" onclick="openEditModal(${user.id}, '${user.name}', '${user.email}')">Edit</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    res.send(userRows);
});

router.put('/users/edit', authMiddleware, (req, res) => {
    const id = xss(req.body.id);
    const name = xss(req.body.name);
    const email = xss(req.body.email);
    const userId = parseInt(id);

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).send('User not found');
    }

    users[userIndex] = { id: userId, name, email };

    const userRows = users.map(user => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="bg-blue-500 text-white px-4 py-2 rounded" onclick="openEditModal(${user.id}, '${user.name}', '${user.email}')">Edit</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    res.send(userRows);
});

router.post('/users/add', authMiddleware, (req, res) => {
    const name = xss(req.body.name);
    const email = xss(req.body.email);
    const id = users.length ? users[users.length - 1].id + 1 : 1;
    const newUser = { id, name, email };
    users.push(newUser);

    const userRows = users.map(user => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="bg-blue-500 text-white px-4 py-2 rounded" onclick="openEditModal(${user.id}, '${user.name}', '${user.email}')">Edit</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    res.send(userRows);
});

router.delete('/users/delete/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    console.log('id:', id);
    users = users.filter(user => user.id !== parseInt(id));

    const userRows = users.map(user => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="bg-blue-500 text-white px-4 py-2 rounded" onclick="openEditModal(${user.id}, '${user.name}', '${user.email}')">Edit</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    res.send(userRows);
});

router.get('/dashboard', authMiddleware, getUserDetails, (req, res) => {
    const csrfToken = req.csrfToken();
    const isLoggedIn = !!req.cookies.token; // Check if user is logged in
    const user = req.user || { name: 'Guest', email: 'guest@example.com' }; // Default user if not logged in
    console.log('user get /dashboard:', user);
    const dashboardFilePath = path.join(__dirname, '../views/dashboard.html');
    fs.readFile(dashboardFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        const modifiedData = data
            .replace(/{{csrfToken}}/g, csrfToken)
            .replace(/{{isLoggedIn}}/g, isLoggedIn)
            .replace(/{{user.name}}/g, user.name)
            .replace(/{{user.email}}/g, user.email);
        res.send(modifiedData);
    });
});

// Define font files
const fonts = {
    Roboto: {
        normal: path.join(__dirname, '../../src/routes/fonts/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '../../src/routes/fonts/Roboto-Medium.ttf'),
        italics: path.join(__dirname, '../../src/routes/fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '../../src/routes/fonts/Roboto-MediumItalic.ttf')
    }
};

const printer = new pdfMake(fonts);

router.get('/users/pdf', authMiddleware, (req, res) => {
    const docDefinition = {
        content:
            [{
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            },
            {
                text: 'User List',
                style: 'header'
            },
            {
                text: users.length ? 'Users' : 'No users found',
                style: 'subheader'
            }, {
                table: {
                    body: [
                        [{
                            text: 'ID',
                            style: 'tableHeader'
                        }, {
                            text: 'Name',
                            style: 'tableHeader'
                        }, {
                            text: 'Email',
                            style: 'tableHeader'
                        }],
                        ...users.map(user => [user.id, user.name, user.email])
                    ]
                }
            }],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 20]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black'
            }
        }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
    });

    pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
        res.send(result);
    });

    pdfDoc.end();
});


module.exports = router;