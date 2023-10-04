const Order = require('../../model/order')
const User = require('../../model/customer')
const Products = require('../../model/product')

// get the orders page
exports.getOrderPage = async (req, res) => {
    try {
        console.log('order page');
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
            console.log('orders',orders)
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
        console.log("Single order details");
        const orderId= req.params.id
        const userId = req.session.name
        console.log('order id :',orderId,'user id :',userId)
        
        
        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'products.products',
                select: 'image name price', // Select the fields you need
            })
            
            console.log('orders :',order)
            const progress = calculateProgressBarWidth(order.orderStatus)

            console.log('progress :',progress, 'orderstatus :',order.orderStatus)

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
                    case 'pending_return_approval':
                        return '0%'; // You can set a common value for these statuses
                    default:
                        return '0%'; // Default width
                }
            }
            

        res.render('user/singleOrderDetail',{order,progress})

    } catch (error) {
        console.log(error.message)
    }
}