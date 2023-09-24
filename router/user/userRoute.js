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


// forgot password page to enter email
user.get('/forgotPassword',userController.forgotPassword)

//forgot password otp page
user.get('/forgotPasswordOtpPage',userController.getPasswordOtpPage)
// otp generation for forgot password
user.post('/forgotPasswordEmail',userController.ForgotPasswordEmail)

//otp verification for forgot password
user.post('/verifyForgotPasswordOtp',userController.verifyForgotPassOtp)
// get new password page
user.get('/newPassword',userController.newPasswordPage)

//post set new password
user.post('/createNewPass',userController.changePassword)

//signup
user.get('/signUp',isUser.loggedOut,userController.signUp)
user.post('/signUp',userController.insertUser)

//otp
user.get('/otpLogin',isUser.loggedOut,userController.otpLogin)
user.post('/verifyOTP', userController.verifyOTPPost); 

// user.get('/login')
user.post('/logout',userController.logout)
user.get('/logout',userController.logout)

//---------------------------------------------------------------------user profile---------------------------------------------\\
user.get('/userProfile',isUser.blockStatus,userController.userAccount)

//user get edit profile page
user.get('/editUserProfile',userController.getUserEdit)
//user post edit profile page
user.post('/userProfile/edit/:id',userController.updateUser)

//user get address page
user.get('/addAddress',userController.getAddAddress)
//user post add adress
user.post('/addAddress',userController.postAddAddress)

user.post('/deleteAdd/:id',userController.deleteAdd)

//==============================================================cart section=======================================\\

//user get cart
user.get('/cart',userController.getCart)
//user post cart
user.post('/cart/:id',userController.postCart)

//user add to cart
user.post('/addToCart/:id',userController.addToCart)

//user delete product from the cart
user.post('/removeProduct/:id',userController.removeFromCart)


// get checkout page
user.get('/checkout',userController.getCheckOut)
// post checkout page
user.post('/postCheckOut',userController.postCheckOut)
//new address in checkOut page
user.post('/checkoutNewAdd',userController.checkoutNewAdd)

//user confirmation page
user.get('/confirmation/:id',userController.getConfirmation)

module.exports = user;