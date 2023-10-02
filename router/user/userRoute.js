const express =require('express')
const user=express()
// const router= express.Router()
// const nocache= require('nocache')
// const nodemailer = require('nodemailer')

const isUser = require('../../middleware/userAuth')
const userController = require('../../controller/user/userController')
const addressController = require('../../controller/user/addressController')
const cartController = require('../../controller/user/cartController')
const productController = require('../../controller/user/productController')
const orderController = require('../../controller/user/orderController')


//home
user.get('/',isUser.blockStatus,userController.getHome)

//-------------------------------------------------product and shop page-------------------------------------------------------\\
//shop page
user.get('/shop',isUser.blockStatus,productController.shopPage)

//single product
user.get('/product/:id',isUser.blockStatus,productController.singleProduct)



//------------------------------------------------------------------user login section---------------------------------\\
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
user.get('/userProfile',isUser.blockStatus,addressController.userAccount)

//user get edit profile page
user.get('/editUserProfile',addressController.getUserEdit)
//user post edit profile page
user.post('/userProfile/edit/:id',addressController.updateUser)

//user get address page
user.get('/addAddress',addressController.getAddAddress)
//user post add adress
user.post('/addAddress',addressController.postAddAddress)

user.post('/deleteAdd/:id',addressController.deleteAdd)

//user order page
user.get('/orders',orderController.getOrderPage)


//==============================================================cart section=======================================\\

//user get cart
user.get('/cart',cartController.getCart)
//user post cart
user.post('/cart/:id',cartController.postCart)

//user add to cart
user.post('/addToCart/:id',cartController.addToCart)

//user delete product from the cart
user.post('/removeProduct/:id',cartController.removeFromCart)

//----------------------------------------------------check out page----------------------------------------\\
// get checkout page
user.get('/checkout',cartController.getCheckOut)

//------------------------- post checkout page - payment
user.post('/postCheckOut',cartController.postCheckOut)
//new address in checkOut page
user.post('/checkoutNewAdd',cartController.checkoutNewAdd)

user.post('/verifyPayment',cartController.verifyPayment)

//user confirmation page
user.get('/confirmation/:id',cartController.getConfirmation)

module.exports = user;