const Product = require('../../model/product.js')
const Cart = require('../../model/cart.js')
const Address = require('../../model/adress.js')
const Order = require('../../model/order.js');
const Coupons = require('../../model/coupon.js')

const Razorpay = require('razorpay');
const crypto = require("crypto");
const User = require('../../model/customer.js')
const fs = require('fs');
const path = require('path');
const pdf = require('pdfkit');

const invoiceDir = path.join(__dirname, 'invoices');

// Check if the directory exists, and create it if it doesn't
if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
} else {
    console.log('The "invoices" directory already exists.');
}


const dotenv = require('dotenv').config()

const RAZORPAY_ID_KEY = process.env.RAZORPAY_ID_KEY;
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY;


//address id to use in verifypayment and in selecting address in checkOut page
let addressId = null


let Instance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
})


// get cart page
exports.getCart = async (req, res) => {
    try {
        console.log('get cart page');
        const userId = req.session.name;

        if (!userId) {
            return res.redirect('/login');
        }

        // Find the user's cart based on userId
        let cart = await Cart.findOne({ user: userId }).populate('products.products');
        if (!cart || cart.products.length === 0) {
            // If no cart or no products in the cart, display an empty cart
            return res.render('user/cart', { cart: null });
        }

        if (req.session.payableTotal) {
            // Use the payableTotal as the cart total
            if (cart.couponApplied === 'pending') {
                let total = 0;
                for (const product of cart.products) {
                    total += product.quantity * product.products.price;
                }
                cart = await Cart.updateOne({ user: userId }, { $set: { total: total } })
                cart = await Cart.findOne({ user: userId }).populate('products.products');

            }
        } else {
            total = 0;
            for (const product of cart.products) {
                total += product.quantity * product.products.price;
            }
            cart.total = total;
        }

        const coupons = await Coupons.find({ status: true })



        // If the user has a cart with products, display the cart
        res.render('user/cart', { cart, coupons });
    } catch (error) {
        console.log(error.message);
    }
}



// post cart page for adding products and updating quantities
exports.postCart = async (req, res) => {
    try {
        const userId = req.session?.name;
        const productId = req.params.id;
        let quantity = 1, price = 0
        let message = ''
        if (!userId) {
            return res.redirect('/login');
        }

        const product = await Product.findOne({ _id: productId });
        let productQuantity = product.quantity

        if (!product) {
            // Handle the case where the product doesn't exist
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
                    if (productQuantity > 1) {
                        productQuantity = productQuantity - 1
                        existingProduct.quantity += 1;
                        quantity = existingProduct.quantity
                        price = existingProduct.price * existingProduct.quantity
                        await Product.findOneAndUpdate({ _id: productId }, { $set: { quantity: productQuantity } })
                        console.log('prdct qty ', productQuantity)
                    } else {
                        quantity = existingProduct.quantity
                        price = existingProduct.price * existingProduct.quantity
                        message = 'Stock limit exeeds !'
                    }
                } else if (req.body.action === 'minus') {
                    if (existingProduct.quantity > 1) {
                        existingProduct.quantity -= 1;
                        productQuantity = productQuantity + 1
                        quantity = existingProduct.quantity
                        price = existingProduct.price * existingProduct.quantity
                        await Product.findOneAndUpdate({ _id: productId }, { $set: { quantity: productQuantity } })
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
        res.status(200).json({ success: true, quantity, total: cart.total, price, message });

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
        req.session.productId = productId
        if (!userId) {
            return res.redirect('/login');
        }

        const product = await Product.findOne({ _id: productId });



        if (!product) {
            // Handle the case where the product doesn't exist
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
        // Handle errors and send an error response to the client if needed
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};



// remove the product from the cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.session.name;
        const productId = req.params.id
        const removeProduct = await Cart.updateOne({ user: userId }, { $pull: { products: { products: productId } } })
        let cart = await Cart.findOne({ user: userId })
        console.log('cart', cart)
        let total = 0
        if (cart) {
            total = cart.products.reduce((acc, curr) => acc + curr.price, 0)
            cart.total = total
            await cart.save()
        }

        res.redirect('/cart');

    } catch (error) {
        console.log(error.message)
    }
}


// get check out page
exports.getCheckOut = async (req, res) => {
    try {
        const userId = req.session.name;
        const user = await User.findOne({ _id: userId })
        let cart = {}
        if (req.session.payableTotal) {
            cart = await Cart.findOneAndUpdate({ user: userId }, { $set: { total: req.session.payableTotal } })
        }
        cart = await Cart.find({ user: userId }).populate('products.products');
       
        const userAddresses = await Address.find({ user: userId }, 'addressField');
        const allAddresses = [];

        for (const userAddress of userAddresses) {
            if (userAddress.addressField && userAddress.addressField.length > 0) {
                allAddresses.push(...userAddress.addressField);
            }
        }
        res.render('user/checkOut', { allAddresses, cart, user });
    } catch (error) {
        console.log(error.message);
    }
};






//post check out
exports.postCheckOut = async (req, res) => {
    try {
        const userId = req.session.name;
        const selectedAddressId = req.body?.selectedAddressId;
        const paymentMethod = req.body?.payment || '';
        const appliedcoupon = req.session.appliedCoupon
        const user = await User.findOne({ _id: userId })
        let walletAmount = parseInt(user.wallet)
        console.log('wallet amount :', walletAmount)
        console.log('seleted addrs :', selectedAddressId, 'payment :', paymentMethod)



        if (!selectedAddressId) {
            return res.status(200).json({ success: true, msg: "Please select any address" })
        }
        if (selectedAddressId[0].length == 0 && selectedAddressId[1].length == 0) {
         
            console.log('addd');
            return res.status(200).json({ success: true, msg: "Please select any address" });
        }


        //if there is multiple address the address will be inside  an array
        if (Array.isArray(selectedAddressId)) {
            for (let i = 0; i < selectedAddressId.length; i++) {
                if (selectedAddressId[i] !== null) {
                    addressId = selectedAddressId[i];
                    break;
                }
            }
        } else if (typeof selectedAddressId === 'string') {
            addressId = selectedAddressId;
        }

        if (!paymentMethod) {
           
            return res.status(200).json({ success: true, msg: "Please select any valid payment method" });

        }

        // Fetch the user's cart contents
        const cart = await Cart.findOne({ user: userId }).populate('products.products');
        if (!cart) {
            console.log('cart is not there');
        }

        // Calculate the total order amount based on cart contents
        const subTotal = await calculateTotalAmount(cart.products, appliedcoupon, userId);
        const totalAmount = subTotal + 10

        // Create a new order document cod
        if (paymentMethod == 'COD') {
            const newOrder = new Order({
                user: userId,
                products: cart.products.map(item => ({
                    products: item.products._id,
                    name: item.products.name,
                    price: item.products.price,
                    quantity: item.quantity,
                    size: item.size
                })),
                orderStatus: 'sucess',
                paymentMode: paymentMethod,
                total: totalAmount,
                date: new Date(),
                address: {

                    addressId: addressId,
                }
            });



            // Save the new order to the database
            await newOrder.save();
            const orderId = newOrder._id

            // Check if a coupon is applied
            if (appliedcoupon) {
                await updateCouponUsers(appliedcoupon, userId);
            }

            await updateProductQuantities(cart.products);
            await Cart.deleteOne({ user: userId })

            res.status(200).json({
                success: true,
                paymentMethod: paymentMethod,
                order_id: orderId,
            });


        } else if (paymentMethod == 'onlinePayment') {

            const amount = totalAmount
            console.log("___amount :L : ", amount)
            const options = {
                amount: amount * 100,
                currency: 'INR',
                receipt: crypto.randomBytes(10).toString('hex')
            }

            Instance.orders.create(options, (error, order) => {
                if (error) {
                    console.log(error.message);
                    return res.status(500).json({ success: false, message: "Something went wrong!" })
                } else {
          

                    res.status(200).json({ success: true, message: "success", data: order, paymentMethod: paymentMethod })
                }
            })
        } else if (paymentMethod == 'wallet') {
            if (walletAmount >= totalAmount) {
                const newOrder = new Order({
                    user: userId,
                    products: cart.products.map(item => ({
                        products: item.products._id,
                        name: item.products.name,
                        price: item.products.price,
                        quantity: item.quantity,
                        size: item.size
                    })),
                    orderStatus: 'sucess',
                    paymentMode: paymentMethod,
                    total: totalAmount,
                    date: new Date(),
                    address: {

                        addressId: addressId,
                    }
                });



                // Save the new order to the database
                await newOrder.save();
                const orderId = newOrder._id

                // Check if a coupon is applied
                if (appliedcoupon) {
                    await updateCouponUsers(appliedcoupon, userId);
                }

                await updateProductQuantities(cart.products);

                await Cart.deleteOne({ user: userId })
                await User.updateOne({ _id: userId }, { $inc: { wallet: -totalAmount } })
             

                res.status(200).json({
                    success: true,
                    paymentMethod: paymentMethod,
                    order_id: orderId,
                });
            } else {
               

                return res.status(200).json({ success: true, msg: 'Insufficient wallet balance' })
            }
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};




// Helper function to calculate the total order amount
async function calculateTotalAmount(products, appliedcoupon, userId) {
  
    let total = 0;
    for (const item of products) {
        total += (item.products.price * item.quantity);
    }

    // Check if a coupon is applied
    if (appliedcoupon) {
        try {

            // Find the existing coupon by name
            const coupon = await Coupons.findOne({ name: appliedcoupon });
            console.log('coupon', coupon);
            if (coupon) {
                total = total - coupon.discount
            }
            else {
                console.log('Coupon not found:', appliedcoupon);
            }
        } catch (error) {
            console.error('Error while handling coupon:', error);
        }
    }

    console.log('total____: ', total)
    return total;
}

// Helper function to update product quantities in the Product collection
async function updateProductQuantities(cartProducts) {
    try {
        console.log('updateproductquantites', cartProducts);
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

//helper function to update the users array of the coupon when the coupon is applied
async function updateCouponUsers(couponName, userId, orderId) {
    try {
        // Find the existing coupon by name
        const coupon = await Coupons.findOne({ name: couponName });

        if (coupon) {
            // Check if the user's ID is not already in the "users" array
            if (!coupon.users.includes(userId)) {
                // Update the "users" array of the existing coupon
                console.log('updating the coupon');
                await Coupons.findOneAndUpdate(
                    { name: couponName },
                    { $push: { users: userId } }
                );
                await Order.findOneAndUpdate({ _id: orderId }, { $set: { couponName: couponName } })
                console.log('User added to existing coupon.');
            } else {
                console.log('User already exists in the coupon:', coupon.users);
            }
        } else {
            console.log('Coupon not found:', couponName);
        }
    } catch (error) {
        console.error('Error while handling coupon:', error);
    }
}


//veryfy payment
exports.verifyPayment = async (req, res) => {

    try {
        const userId = req.session.name;
        const appliedcoupon = req.session.appliedCoupon
        const totalAmount = parseInt(req.body.amount / 100)
        const { razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature } = req.body.payment


        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY).update(sign.toString()).digest('hex');
        if (razorpay_signature === expectedSign) {

            // Fetch the user's cart contents
            const cart = await Cart.findOne({ user: userId }).populate('products.products');
            if (!cart) {
                console.log('cart is not there');
            }
            const paymentMethod = 'onlinePayment'
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
                },
            });


            // Save the new order to the database
            await newOrder.save();
            const orderId = newOrder._id
            await updateProductQuantities(cart.products);


            const addres = await Address.findOne({ user: userId })
            const addrs = addres.addressField
            const selectedAddrss = addrs.find((item) => {
                return item._id == addressId;
            })

            // Check if a coupon is applied
            if (appliedcoupon) {
                await updateCouponUsers(appliedcoupon, userId, orderId);
            }


            await Cart.deleteOne({ user: req.session.name })
            return res.send({ success: true, orderId })
        }


    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });

    }
}


//add address in the check out page
exports.checkoutNewAdd = async (req, res) => {
    try {
        const userId = req.session.name;

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

        res.status(200).json({ ok: 'true' })
        // res.redirect('/checkout');
    } catch (error) {
        console.error(error.message);
        // Handle the error and provide an appropriate response to the user
        res.status(500).send('Error adding address');
    }
};




//get confirmation page 
exports.getConfirmation = async (req, res) => {
    const orderId = req.params.id
    const order = await Order.findById(orderId)
        .populate({
            path: 'products.products',
            select: 'name price quantity offer originalPrice' // Include the fields you need
        })
        .exec();

    const userId = order.user
    const addId = order.address.addressId
    const addres = await Address.findOne({ user: userId })
    const addrs = addres.addressField
    const selectedAddrss = addrs.find((item) => {
        return item._id == addId;
    })

    const invoicePath = generateInvoice(order, selectedAddrss);
    console.log('invoice path', invoicePath);
    console.log('offeree :', order);
    console.log('slctd addrs', selectedAddrss)
    res.render('user/confirmation', { order, selectedAddrss })
}

//function for invoice download
function generateInvoice(order, selectedAddrss) {
    const invoicePath = path.join(__dirname, 'invoices', `invoice_${order._id}.pdf`);
    const doc = new pdf();

    // Pipe the PDF to a writable stream and create the invoice
    doc.pipe(fs.createWriteStream(invoicePath));

    // Set font and font size
    doc.font('Helvetica-Bold');
    doc.fontSize(14);

    // Company Name
    doc.text('TrenzyWorld', { align: 'center' });

    // Add a horizontal line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    // Invoice Header
    doc.fontSize(12).text('Invoice', { align: 'center' }).fontSize(12);
    doc.moveDown();
    // Order ID
    doc.text(`Order ID: ${order._id}`);
    doc.moveDown();
    // Product details
    doc.fontSize(14).text('Product Details', { underline: true });

    for (let i = 0; i < order.products.length; i++) {
        const product = order.products[i];
        doc.text(`Item ${i + 1}: ${product.name}`);
        doc.text(`Quantity: ${product.quantity}`);
        doc.text(`Price:  Rs. ${product.price}`);
        doc.moveDown(); // Move to the next line
    }

    // Total
    doc.fontSize(12).text(`Total:  Rs.${order.total}`);

    // Payment mode
    doc.text(`Payment mode: ${order.paymentMode}`);
    doc.moveDown();
    // Address section
    doc.fontSize(14).text('Shipping Address', { underline: true });

    doc.text(`Name: ${selectedAddrss.name}`);
    doc.text(`Phone: ${selectedAddrss.phone}`);
    doc.text(`State: ${selectedAddrss.state}`);
    doc.text(`District: ${selectedAddrss.district}`);
    doc.text(`Town: ${selectedAddrss.town}`);
    doc.text(`Pincode: ${selectedAddrss.pincode}`);
    doc.text(`Address: ${selectedAddrss.address}`);

    doc.end(); // Finalize the PDF

    return invoicePath;
}


// invoice 
exports.getInvoice = (req, res) => {
    try {
        const orderId = req.params.id;
        const invoicePath = path.join(__dirname, 'invoices', `invoice_${orderId}.pdf`);

        // Set appropriate headers for the PDF download
        res.setHeader('Content-disposition', `attachment; filename=invoice_${orderId}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        // Create a readable stream from the invoice file and pipe it to the response
        const fileStream = fs.createReadStream(invoicePath);
        fileStream.pipe(res);
    } catch (error) {
        console.log(error.message)
    }
}