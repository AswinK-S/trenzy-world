const Product = require('../../model/product.js')
const Cart = require('../../model/cart.js')
const Address = require('../../model/adress.js')
const Order = require('../../model/order.js'); 
const Razorpay = require('razorpay');
const crypto = require("crypto");

const dotenv = require('dotenv').config()

const RAZORPAY_ID_KEY = process.env.RAZORPAY_ID_KEY;
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY;


var Instance = new Razorpay({
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
        const userId = req.session?.name;
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
        const selectedAddressId = req.body?.selectedAddressId; 
        const paymentMethod = req.body?.payment; 
        console.log('seleted addrs :',selectedAddressId,'payment :',paymentMethod)

        if(selectedAddressId[0].length==0 && selectedAddressId[1].length==0){
            req.app.locals.addressError ="please select any address"
            return  res.redirect('/checkout')
        }
        
        //extracting the addressid 
        let addressId=null
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
        console.log('addrsId',addressId)

        if(!paymentMethod){
            req.app.locals.paymentError ="please select payment method"
            return res.redirect('/checkout')
        }
        
        // Fetch the user's cart contents
        const cart = await Cart.findOne({ user: userId }).populate('products.products');
        console.log('cart',cart)
        if (!cart) {
         console.log('cart is not there');
        }

        // Calculate the total order amount based on cart contents
        const subTotal=  calculateTotalAmount(cart.products);
        const totalAmount =subTotal+10
        console.log('total amt', totalAmount)

        // Create a new order document cod
        if(paymentMethod=='COD'){
            const newOrder = new Order({
                user: userId,
                products: cart.products.map(item => ({
                    products: item.products._id,
                    name: item.products.name,
                    price: item.products.price,
                    quantity: item.quantity,
                    size: item.size
                })),
                orderStatus: 'pending', 
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
    
            await Cart.deleteOne({user:userId})
            // Redirect to the confirmation page with order details
            // res.redirect(`confirmation/${orderId}`);

            res.status(200).json({
                success: true,
                paymentMethod: paymentMethod,
                order_id: orderId,
            });


        }else if(paymentMethod=='onlinePayment'){
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
            console.log('oordrrrid :',orderId)
            await updateProductQuantities(cart.products);
    

            console.log('userId',userId)
            const addres =await Address.findOne({user:userId})
            console.log('address',addres)
            const addrs = addres.addressField
            console.log('addrs',addrs)
            const selectedAddrss = addrs.find((item)=>{
                return item._id==addressId;
            })
        console.log('selected address',selectedAddrss)
        
        const amount = totalAmount
        console.log("___amount :L : ",amount)
        const options = {
            amount: amount*100,
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString('hex')
        }
        
        Instance.orders.create(options,(error,order)=>{
            if(error){
                console.log(error.message);
                return res.status(500).json({success:false, message:"Something went wrong!"})
            }else{
                order.newOid=newOrder._id
                // req.session.OrderId=newOrder._id

                console.log(order,"order");

                res.status(200).json({success:true,message:"success",data:order,paymentMethod:paymentMethod})
            }
        })
        }
        
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


//veryfy payment
exports.verifyPayment= async (req,res)=>{
    
        try {
          console.log(" varify payment")
          console.log("req.body", req.body)

          const orderId=req.body.orderId
          console.log(orderId,"orderId");

          const {razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature }=req.body.payment


            
            const sign=razorpay_order_id +'|'+razorpay_payment_id;
            const expectedSign=crypto.createHmac("sha256",RAZORPAY_SECRET_KEY).update(sign.toString()).digest('hex');
            if(razorpay_signature===expectedSign){
                console.log("successs")
                await  Order.findOneAndUpdate({_id:orderId},{$set:{orderStatus:'Sucess'}})
                await Cart.deleteOne({user:req.session.name})
                return res.send({ success: true })
            }
        
      
        } catch (error) {
            console.log(error.message);
          res.status(500).json({ error: 'Internal server error' });
      
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