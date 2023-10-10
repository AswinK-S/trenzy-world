const Coupon = require('../../model/coupon')

// admin Coupon page
exports.adminCoupon = async (req,res)=>{
    try{
        console.log('coupon page')
        let coupons = await Coupon.find({})
        res.render('admin/adminCoupon',{coupons})
    }catch(error){
        console.log(error)
    }
}


//admin add Coupon page
exports.getAddCoupon = async (req,res)=>{
    try {
        console.log('get add coupon page')
        const couponExists = req.app.locals.couponExists
        req.app.locals.couponExists = null
        res.render('admin/addCoupon',{couponExists})
    } catch (error) {
        console.log(error.message)
    }
}

//admin post add coupon
exports.postAddCoupon = async (req,res)=>{
    try {
        console.log('adding coupon',req.body)
        const name = req.body.name
         
        const coupon = await Coupon.find({})
        console.log("coupon",coupon.length)

        if(coupon.length > 0){
            const couponExists = await Coupon.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                purchaseLimit: purchaseLimit,
            });

            if(couponExists){
                req.app.locals.couponExists ='already existing coupon'
                res.redirect('/addCoupon')
            }
        }
       

       
        //create new coupon
        const newCoupon = new Coupon ({
            name:req.body.name,
            discount:req.body.discount,
            expiryDate : req.body.date,
            purchaseLimit : req.body.limit
        })
        await newCoupon.save()
        console.log('coupon', newCoupon)
        res.redirect('admin/adminCoupon')
    } catch (error) {
        console.log(error.message)
    }
}
