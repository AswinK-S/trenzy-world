const User = require('../../model/customer.js')
const nocache = require('nocache')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config()
const nodemailer = require('nodemailer')
const Product = require('../../model/product.js')
const Category = require('../../model/category.js');
const smtpTransport = require('nodemailer-smtp-transport');
const category = require('../../model/category.js');

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


exports.forgotPassword = async (req, res) => {
    try {
        res.render('user/forgotPassword')
    } catch (error) {
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



//
exports.getHome = async (req, res) => {
    try {

        const user = req.session.name
        const product = await Product.find({})
        // console.log('products', product)
        const shirt = await Category.findOne({ $and: [{ "name": "Shirt" }, { "status": "true" }] })
        const t_shirt = await Category.findOne({ $and: [{ "name": "T-Shirt" }, { "status": "true" }] })
        const jeans = await Category.findOne({ $and: [{ "name": "Jeans" }, { "status": "true" }] })
        const pant = await Category.findOne({ $and: [{ "name": "Casual Pant" }, { "status": "true" }] })

        // console.log('catego', shirt, t_shirt, jeans, pant)
        // console.log('shg img', shirt.image)
        res.render('home', { user, product, shirt, pant, jeans, t_shirt })

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
                    pass: 'xcaasrvymxptpkuc',
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
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = new User({
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password: hashedPassword,
            });
            await newUser.save()

            res.redirect('/login');
        } else {
            req.app.locals.otpError = 'invalid otp'
            res.redirect('/otpLogin')
        }

    } catch (error) {
        console.log(error.message);
    }
}


// shop page
exports.shopPage = async (req, res) => {
    try {
        const search = req.query.search ||''
        console.log("search typeof",typeof search )
        const price = req.query.price
        console.log("price : ",req.query.price)
        let query = { status: true}


        if (search.trim().length>0 ) {
            console.log('category 1', search);
            console.log("jean.lenth : ",search.length)

            // Step 1: Query the "category" collection
            let matchingCategories1 = await Category.find({
                name: { $regex: new RegExp(search, 'i') }
            });
            
            console.log('Matching Categories 1', matchingCategories1);


            if (matchingCategories1.length > 0) {
                console.log('Matching Categories 1', matchingCategories1);
                catName = matchingCategories1[0]._id
                console.log('name', catName)
                query.category = {
                    _id: catName
                };
            } 
        }
        console.log("   query  :  ",query)

        if (typeof price === 'string') {

            if ( search.trim().length>0) {
                console.log('category2', search);
    
                // Step 1: Query the "category" collection
                let matchingCategories2 = await Category.find({
                    name: { $regex: new RegExp(search, 'i') }
                });
                console.log('Matching Categories2', matchingCategories2);

    
                if (matchingCategories2.length > 0) {
                    console.log('Matching Categories2', matchingCategories2);
                    catName = matchingCategories2[0]._id
                    console.log('name', catName)
                    query.category = catName
                }
            }
        

            console.log('price',price,search)
            const price1 = parseInt(price)
            const minPrice = price1 - 999
            const maxPrice = price1
            console.log('string', minPrice, maxPrice)


            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            }
            console.log('price single',query)
        }else if (Array.isArray(price)) {

            if ( search.trim().length>0) {
                console.log('category3', search);
    
                // Step 1: Query the "category" collection
                let matchingCategories3 = await Category.find({
                    name: { $regex: new RegExp(search, 'i') }
                });
    
                if (matchingCategories.length > 0) {
                    console.log('Matching Categories3', matchingCategories3);
                    catName = matchingCategories[0]._id
                    console.log('name', catName)
                    query.category = catName
                }
            }

            console.log('price2',price,search)
            minPrice = Math.min(...price.map(Number)) - 999
            maxPrice = Math.max(...price.map(Number))
            console.log('ara', minPrice, maxPrice)
            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            }
        }


        // const page = parseInt(req.query.page) || 1; // Default to page 1 if 'page' is not provided
        // console.log('current page', page);
        // // Define the number of products to display per page
        // const productsPerPage = 6;

        // // Calculate the index from which to start displaying products
        // const startIndex = (page - 1) * productsPerPage;

        // Query the database to retrieve products for the current page
        let page = 1
        if (req.query.page) {
            page = req.query.page
        }
        let limit = 6

        console.log('quwe', query)
        const product = await Product.find(query).limit(limit * 1).skip((page - 1) * limit)
        console.log('product',product)

        const totalProducts = await Product.countDocuments();
        // console.log('tot prdts',totalProducts);
        const totalPages = Math.ceil(totalProducts / limit);
        // console.log(' tot pag',totalPages);
        // Render the shop page template with products and pagination data
        res.render('shop', { product, totalPages, currentPage: page, page, search });
    } catch (error) {
        console.log(error.message);
    }
}



exports.singleProduct = async (req,res)=>{
    try {
        console.log('product page');
        const id= req.params.id
        console.log('id',id)
        const product =await Product.findById({_id : id})
        console.log('product',product)
        res.render('product',{product})
    } catch (error) {
        console.log(error.message);
    }
}