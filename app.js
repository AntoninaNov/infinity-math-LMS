const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/lms', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(express.json());
app.use(cookieParser());
app.set('views engine', 'pug');
app.set('views', './views'); // Directory where Pug templates are located

// Define routes here...

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
