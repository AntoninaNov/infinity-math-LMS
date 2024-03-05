// Function to set an HTTP cookie
exports.setCookie = (res, cookieName, cookieValue, httpOnly = true) => {
    const options = {
        httpOnly: httpOnly,
    };
    res.cookie(cookieName, cookieValue, options);
};

// Function to get a cookie value by name from the request
exports.getCookie = (req, cookieName) => {
    return req.cookies[cookieName] || 'Cookie not found';
};

// To set a cookie: GET http://localhost:3000/cookie/set?name=authToken&value=generatedtoken&httpOnly=true
// To get a cookie: GET http://localhost:3000/cookie/get/authToken
