const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const xss = require('xss');
const pdfMake = require('pdfmake');

let users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith2', email: 'jane.smith2@example.com' },
    { id: 3, name: 'Jane Smith3', email: 'jane.smith3@example.com' },
];

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

router.get('/dashboard', authMiddleware, (req, res) => {
    const csrfToken = req.csrfToken();
    const dashboardFilePath = path.join(__dirname, '../views/dashboard.html');
    fs.readFile(dashboardFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        const modifiedData = data.replace(/{{csrfToken}}/g, csrfToken);
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