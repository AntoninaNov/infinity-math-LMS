const express = require('express');
const router = express.Router();
const { setCookie, getCookie } = require('../helpers/cookie.helper');

router.get('/set', (req, res) => {
    const { name, value, httpOnly } = req.query;
    setCookie(res, name, value, httpOnly === 'true');
    res.json({ message: `Cookie '${name}' set to '${value}'` });
});

router.get('/get/:name', (req, res) => {
    const cookieValue = getCookie(req, req.params.name);
    res.json({ cookieValue: cookieValue });
});

module.exports = router;
