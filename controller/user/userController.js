const nocache = require('nocache')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config()
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport');

// model
const User = require('../../model/customer.js')
const Product = require('../../model/product.js')
const Category = require('../../model/category.js');
const Cart = require('../../model/cart.js')
const Address = require('../../model/adress.js')
const Order = require('../../model/order.js'); 


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

//=======================================================================user profile section=============================\\

// user account
exports.userAccount = async (req, res) => {
    try {
        console.log('user account');
        const userId = req.session.name;
        const userData = await User.findOne({ _id: userId });
        console.log('user data', userData);

        const userAddresses = await Address.find({ user: userId }, 'addressField');
        const allAddresses = [];

        for (const userAddress of userAddresses) {
            if (userAddress.addressField && userAddress.addressField.length > 0) {
                allAddresses.push(...userAddress.addressField);
            }
        }

        console.log('user addresses', allAddresses);
        res.render("user/userProfile", { userData, allAddresses });
    } catch (error) {
        console.log(error.message);
    }
}


//get user details edit page 
exports.getUserEdit= async(req,res)=>{
    console.log('user profile edit page')
    const userId = req.session.name
    const userData = await User.findOne({ _id: userId })
    console.log('user data',userData)
    res.render('user/editProfile',{userData})

}

// update user
exports.updateUser = async (req, res) => {
    try {
        console.log('update user')
        const userId = req.params.id
        console.log(userId, 'userid')
        const data = await User.updateOne({ _id: userId }, {
            $set: {
                name: req.body.name,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone
            }
        })
        console.log('object', data);
        res.redirect("/userProfile")
    } catch (error) {
        console.log(error.message);
    }
}

//user get address
exports.getAddAddress = async(req,res)=>{
    try{
        console.log('adress page')
        const userId = req.session.name
        const userData = await User.findOne({ _id: userId })
        res.render('user/addAdress',{userData})
    }catch(error){
        console.log(error.message)
    }
}

//user post add address
exports.postAddAddress = async (req, res) => {
    try {
        console.log('Adding address');
        const userId = req.session.name;
        console.log('User ID:', userId);
        console.log('Request body:', req.body);

        const newAddress = {
            name: req.body.name,
            phone: req.body.phone,
            state: req.body.state,
            district: req.body.district,
            town: req.body.town,
            pincode: req.body.pincode,
            address: req.body.address
        };

        // Find the user's address document
        let userAddress = await Address.findOne({ user: userId });

        // If the user has no address document, create a new one
        if (!userAddress) {
            userAddress = new Address({ user: userId, addressField: [] });
        }

        // Push the new address into the addressField array
        userAddress.addressField.push(newAddress);

        // Save the user's address document
        await userAddress.save();

        console.log('New address added:', newAddress);
        res.redirect('/userProfile');
    } catch (error) {
        console.error(error.message);
        // Handle the error and provide an appropriate response to the user
        res.status(500).send('Error adding address');
    }
};



//user delete address
exports.deleteAdd=async(req,res)=>{
    try {
        console.log('delete address')
        const userId=req.session.name
        const addressId=req.params.id
        console.log("address id ",addressId);
        await Address.updateOne(
            { user: userId },
            { $pull: { addressField: { _id: addressId } } }
        );
        res.redirect('/userProfile')
    } catch (error) {
        console.log(error.message)
    }
}


// shop page
exports.shopPage = async (req, res) => {
    try {
        let search = req.query.search || '';
        search = search.replace(/\+$/, '').trim();
        const queryString = search.replace(/\+$/, '').trim();
        console.log("queryString", queryString);
        const user = req.session.name
        const price = req.query.price;
        let sort = req.query.sort || {name:1}
        console.log("price : ", req.query.price);
        let query = { status: true,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ]
        }

        // Function to search and set category in the queryy
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


        if(sort==1){
            sort={price:1}
        }else{
            sort={price:-1}
        }


        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 6;

        console.log('query', query);
        const product = await Product.find(query).limit(limit * 1).skip((page - 1) * limit).sort(sort);
        const products =await Product.find({})
        console.log('product QUANTITY', products.quantity);

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        // Render the shop page template with products and pagination data
        res.render('user/shop', { user, product, totalPages, currentPage: page, page, queryString });
    } catch (error) {
        console.log(error.message);
    }
}





// product detail page
exports.singleProduct = async (req, res) => {
    try {
        console.log('product page');
        const user = req.session.name
        const id = req.params.id
        console.log('id', id)
        const product = await Product.findById({ _id: id })
        console.log('product', product)
        res.render('user/product', { user, product})
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
        const productId = req.params.id;
        console.log("proid", productId)
        let quantity = 1, price = 0
        let message=''
        if (!userId) {
            return res.redirect('/login');
        }

        const product = await Product.findOne({ _id: productId });
        let productQuantity =product.quantity
        console.log("prodqnty111", productQuantity )

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
                        products: product[0]._id,
                        price: product[0].price,
                        quantity: 0,
                        size: 'M',
                    },
                ],
                total: product[0].price, // Initial total based on the product's price
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
                    if(productQuantity>1){
                    productQuantity=productQuantity-1
                    existingProduct.quantity += 1;
                    quantity = existingProduct.quantity
                    price = existingProduct.price * existingProduct.quantity
                    await Product.findOneAndUpdate({_id:productId},{$set:{quantity:productQuantity}})
                    console.log('prdct qty ',productQuantity)
                    }else{
                    quantity = existingProduct.quantity
                    price = existingProduct.price * existingProduct.quantity
                    message='Stock limit exeeds !'
                    }
                } else if (req.body.action === 'minus') {
                    if (existingProduct.quantity > 1) {
                        existingProduct.quantity -= 1;
                        productQuantity=productQuantity+1
                        quantity = existingProduct.quantity
                        price = existingProduct.price * existingProduct.quantity
                        await Product.findOneAndUpdate({_id:productId},{$set:{quantity:productQuantity}})
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
        console.log(cart)

        // Send a response to the client indicating success or updated cart data
        res.status(200).json({ success: true, quantity, total: cart.total, price,message });

    } catch (error) {
        console.log(error.message);
        // Handle errors and send an error response to the client if needed
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};



//users add to cart page
exports.addToCart = async (req, res) => {
    try {
        const userId = req.session.name;
        const productId = req.params.id;
        req.session.productId=productId
        if (!userId) {
            return res.redirect('/login');
        }

        const product = await Product.findOne({ _id: productId });

        

        if (!product) {
            // Handle the case where the product doesn't exist
            console.log('Product not found');
            return res.redirect('/'); // Redirect to a home page or handle the error
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // If the user doesn't have a cart, create a new cart
            cart = new Cart({
                user: userId,
                products: [
                    {
                        products: productId,
                        price: product.price,
                        quantity: 1,
                        size: 'M',
                    },
                ],
                total: product.price, // Initial total based on the product's price
            });
        } else {
            // If the user already has a cart, add the product to the existing cart
            const existingProduct = cart.products.find((item) =>
                item.products.equals(product._id)
            );

            if (existingProduct) {
                if (product.quantity === 1) {
                    return res.redirect('/cart');   
                } 
                // If the product is already in the cart, update its quantity
                existingProduct.quantity += 1;
                cart.total += product.price; // Increment total by product price
            } else {
                // If it's a new product, add it to the cart
                cart.products.push({
                    products: productId,
                    price: product.price,
                    quantity: 1,
                    size: 'M',
                });

                cart.total += product.price; // Increment total by product price
            }
        }

        // Save the updated cart
        await cart.save();

        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
        // Handle errors and send an error response to the client if needed
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};



// remove the product from the cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.session.name;
        const productId = req.params.id
        console.log('remove');
        const removeProduct = await Cart.updateOne({ user: userId }, { $pull: { products: { products: productId } } })
        console.log('pull', removeProduct)
        let cart = await Cart.findOne({ user: userId })
        console.log('cart', cart)
        let total = 0
        if (cart) {
            total = cart.products.reduce((acc, curr) => acc + curr.price, 0)
            cart.total=total
            await cart.save()
        }
        console.log('after deleting the ', cart)
        console.log('total', total);

        res.redirect('/cart');

    } catch (error) {
        console.log(error.message)
    }
}


// get check out page
exports.getCheckOut = async (req, res) => {
    try {
        console.log('check out');
        const userId = req.session.name;
        const cart = await Cart.find({ user: userId }).populate('products.products');
        console.log("cart", cart);
        console.log('products',)
        const userAddresses = await Address.find({ user: userId }, 'addressField');
        const allAddresses = [];

        for (const userAddress of userAddresses) {
            if (userAddress.addressField && userAddress.addressField.length > 0) {
                allAddresses.push(...userAddress.addressField);
            }
        }

        const addressError = req.app.locals.addressError;
        req.app.locals.addressError = null;

        const paymentError = req.app.locals.paymentError;
        req.app.locals.paymentError = null;

        console.log('user addresses', allAddresses);
        res.render('user/checkOut', { allAddresses, cart, paymentError, addressError });
    } catch (error) {
        console.log(error.message);
    }
};






//post check out
exports.postCheckOut = async (req, res) => {
    try {
        console.log('placing order')
        const userId = req.session.name; 
        const selectedAddressId = req.body.selectedAddressId; 
        const paymentMethod = req.body.payment; 
        console.log('seleted addrs :',selectedAddressId,'payment :',paymentMethod)

       
        if(!paymentMethod){
            req.app.locals.paymentError ="please select payment method"
            return res.redirect('/checkout')
        }

        //extracting the addressid
        let addressId=null
        for(let i=0;i<selectedAddressId.length;i++){
            if(selectedAddressId[i]!==null){
                addressId=selectedAddressId[i]
                break
            }
        }
        console.log('addrsId',addressId)

        if(!addressId){
            req.app.locals.addressError ="please select any address"
            return  res.redirect('/checkout')
        }

        // Fetch the user's cart contents
        const cart = await Cart.findOne({ user: userId }).populate('products.products');
        console.log('cart',cart)
        if (!cart) {
         console.log('cart is not there');
        }

        // Calculate the total order amount based on cart contents
        const totalAmount = calculateTotalAmount(cart.products);
        console.log('total amt', totalAmount)
        // Create a new order document
        const newOrder = new Order({
            user: userId,
            products: cart.products.map(item => ({
                products: item.products._id,
                name: item.products.name,
                price: item.products.price,
                quantity: item.quantity,
                size: item.size
            })),
            orderStatus: 'Pending', 
            paymentMode: paymentMethod,
            total: totalAmount,
            date: new Date(),
            address: {
               
                addressId: addressId,
            }
        });



        // Save the new order to the database
        await newOrder.save();
        console.log("neworder",newOrder )
        const orderId=newOrder._id

        await updateProductQuantities(cart.products);

        // Clear the user's cart
        await cart.deleteOne({user:userId});

        // Redirect to the confirmation page with order details
        res.redirect(`confirmation/${orderId}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper function to calculate the total order amount
function calculateTotalAmount(products) {
    console.log('calculating price')
    console.log('products',products)
    let total = 0;
    for (const item of products) {
        total += item.products.price * item.quantity;
    }
    return total;
}

// Helper function to update product quantities in the Product collection
async function updateProductQuantities(cartProducts) {
    try {
        console.log('updateproductquantites',cartProducts);
        for (const item of cartProducts) {
            const productId = item.products._id;
            const purchasedQuantity = item.quantity;

            const product = await Product.findById(productId);

            if (product && product.quantity >= purchasedQuantity) {
                product.quantity -= purchasedQuantity;
                await product.save();
            } else {
                console.error(`Product ${productId} not found or insufficient quantity.`);
            }
        }
    } catch (error) {
        console.error('Error updating product quantities:', error);
    }
}


//add address in the check out page
exports.checkoutNewAdd = async (req, res) => {
    try {
        console.log('Adding address');
        const userId = req.session.name;
        console.log('User ID:', userId);
        console.log('Request body:', req.body);

        // Create a new address object from the request data
        const newAddress = {
            name: req.body.name,
            phone: req.body.phone,
            state: req.body.state,
            district: req.body.district,
            town: req.body.town,
            pincode: req.body.pincode,
            address: req.body.address
        };

        // Find the user's address document
        let userAddress = await Address.findOne({ user: userId });

        // If the user has no address document, create a new one
        if (!userAddress) {
            userAddress = new Address({ user: userId, addressField: [] });
        }

        // Push the new address into the addressField array
        userAddress.addressField.push(newAddress);

        // Save the user's address document
        await userAddress.save();

        console.log('New address added:', newAddress);
        res.redirect('/checkout');
    } catch (error) {
        console.error(error.message);
        // Handle the error and provide an appropriate response to the user
        res.status(500).send('Error adding address');
    }
};




//get confirmation page 
exports.getConfirmation = async (req,res)=>{
    console.log('confirmation page')
    const orderId = req.params.id
    console.log('order id',orderId)
    const order = await Order.findById(orderId).populate('products.products').exec();
    console.log("order",order)
    const userId=order.user
    console.log("userId",userId)
    const addId= order.address.addressId
    console.log('addid',addId)
    const addres =await Address.findOne({user:userId})
    const addrs = addres.addressField
    const selectedAddrss = addrs.find((item)=>{
        return item._id==addId;
    })

    console.log('slctd addrs',selectedAddrss)
    res.render('user/confirmation',{order,selectedAddrss})
}