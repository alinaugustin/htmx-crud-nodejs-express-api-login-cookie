const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const path = require('path');
const fs = require('fs');

const csrfProtection = csrf({ cookie: true });

router.get('/', csrfProtection, (req, res) => {
    const testFilePath = path.join(__dirname, '../views/test.html');
    fs.readFile(testFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        const modifiedData = data.replace(/{{csrfToken}}/g, req.csrfToken());
        res.send(modifiedData);
    });
});

router.post('/submit', csrfProtection, (req, res) => {
    const { message } = req.body;
    console.log('Message:', message);
    if (!message) {
        return res.status(400).json({
            success: false,
            error: 'Message is required',
            details: 'Please provide a non-empty message'
        });
    }

   // Enhanced success response
   res.status(200).json({
    success: true,
    message: message,
    redirect: '/auth/login',
    details: {
        receivedMessage: message,
        timestamp: new Date().toISOString(),
        status: 'Processing complete',
        nextAction: 'Redirecting to login page'
    }
});
});



router.post('/submitoutside', csrfProtection, (req, res) => {
    const { message } = req.body;
    console.log('Message:', 'Message received from outside');
    // if (!message) {
    //     return res.status(400).json({
    //         success: false,
    //         error: 'Message is required',
    //         details: 'Please provide a non-empty message'
    //     });
    // }

   // Enhanced success response
   res.status(200).json({
    success: true,
    message: 'Message received from outside',
    redirect: '/auth/login',
    details: {
        receivedMessage: 'Message received from outside',
        timestamp: new Date().toISOString(),
        status: 'Processing complete',
        nextAction: 'Redirecting to login page'
    }
});
});



module.exports = router;