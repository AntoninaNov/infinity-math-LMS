const express = require("express");
const app = express()
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const fetch = require("node-fetch");
const cookieParser = require('cookie-parser');
require("./config/db.config");
dotenv.config();

const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const quizRoutes = require("./routes/quiz.routes");
const progressRoutes = require("./routes/progress.routes");
const badgeRoutes = require("./routes/badge.routes");
const { join } = require("path");
const userController = require("./controllers/user.controller");
const feedbackRoutes = require('./routes/feedback.routes');
const attendanceRoutes = require('./routes/attendance.routes');


app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));

app.use(async (req, res, next) => {
    const token = req.cookies['authToken']; // Adjust based on your token storage
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const user = await response.json();
                res.locals.user = user; // Make user data available in all templates
            } else {
                console.log('Token found but was invalid.');
            }
        } catch (error) {
            console.error('Error verifying user token:', error);
        }
    }
    next();
});



app.get('/', (req, res) => {
    res.render('index');
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get('/logout', (req, res) => {
    res.clearCookie('authToken'); // Clear the token cookie
    res.redirect('/'); // Redirect to home page or login page
});


app.use(async (req, res, next) => {
    const token = req.cookies['authToken']; // Adjust based on your token storage
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const user = await response.json();
                res.locals.user = user; // Make user data available in all templates
            } else {
                console.log('Token found but was invalid.');
            }
        } catch (error) {
            console.error('Error verifying user token:', error);
        }
    }
    next();
});

app.post('/login', async (req, res) => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        if (data.token) {
            res.cookie('authToken', data.token, { httpOnly: true });
            res.redirect('/profile');
        } else {
            // Handle login failure
            res.render('login', { error: 'Invalid credentials. Please try again.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred. Please try again.' });
    }
});

app.post('/register', async (req, res) => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        if (data.token) {
            res.cookie('authToken', data.token, { httpOnly: true });
            res.redirect('/profile');
        } else {
            // Handle errors, e.g., user already exists
            res.render('register', { error: 'Registration failed. Try again.' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'An error occurred. Please try again.' });
    }
});

app.get('/profile', async (req, res) => {
    const token = req.cookies['authToken'];
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const user = await response.json();
        if (user) {
            res.render('profile', { user });
        } else {
            // Handle error, user not found or token invalid
            res.clearCookie('authToken');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.clearCookie('authToken');
        res.redirect('/login');
    }
});

app.get("/users", async (req, res) => {
    const token = req.cookies['authToken'];
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const users = await response.json();
            res.render('users', { users }); // Pass the users to the Pug template
        } else {
            console.log('Failed to fetch users.');
            res.redirect('/'); // Or handle this scenario appropriately
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.redirect('/');
    }
});

app.use("/api/auth", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", quizRoutes);
app.use("/api", progressRoutes);
app.use("/api/badges", badgeRoutes);
app.use('/api', feedbackRoutes);
app.use(attendanceRoutes);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
