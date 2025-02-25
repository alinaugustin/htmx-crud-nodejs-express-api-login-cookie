const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

// Main sites listing route (protected)
router.get('/', authMiddleware, (req, res) => {
    const csrfToken = req.csrfToken();
    const isLoggedIn = !!req.cookies.token;
    const sitesFilePath = path.join(__dirname, '../views/sites.html');
    const publicDirPath = path.join(__dirname, '../../public/sites');

    fs.readdir(publicDirPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        const subfolders = files.filter(file => file.isDirectory()).map(dir => dir.name);

        const linksHtml = subfolders.map(folder => `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold mb-4">${folder}</h2>
                <p class="text-gray-600 mb-4">Description for ${folder}</p>
                <a href="/sites/${folder}/index.html" 
                   class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block">
                    Visit ${folder}
                </a>
            </div>
        `).join('');

        fs.readFile(sitesFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }

            const modifiedData = data
                .replace(/{{csrfToken}}/g, csrfToken)
                .replace(/{{isLoggedIn}}/g, isLoggedIn)
                .replace('<!-- LINKS_PLACEHOLDER -->', linksHtml);

            res.send(modifiedData);
        });
    });
});

// Protected route for serving site content
router.get('/:siteName/*', authMiddleware, (req, res) => {
    const siteName = req.params.siteName;
    const wildcardPath = req.params[0];
    const publicDirPath = path.join(__dirname, '../../public/sites');
    const requestedPath = path.join(publicDirPath, siteName, wildcardPath);

    // Security check to prevent directory traversal
    const normalizedRequestedPath = path.normalize(requestedPath);
    const normalizedPublicPath = path.normalize(publicDirPath);
    
    if (!normalizedRequestedPath.startsWith(normalizedPublicPath)) {
        return res.status(403).send('Access denied');
    }

    if (!fs.existsSync(requestedPath)) {
        return res.status(404).send('File not found');
    }

    res.sendFile(requestedPath);
});

// Remove the express.static middleware since we're handling files manually
// router.use('/:siteName', authMiddleware, express.static(...));

module.exports = router;