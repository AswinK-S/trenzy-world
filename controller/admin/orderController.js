const Order =require('../../model/order')

// admin order page
exports.adminOrder =async (req,res)=>{
    try {
        console.log('order page')
        const orders = await Order.find({}).populate({
            path: 'products.products',
            select: 'image name price', // Select the fields you need
        })
        
        console.log('orders___', orders)
        res.render('admin/adminOrder',{orders})
    } catch (error) {
        console.log(error)
    }
}




