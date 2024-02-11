const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.listUsers);
router.get('/new', userController.newUserForm);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);

module.exports = router;
