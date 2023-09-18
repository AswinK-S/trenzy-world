const User = require('../../model/customer.js')
const nocache = require('nocache')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config()
const nodemailer = require('nodemailer')
const Product = require('../../model/product.js')
const Category = require('../../model/category.js');
const smtpTransport = require('nodemailer-smtp-transport');
const Cart = require('../../model/cart.js')

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

        const existEmail = await User.findOne({ email: req.body.email })
        if(existEmail){
            req.app.locals.specialContext ="already registered email"
            return  res.redirect("/signup")
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
                    pass:  process.env.GMAIL_PASS,
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


// user account
exports.userAccount= async(req,res)=>{
    try{
        console.log('user account')
        const userId = req.session.name
        const userData = await User.findOne({_id:userId})
        // console.log('user data',userData)
        res.render("user/userProfile",{userData})
    }catch(error){
        console.log(error.message)
    }
}

// update user
exports.updateUser =async (req,res)=>{
    try {
        console.log('update user')
        const userId = req.params.id
        console.log(userId,'userid')
        const data=await User.updateOne({_id:userId},{$set:{
            name:req.body.name,
            lastName:req.body.lastName,
            email:req.body.email,
            phone:req.body.phone
        }})
        console.log('object',data);
        res.redirect("/userProfile")
    } catch (error) {
        console.log(error.message);
    }
}


// shop page
exports.shopPage = async (req, res) => {
    try {
        const search = req.query.search || '';
        const queryString = search.replace(/\+$/,'').trim();
        console.log("queryString", queryString);
        const user= req.session.name
        const price = req.query.price;
        console.log("price : ", req.query.price);
        let query = { status: true }

        // Function to search and set category in the query
        const setSearchCategory = async (queryString) => {
            if (queryString.length > 0) {
                const matchingCategories = await Category.find({
                    name: { $regex: new RegExp(queryString, 'i') }
                });
                
                if (matchingCategories.length > 0) {
                    console.log('Matching Categories', matchingCategories);
                    catName = matchingCategories[0]._id;
                    console.log('name', catName);
                    query.category = catName;
                }
            }
        }

        // Call the function to set the category based on the search query
        await setSearchCategory(queryString);

        if (typeof price === 'string') {
            console.log('price', price, queryString);
            const price1 = parseInt(price);
            const minPrice = price1 - 999;
            const maxPrice = price1;
            console.log('string', minPrice, maxPrice);

            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            };
            console.log('price single', query);
        } else if (Array.isArray(price)) {
            console.log('price2', price, queryString);
            minPrice = Math.min(...price.map(Number)) - 999;
            maxPrice = Math.max(...price.map(Number));
            console.log('ara', minPrice, maxPrice);
            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            };
        }

        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 6;

        console.log('query', query);
        const product = await Product.find(query).limit(limit * 1).skip((page - 1) * limit);
        console.log('product', product);

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Render the shop page template with products and pagination data
        res.render('user/shop', { user,product, totalPages, currentPage: page, page, queryString });
    } catch (error) {
        console.log(error.message);
    }
}





// product detail page
exports.singleProduct = async (req,res)=>{
    try {
        console.log('product page');
        const user= req.session.name
        const id= req.params.id
        console.log('id',id)
        const product =await Product.findById({_id : id})
        console.log('product',product)
        res.render('user/product',{user,product})
    } catch (error) {
        console.log(error.message);
    }
}

// get cart page
exports.getCart = async (req, res) => {
    try {
        console.log('get cart page');
        const userId = req.session.name;
        if (!userId) {
            return res.redirect('/login');
        }

        // Find the user's cart based on userId
        const cart = await Cart.findOne({ user: userId }).populate('products.products');
        
        if (!cart || cart.products.length === 0) {
            // If no cart or no products in the cart, display an empty cart
            return res.render('user/cart', { cart: null });
        }

        // If the user has a cart with products, display the cart
        res.render('user/cart', { cart });
    } catch (error) {
        console.log(error.message);
    }
}



// post cart page for adding products and updating quantities
exports.postCart = async (req, res) => {
    try {
        const userId = req.session.name;
        if (!userId) {
            return res.redirect('/login');
        }

        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId });

        if (!product) {
            // Handle the case where the product doesn't exist
            console.log('Product not found');
            return res.redirect('/'); // Redirect to a home page or handle the error
        }

        // Find the user's cart based on userId
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // If the user doesn't have a cart, create a new cart
            cart = new Cart({
                user: userId,
                products: [
                    {
                        products: products[0]._id,
                        price: products[0].price,
                        quantity: 1,
                        size: 'M',
                    },
                ],
                total: products[0].price, // Initial total based on the product's price
            });
        } else {
            // If the user already has a cart, add the product to the existing cart

            // Check if the product is already in the cart
            const existingProduct = cart.products.find((item) =>
                item.products.equals(product._id)
            );

            if (existingProduct) {
                // If the product is already in the cart, update its quantity based on the action
                if (req.body.action === 'plus') {
                    existingProduct.quantity += 1;
                } else if (req.body.action === 'minus') {
                    if (existingProduct.quantity > 1) {
                        existingProduct.quantity -= 1;
                    }
                }
            } else {
                // If it's a new product, add it to the cart
                cart.products.push({
                    products: product._id,
                    price: product.price,
                    quantity: 1,
                    size: 'M',
                });
            }

            // Recalculate the cart's total based on the updated quantities
            cart.total = cart.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
        }

        // Save the updated cart
        await cart.save();

        // Send a response to the client indicating success or updated cart data
        res.json({ success: true, cart });
    } catch (error) {
        console.log(error.message);
        // Handle errors and send an error response to the client if needed
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

