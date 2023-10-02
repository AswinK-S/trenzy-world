const Order = require('../../model/order')
const User = require('../../model/customer')
const Products = require('../../model/product')

//get the orders page
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

        let totalOrdersCount = await Order.find({ user: userId }).count();
        let pageCount = Math.ceil(totalOrdersCount / limit);

        res.render('user/orders', { userData, orders, pageCount, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
};
