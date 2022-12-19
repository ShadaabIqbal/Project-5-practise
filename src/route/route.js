const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')

router.post('/register', userController.createUser )

router.post('/login', userController.loginUser )

router.get('/user/:userId/profile', auth.authentication, userController.getuser )

module.exports = router
