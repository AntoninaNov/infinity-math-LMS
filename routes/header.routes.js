const express = require('express');
const router = express.Router();
const { setHeader, getHeader } = require('../helpers/header.helper');

// Set a custom HTTP header
router.get('/set', (req, res) => {
    const { headerName, headerValue } = req.query;
    setHeader(res, headerName, headerValue);
    res.json({ message: `Header '${headerName}' set to '${headerValue}'.` });
});

// Get a specific HTTP header value from the request
router.get('/get/:headerName', (req, res) => {
    const headerValue = getHeader(req, req.params.headerName);
    res.json({ headerValue: headerValue });
});

module.exports = router;
