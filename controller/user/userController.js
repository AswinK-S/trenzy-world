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
        res.render('user/login', { error, userBlock })
    } catch (error) {
        console.log(error)
    }
}

// user forgot password page
exports.forgotPassword = async (req, res) => {
    try {
        const EmailError = req.app.locals.emailNotExists
        req.app.locals.emailNotExists = null
        res.render('user/forgotPassword', { EmailError })
    } catch (error) {
        console.log(error.message)
    }
}

//get otp page for forgot password
exports.getPasswordOtpPage = async (req, res) => {
    try {
        const otpError = req.app.locals.otpError
        req.app.locals.otpError = null
        res.render('user/otpForgotPassword', { otpError })
    } catch (error) {
        console.log(error.message);
    }
}


//-----------------------------------utility function otp generation

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
}


//-----------------------------------------utility function   send otp by email

async function sendOTPByEmail(email, otp) {
    const emailMessage = `Your OTP to create a new password is: ${otp}`;

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

    await transporter.verify();

    const mailOptions = {
        from: 'trenzyworld4@gmail.com',
        to: email,
        subject: 'OTP for Registration',
        text: emailMessage,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}



//user post forgot password email page
exports.ForgotPasswordEmail = async (req, res) => {
    try {
        const email = req.body.email
        req.session.emai = email
        const isEmailExist = await User.findOne({ email: email })
        if (isEmailExist === null) {
            req.app.locals.emailNotExists = "no such email found"
            res.redirect('/forgotPassword')
        } else {
            //generate otp

            const otp = generateOtp()
            req.session.forgotPasswordOtp = otp

            // Send OTP via email
            await sendOTPByEmail(email, otp);

            res.redirect('/forgotPasswordOtpPage');

        }

    } catch (error) {
        console.log(error.message)
    }
}


//verify otp for forgot password
exports.verifyForgotPassOtp = async (req, res) => {
    try {
        const otp = Number(req.body.otp)
        const otp1 = req.session.forgotPasswordOtp
        if (otp1 === otp) {
            res.redirect('/newPassword')
        } else {
            req.app.locals.otpError = "wrong otp"
            res.redirect('/forgotPasswordOtpPage')
        }

    } catch (error) {
        console.log(error.message)
    }
}


//user new password page
exports.newPasswordPage = async (req, res) => {
    try {
        res.render('user/newPassword')
    } catch (error) {
        console.log(error.message)
    }
}

//post password
exports.changePassword = async (req, res) => {
    try {
        const password = req.body.password
        const email = req.session.email
        const newPass = await bcrypt.hash(password, 10)
        await User.updateOne({ email: email }, { $set: { password: newPass } })
        res.redirect('/login')

    } catch (error) {
        console.log(error.message)
    }
}

//get otp for  changepassword
exports.getOtp = async(req,res)=>{
    try {
        const email = req.query.email;
        const otp =  generateOtp()
        req.session.changePasswordOtp = otp

       
        // Send OTP via email
        await sendOTPByEmail(email, otp);
        res.json({ success: true })

    } catch (error) {
        console.log(error.message);
    }
}



//verify otp for change password
exports.verifyChangePassOtp = async (req, res) => {
    try {
        const otp = Number(req.body.otp)
        const otp1 = req.session.changePasswordOtp
        if (otp1 === otp) {
            console.log("match");
            res.render('user/cnfrmNewPsswrd')
        } else {
            req.app.locals.otpError = "wrong otp"
            res.redirect('/changePsswrd')
        }

    } catch (error) {
        console.log(error.message)
    }
} 


//get change password page
exports.setNewPsswrd = async (req, res) => {
    try {
        const userId = req.session.name
        const user = await User.findOne({ _id: userId })
        req.session.email=user.email
        const otpError = req.app.locals.otpError
        req.app.locals.otpError = null
        res.render('user/changePassword', { user,otpError })
    } catch (error) {
        console.log(error.message)
    }
}


//logout
exports.logout = async (req, res) => {
    try {
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
        const product = await Product.find({ status: true }).limit(8)
        const shirt = await Category.findOne({ $and: [{ "name": "Shirt" }, { "status": "true" }] })
        const t_shirt = await Category.findOne({ $and: [{ "name": "T-Shirt" }, { "status": "true" }] })
        const jeans = await Category.findOne({ $and: [{ "name": "Jeans" }, { "status": "true" }] })
        const pant = await Category.findOne({ $and: [{ "name": "Casual Pant" }, { "status": "true" }] })
        const banner = await Banner.find({})
        res.render('home', { user, product, shirt, pant, jeans, t_shirt, banner })

    } catch (error) {
        console.log(error)
    }
}



//login check
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const customer = await User.findOne({ email: req.body.email })
        if (customer) {
            const isPasswordValid = await bcrypt.compare(password, customer.password)
            if (isPasswordValid) {
                if (customer.status === true) {
                    req.session.name = customer._id
                    req.session.status = customer.status
                    res.redirect('/')
                } else {
                    req.app.locals.specialContext = "user is blocked"
                    res.redirect('/login')
                }
            } else {
                req.app.locals.specialContext = "password doesn't match"
                res.redirect('/login')
            }
        } else {
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

        const referralCode = req.query.referral
        req.session.referral = referralCode

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
                // Handle the error and redirect the user to an error page or retry the OTP sending
                res.redirect('/errorPage');
            } else {
                // SMTP server connection is successful, proceed with sending the email
                const mailOptions = {
                    from: 'trenzyworld4@gmail.com',
                    to: req.body.email, // Use the user's provided email
                    subject: 'OTP for Registration',
                    text: emailMessage,
                };

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        // Handle the error and redirect the user to an error page or retry the OTP sending
                        res.redirect('/errorPage'); 
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
        const otp1 = parseInt(otp, 10)
        const otp2 = req.session.otp
        if (otp1 === otp2) {
            const user = req.session.userData
            const referralCode = generateReferralCode()
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = new User({
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password: hashedPassword,
                referral: referralCode
            });
            await newUser.save()

            if (req.session.referral) {
                const referrer = await User.findOne({ referral: req.session.referral });
                if (referrer) {
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





