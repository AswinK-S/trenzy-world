const Order = require('../../model/order')
const Address = require('../../model/adress')

// admin order page
exports.adminOrder = async (req, res) => {
    try {
        console.log('order page')
       
        const orders = await Order.find({}).populate({
            path: 'products.products',
            select: 'image name price', // Select the fields you need
        }).sort({ _id: -1 })




        // console.log('orders___', orders)
        res.render('admin/adminOrder', { orders })
    } catch (error) {
        console.log(error)
    }
}

// get admin order edit status
exports.getAdminEditStatus = async function (req, res) {
    try {
        console.log('edit page order status');
        const orderId = req.params.id
        const orders = await Order.findOne({ _id: orderId })
        // console.log('orders', orders)
        const address_Id = orders.address.addressId
        const userId = orders.user
        console.log('addid+__', address_Id)

        //find address
        const address = await Address.findOne({
            user: userId,
            addressField: {
                $elemMatch: {
                    _id: { $in: [address_Id] }
                }
            }
        })

        console.log('address__', address)
        res.render('admin/orderStatusEdit', { orders, address })
    } catch (error) {
        console.log(error.message)
    }
}

//admin post order status
exports.orderStatus = async (req, res) => {
    try {
        console.log('order status');
        const orderId = req.params.id
        const status = req.body.orderStatus
        // console.log('order status______', status, "orderid__", orderId)
        await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status } })
        res.redirect('/admin/adminOrder')
    } catch (error) {
        console.log(error.message)
    }
}
