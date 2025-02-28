// filepath: /d:/BIROUL_IT/apps_2025/htmx-crud-login-pdf-nodejs-api/initDatabase.js
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite')
});

const createUsersTable = async () => {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                department TEXT NOT NULL
            );
        `);
        console.log('Users table created successfully.');
    } catch (error) {
        console.error('Error creating users table:', error);
    } finally {
        await sequelize.close();
    }
};

createUsersTable();