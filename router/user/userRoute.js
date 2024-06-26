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
const couponController = require('../../controller/user/couponController')


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

//get change password page
user.get('/changePsswrd',isUser.loggedIn,userController.setNewPsswrd)
//get otp in mail for change password
user.get('/sendOtp', userController.getOtp);
//otp verification for change password
user.post('/verifyOtp',userController.verifyChangePassOtp)


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
user.get('/userProfile',isUser.loggedIn,isUser.blockStatus,addressController.userAccount)

//user get edit profile page
user.get('/editUserProfile',isUser.loggedIn,addressController.getUserEdit)
//user post edit profile page
user.post('/userProfile/edit/:id',isUser.loggedIn,addressController.updateUser)


//user get address page
user.get('/addAddress',isUser.loggedIn,addressController.getAddAddress)
//user post add adress
user.post('/addAddress',isUser.loggedIn,addressController.postAddAddress)

user.post('/deleteAdd/:id',isUser.loggedIn,addressController.deleteAdd)
 
     //---------------------------------user order----------------------------\\
//user order page
user.get('/orders',isUser.loggedIn,orderController.getOrderPage)
//user single order detail
user.get('/orders/orderDetail/:id',isUser.loggedIn,orderController.singleOrderDetails)
// cancel order
user.get('/cancelOrder/:id',isUser.loggedIn,orderController.cancelOrder)
//return order
user.get('/returnOrder/:id',isUser.loggedIn,orderController.returnOrder)

//==============================================================cart section=======================================\\

//user get cart
user.get('/cart',isUser.loggedIn,cartController.getCart)
//user post cart
user.post('/cart/:id',isUser.loggedIn,cartController.postCart)

//user add to cart
user.post('/addToCart/:id',isUser.loggedIn,cartController.addToCart)

//user delete product from the cart
user.post('/removeProduct/:id',isUser.loggedIn,cartController.removeFromCart)

//----------------------------------------------------check out page----------------------------------------\\
// get checkout page
user.get('/checkout',isUser.loggedIn,cartController.getCheckOut)

//------------------------- post checkout page - payment
user.post('/postCheckOut',isUser.loggedIn,cartController.postCheckOut)
//new address in checkOut page
user.post('/checkoutNewAdd',isUser.loggedIn,cartController.checkoutNewAdd)

user.post('/verifyPayment',isUser.loggedIn,cartController.verifyPayment)

//user confirmation page
user.get('/confirmation/:id',isUser.loggedIn,cartController.getConfirmation)
//download invoice
user.get('/download-invoice/:id',isUser.loggedIn,cartController.getInvoice)

//-------------------------------------------------------coupon---------------------------------------------\\

user.post('/validateCoupon',couponController.postCouponValidation)
user.post('/removeCoupon',couponController.postRemoveCoupon)

module.exports = user;