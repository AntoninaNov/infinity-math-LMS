const express = require("express");
const app = express()
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./middlewares/cors');
const upload = require('./middlewares/multerConfig');
const cookieRoutes = require('./routes/cookie.routes');
const headerRoutes = require('./routes/header.routes');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const morgan = require('morgan');
const logger = require('./config/logger.config');
const httpLogger = require('./middlewares/logger');




io.on('connection', (socket) => {
    console.log('A user connected');
    // Send a greeting message to the user
    socket.emit('greeting', 'Welcome! You are successfully logged in.');
});


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
const {enrollInCourse, uploadCourseMaterial, deleteCourse, createCourse, updateCourse} = require("./controllers/course.controller");
const {getProgressByCourse} = require("./controllers/progress.controller");


app.use(cookieParser());
app.use(corsMiddleware);
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use('/cookie', cookieRoutes);
app.use('/header', headerRoutes);
app.use(httpLogger);

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));


logger.info('This is an informational message');
logger.warn('Warning issued');
logger.error('Error message');
logger.debug('Debugging message');
logger.http('HTTP request');

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

// Route for course list
app.get('/courses', async (req, res) => {
    const response = await fetch('http://localhost:3000/api/courses');
    const courses = await response.json();
    res.render('student/courseList', { courses });
});

// Route for course detail
app.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    const course = await response.json();
    res.render('student/courseDetail', { course });
});

// Route to handle enrollment - Redirects after POST
app.post('/api/courses/:id/enroll', async (req, res) => {
    const courseId = req.params.id;
    await enrollInCourse(courseId, req.user);
    res.redirect(`/courses/${courseId}`);
});

// Route for course progress
app.get('/courses/:courseId/progress', async (req, res) => {
    const courseId = req.params.courseId;
    // Fetch course progress
    const progress = await getProgressByCourse(courseId, req.user);
    res.render('student/courseProgress', { progress });
});

// Instructor Routes
app.get('/instructor/courses', async (req, res) => {
    const response = await fetch('http://localhost:3000/api/courses');
    const courses = await response.json();
    res.render('instructor/courseList', { courses });
});

app.get('/instructor/add-course', (req, res) => {
    res.render('instructor/addCourse');
});

app.post('/instructor/api/courses', async (req, res) => {
    await createCourse(req.body);
    res.redirect('/instructor/courses');
});

app.get('/instructor/courses/:id/edit', async (req, res) => {
    const courseId = req.params.id;
    const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    const course = await response.json();
    res.render('instructor/editCourse', { course });
});

app.post('/instructor/api/courses/:id/update', async (req, res) => {
    await updateCourse(req.params.id, req.body); // Implement updateCourse
    res.redirect('/instructor/courses');
});

app.post('/instructor/api/courses/:id/delete', async (req, res) => {
    await deleteCourse(req.params.id); // Implement deleteCourse
    res.redirect('/instructor/courses');
});

app.get('/instructor/courses/:id/materials', async (req, res) => {
    const courseId = req.params.id;
    const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    const course = await response.json();
    res.render('instructor/courseMaterials', { course });
});


app.post('/instructor/api/courses/:id/materials', upload.single('material'), async (req, res) => {
    if(req.file) {
        // Assuming you have a function to handle the file after upload
        await uploadCourseMaterial(req.params.id, req.file);
        res.redirect(`/instructor/courses/${req.params.id}/edit`);
    } else {
        // Handle the case where no file is uploaded or an error occurred
        res.status(400).send('No file uploaded or an error occurred.');
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
