// Function to set an HTTP header
exports.setHeader = (res, headerName, headerValue) => {
    res.setHeader(headerName, headerValue);
};

// Function to get a particular header's value
exports.getHeader = (req, headerName) => {
    return req.headers[headerName.toLowerCase()] || 'Header not found';
};

// To set a header: GET http://localhost:3000/header/set?headerName=X-Custom-Header&headerValue=HeaderValue
// To get a header: GET http://localhost:3000/header/get/X-Custom-Header
