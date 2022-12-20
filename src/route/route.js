const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const auth = require('../middleware/auth')

router.post('/register', userController.createUser )

router.post('/login', userController.loginUser )

router.get('/user/:userId/profile', auth.authentication, userController.getuser )

router.put('/user/:userId/profile', auth.authentication, userController.updateUser )

router.post('/products', productController.createProduct )

router.get('/products', productController.getProductByQuery )

router.get('/products/:productId', productController.getProductById )

router.put('/products/:productId', productController.updateProduct )

router.post('/users/:userId/cart', cartController.createCart )



module.exports = router
