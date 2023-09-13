

// admin Coupon page
exports.adminCoupon = (req,res)=>{
    try{
        console.log('coupon page')
        res.render('admin/adminCoupon')
    }catch(error){
        console.log(error)
    }
}



