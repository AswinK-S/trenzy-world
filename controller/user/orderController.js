const Order = require('../../model/order')
const User = require('../../model/customer')
const Products = require('../../model/product')

// get the orders page
exports.getOrderPage = async (req, res) => {
    try {
        const userId = req.session.name;

        const page = parseInt(req.query.page) || 1; // Get the page query parameter as an integer (default to 1 if not provided)
        const limit = 10; // Number of items per page
        const skip = (page - 1) * limit;

        const userData = await User.findOne({ _id: userId });
        const orders = await Order.find({ user: userId })
            .populate({
                path: 'products.products',
                select: 'image name price', // Select the fields you need
            })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
        let totalOrdersCount = await Order.find({ user: userId }).count();
        let pageCount = Math.ceil(totalOrdersCount / limit);

        res.render('user/orders', { userData, orders, pageCount, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
};

//user get single order details page
exports.singleOrderDetails = async(req,res)=>{
    try {
        const orderId= req.params.id
        const userId = req.session.name;
        const userData = await User.findOne({ _id: userId });
        
        
        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'products.products',
                select: 'image name price', // Select the fields you need
            })
            
            const progress = calculateProgressBarWidth(order.orderStatus)


            function calculateProgressBarWidth(orderStatus) {
                switch (orderStatus) {
                    case 'success':
                        return '25%';
                    case 'shipped':
                        return '50%';
                    case 'out_for_delivery':
                        return '75%';
                    case 'delivered':
                        return '100%';
                    case 'canceled':
                    case 'canceled_by_admin':
                    case 'returned':
                    case 'requested_for_return':    
                    case 'pending_return_approval':
                        return '0%'; 
                    default:
                        return '0%'; 
                }
            }
            

        res.render('user/singleOrderDetail',{order,userData,progress})

    } catch (error) {
        console.log(error.message)
    }
}

//cancel order
exports.cancelOrder = async (req,res)=>{
    try {
        const orderId = req.params.id
        const userId = req.session.name
        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'products.products',
                select: 'image name price', // Select the fields you need
            })
            if(order.paymentMode=='onlinePayment'){
                await User.updateOne({ _id: userId }, { $inc: { wallet: order.total } });
            }
            await Order.updateOne({_id:orderId},{$set:{orderStatus:'canceled'}})
            res.redirect('/orders')

    } catch (error) {
        console.log(error.message)
    }
}

//order return
exports.returnOrder = async (req,res)=>{
    try {
        console.log('return order')
        const userId=req.session.name
        const orderId = req.params.id

        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'products.products',
                select: 'image name price', // Select the fields you need
            })
            if(order.paymentMode=='onlinePayment' || order.orderStatus=='delivered'){
                await User.updateOne({ _id: userId }, { $inc: { wallet: order.total } });
            }
            await Order.updateOne({_id:orderId},{$set:{orderStatus:'requested_for_return'}})
            res.redirect('/orders')


    } catch (error) {
        console.log(error.message)
    }
}