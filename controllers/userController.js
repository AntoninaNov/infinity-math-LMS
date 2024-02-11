const User = require('../models/userModel');

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find();
        console.log("Users:", users.map(user => ({ id: user._id, name: user.name })));
        res.render('userList', { users });
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.newUserForm = (req, res) => {
    res.render('newUser');
};

exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.redirect('/users'); // Redirect to the list of users, or wherever appropriate
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const mongoose = require('mongoose');

exports.getUserById = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('userProfile', { user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
