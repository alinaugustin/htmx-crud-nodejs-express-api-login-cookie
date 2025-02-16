const express = require('express');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

let users = [
    { id: 1, name: 'John Doe', email: 'john.doe@gmail.com' },
    { id: 2, name: 'Bob Williams', email: 'bob.williams@gmail.com' },
    { id: 3, name: 'Shannon Jackson', email: 'shannon.jackson@gmail.com' },
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
    const { id, name, email } = req.body;
    console.log('req.body: ', req.body);

    users = users.map(user => user.id === parseInt(id) ? { ...user, name, email } : user);

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
    const { name, email } = req.body;
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
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

module.exports = router;