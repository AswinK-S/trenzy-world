const nocache = require('nocache')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config()
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport');

// model
const User = require('../../model/customer.js')
const Product = require('../../model/product.js')
const Category = require('../../model/category.js');
const Banner = require('../../model/banner.js')

// login page
exports.login = async (req, res) => {
    try {
        let error = req.app.locals.specialContext
        req.app.locals.specialContext = null
        let userBlock = req.app.locals.userBlocked
        req.app.locals.userBlocked = null
        console.log('login page')
        res.render('user/login', { error, userBlock })
    } catch (error) {
        console.log(error)
    }
}

// user forgot password page
exports.forgotPassword = async (req, res) => {
    try {
        console.log('enter email to get otp')
        const EmailError=req.app.locals.emailNotExists
        req.app.locals.emailNotExists=null
        res.render('user/forgotPassword',{EmailError})
    } catch (error) {
        console.log(error.message)
    }
}

//get otp page for forgot password
exports.getPasswordOtpPage = async(req,res)=>{
    try {
        console.log('otp page for forgot password');
        const otpError=req.app.locals.otpError
        req.app.locals.otpError=null
        res.render('user/otpForgotPassword',{otpError})
    } catch (error) {
        console.log(error.message);
    }
}


//user post forgot password email page
exports.ForgotPasswordEmail = async(req,res)=>{
    try {
        console.log('forgot password email checking')
        const email=req.body.email
        req.session.emai=email
        console.log('email',email)
        const isEmailExist = await User.findOne({email:email})
        console.log('email exists',isEmailExist);
        if(isEmailExist===null){
            console.log("no such email")
            req.app.locals.emailNotExists ="no such email found"
            res.redirect('/forgotPassword')
        }else{
            //generate otp
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log('genereated otp', otp)
        req.session.forgotPasswordOtp = otp

        // Send the OTP to the user's email
        const emailMessage = `Your OTP to create new password is: ${otp}`;
        // Create the Nodemailer transporter and verify the SMTP server connection
        const transporter = nodemailer.createTransport(
            smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'trenzyworld4@gmail.com',
                    pass: process.env.GMAIL_PASS,
                },
                secure: true, // Use TLS
                port: 465, // Gmail SMTP port with TLS
            })
        );

        transporter.verify(function (error, success) {
            if (error) {
                console.log('SMTP server connection error:', error);
                // Handle the error and redirect the user to an error page or retry the OTP sending
                res.redirect('/errorPage');
            } else {
                console.log('SMTP server connection is ready');
                // SMTP server connection is successful, proceed with sending the email
                const mailOptions = {
                    from: 'trenzyworld4@gmail.com',
                    to: req.body.email, // Use the user's provided email
                    subject: 'OTP for Registration',
                    text: emailMessage,
                };

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        // Handle the error and redirect the user to an error page or retry the OTP sending
                        // res.redirect('/errorPage'); // Replace '/errorPage' with your actual error page
                    } else {
                        console.log('Email sent:', info.response);
                        // Redirect the user to the OTP verification page
                        res.redirect('/forgotPasswordOtpPage');
                    }
                });
            }
        })
        }


        

    } catch (error) {
        console.log(error.message)
    }
}

//verify otp for forgot password
exports.verifyForgotPassOtp = async (req,res)=>{
    try {
        console.log('verify forpass otp');
        const otp=Number(req.body.otp)
        const otp1=req.session.forgotPasswordOtp
        console.log('otp : ',otp,'otp 1: ',otp1);
        console.log('type of otp:',typeof otp, 'type of  otp1: ',otp1 )
        if(otp1===otp){
            console.log("match");
            res.redirect('/newPassword')
        }else{
            console.log("not match")
            req.app.locals.otpError ="wrong otp"
            res.redirect('/forgotPasswordOtpPage')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


//user new password page
exports.newPasswordPage = async(req,res)=>{
    try {
        console.log('new password page')
        res.render('user/newPassword')
    } catch (error) {
        console.log(error.message)
    }
}

//post password
exports.changePassword = async(req,res)=>{
    try{
        console.log('entering new password');
        const password =req.body.password
        const email = req.session.email
        console.log('email',email);
        console.log('password',password);
        const newPass =await bcrypt.hash(password,10)
        await User.updateOne({email:email},{$set:{password:newPass}})
        res.redirect('/login')
        
    }catch(error){
        console.log(error.message)
    }
}

//logout
exports.logout = async (req, res) => {
    try {
        console.log("Session Data before logout:", req.session.name);
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}



//get home page
exports.getHome = async (req, res) => {
    try {

        const user = req.session.name
        const product = await Product.find({status:true}).limit(8)
        const shirt = await Category.findOne({ $and: [{ "name": "Shirt" }, { "status": "true" }] })
        const t_shirt = await Category.findOne({ $and: [{ "name": "T-Shirt" }, { "status": "true" }] })
        const jeans = await Category.findOne({ $and: [{ "name": "Jeans" }, { "status": "true" }] })
        const pant = await Category.findOne({ $and: [{ "name": "Casual Pant" }, { "status": "true" }] })
        const banner = await Banner.find({})
        console.log('jeanssss',jeans)
        res.render('home', { user, product, shirt, pant, jeans, t_shirt,banner })

    } catch (error) {
        console.log(error)
    }
}



//login check
exports.userLogin = async (req, res) => {
    try {
        console.log("entering details")
        const { email, password } = req.body
        const customer = await User.findOne({ email: req.body.email })
        console.log("customer det", customer)
        if (customer) {
            const isPasswordValid = await bcrypt.compare(password, customer.password)
            if (isPasswordValid) {
                if (customer.status === true) {
                    req.session.name = customer._id
                    req.session.status = customer.status
                    console.log(req.session.name)
                    console.log("user logged in", customer)
                    res.redirect('/')
                } else {
                    console.log("status is false")
                    req.app.locals.specialContext = "user is blocked"
                    res.redirect('/login')
                }
            } else {
                console.log("password is wrong")
                req.app.locals.specialContext = "password doesn't match"
                res.redirect('/login')
            }
        } else {
            console.log("no such user found");
            req.app.locals.specialContext = "user not exists"
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
    }
}



//signUp page
exports.signUp = async (req, res) => {
    try {

        console.log('signUp page')
        const referralCode = req.query.referral
        console.log('referralcode', referralCode)
        req.session.referral=referralCode

        const emailExistMessage = req.app.locals.specialContext
        req.app.locals.specialContext = null
        res.render('user/signUp', { emailExistMessage })
    } catch (error) {
        console.log(error)
    }
}




// Import the nodemailer-smtp-transport module
exports.insertUser = async (req, res) => {
    try {
        console.log('body email', req.body);

        const existEmail = await User.findOne({ email: req.body.email })
        if (existEmail) {
            req.app.locals.specialContext = "already registered email"
            return res.redirect("/signup")
        }
        // Generate a random OTP (e.g., a 6-digit number)

        const user = {
            name: req.body.name,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password
        }

        req.session.userData = user
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log('genereated otp', otp)
        req.session.otp = otp

        // Send the OTP to the user's email
        const emailMessage = `Your OTP for registration is: ${otp}`;
        // Create the Nodemailer transporter and verify the SMTP server connection
        const transporter = nodemailer.createTransport(
            smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'trenzyworld4@gmail.com',
                    pass: process.env.GMAIL_PASS,
                },
                secure: true, // Use TLS
                port: 465, // Gmail SMTP port with TLS
            })
        );

        transporter.verify(function (error, success) {
            if (error) {
                console.log('SMTP server connection error:', error);
                // Handle the error and redirect the user to an error page or retry the OTP sending
                res.redirect('/errorPage');
            } else {
                console.log('SMTP server connection is ready');
                // SMTP server connection is successful, proceed with sending the email
                const mailOptions = {
                    from: 'trenzyworld4@gmail.com',
                    to: req.body.email, // Use the user's provided email
                    subject: 'OTP for Registration',
                    text: emailMessage,
                };

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        // Handle the error and redirect the user to an error page or retry the OTP sending
                        res.redirect('/errorPage'); // Replace '/errorPage' with your actual error page
                    } else {
                        console.log('Email sent:', info.response);
                        // Redirect the user to the OTP verification page
                        res.redirect('/otpLogin');
                    }
                });
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};



// otp login page
exports.otpLogin = async (req, res) => {
    try {
        console.log('otp page')
        const otpError = req.app.locals.otpError
        req.app.locals.otpError = null
        res.render('user/otpLogin', { otpError })
    } catch (error) {
        console.log(error.message)
    }
}

// Handle OTP verification form submission
exports.verifyOTPPost = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log('confirm', otp)
        const otp1 = parseInt(otp, 10)
        const otp2 = req.session.otp
        console.log('otps', typeof otp1, otp1, typeof otp2, otp2);
        if (otp1 === otp2) {
            const user = req.session.userData
            console.log(user);
            const referralCode = generateReferralCode()
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = new User({
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password: hashedPassword,
                referral:referralCode
            });
            await newUser.save()

            if (req.session.referral) {
                const referrer = await User.findOne({ referral: req.session.referral});
                if (referrer) {
                    console.log('referrer')
                    // Add referral income to the referrer's wallet
                    const referralIncome = 50; // You can set the desired amount
                    referrer.wallet += referralIncome;
                    await referrer.save();
                }
            }
            res.redirect('/login');
        } else {
            req.app.locals.otpError = 'invalid otp'
            res.redirect('/otpLogin')
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Generate a unique code or link,
function generateReferralCode() {
    // You can use libraries like shortid or generate your custom code.
    return 'REF' + Math.random().toString(36).substr(2, 8);
  }





