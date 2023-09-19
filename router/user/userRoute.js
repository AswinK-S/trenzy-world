const express =require('express')
const user=express()
const router= express.Router()
const nocache= require('nocache')
const nodemailer = require('nodemailer')

const isUser = require('../../middleware/userAuth')
const userController = require('../../controller/user/userController')

//home
user.get('/',isUser.blockStatus,userController.getHome)

//shop page
user.get('/shop',isUser.blockStatus,userController.shopPage)


//single product
user.get('/product/:id',isUser.blockStatus,userController.singleProduct)

//login
user.get('/login',isUser.loggedOut,userController.login)
user.post('/login',userController.userLogin)


// forgot password
user.get('/forgotPassword',userController.forgotPassword)

//signup
user.get('/signUp',isUser.loggedOut,userController.signUp)
user.post('/signUp',userController.insertUser)

//otp
user.get('/otpLogin',isUser.loggedOut,userController.otpLogin)
user.post('/verifyOTP', userController.verifyOTPPost); 

// user.get('/login')
user.post('/logout',userController.logout)
user.get('/logout',userController.logout)

//user profile
user.get('/userProfile',isUser.blockStatus,userController.userAccount)
user.post('/userProfile/edit/:id',userController.updateUser)

//user get cart
user.get('/cart',userController.getCart)
//user post cart
user.post('/cart/:id',userController.postCart)

//user add to cart
user.post('/addToCart/:id',userController.addToCart)

//user delete product from the cart
user.post('/removeProduct/:id',userController.removeFromCart)


module.exports = user;