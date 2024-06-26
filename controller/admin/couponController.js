const Coupon = require('../../model/coupon')

// admin Coupon page
exports.adminCoupon = async (req,res)=>{
    try{
        let coupons = await Coupon.find({})
        res.render('admin/adminCoupon',{coupons})
    }catch(error){
        console.log(error)
    }
}


//admin add Coupon page
exports.getAddCoupon = async (req,res)=>{
    try {
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
        const name = req.body.name
         
        const coupon = await Coupon.find({})

        if(coupon.length > 0){
            const couponExists = await Coupon.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                purchaseLimit: req.body.limit,
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
            purchaseLimit : req.body.limit,
            description : req.body.description
        })
        await newCoupon.save()
        res.redirect('/admin/adminCoupon')
    } catch (error) {
        console.log(error.message)
    }
}


//coupon status
exports.couponStatus = async (req,res)=>{
    try{
        console.log('coupon status')
        const couponId = req.params.id
        const coupon = await Coupon.findOne({_id:couponId})

        if(coupon){
            console.log('object');
            if(coupon.status === true){
                await Coupon.findByIdAndUpdate({_id:couponId},{$set:{status:false}})
            }else{
                await Coupon.findByIdAndUpdate({_id:couponId},{$set:{status:true}})
            }
        }
        res.redirect('/admin/adminCoupon')
    } catch(error){
        console.log(error.message)
    }
}

//get coupon edit 
exports.getEditCoupon = async (req,res)=>{
    try{
        const couponId=req.params.id
        const couponExists = req.app.locals.couponExists
        req.app.locals.couponExists = null
        const coupon = await Coupon.findOne({_id:couponId})

        

        res.render('admin/editCoupon',{coupon,couponExists})
    }catch(error){
        console.log(error.message)
    }
}

// Post edit coupon
exports.postEditCoupon = async (req, res) => {
    try {
        const couponId = req.params.id; // Assuming you have the coupon ID in the URL
        const editedCoupon = await Coupon.findById(couponId); // Fetch the edited coupon

        if (!editedCoupon) {
            console.log('coupon not found');
            // Handle if the edited coupon doesn't exist
            req.app.locals.couponExists = 'Coupon not found';
            return res.redirect('/admin/adminCoupon/editCoupon/' + couponId); 
        }

        const name = req.body.name;
        if(!req.body.date){
            req.app.locals.couponExists = 'please select the date';
            return res.redirect('/admin/adminCoupon/editCoupon/' + couponId);
        }

        // Check for existing coupons with the same name, purchase limit, and expiry date
        const existingCoupon = await Coupon.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            purchaseLimit: req.body.limit,
            expiryDate: req.body.date,
        });

        if (existingCoupon) {
            req.app.locals.couponExists = 'Coupon with the same details already exists';
            return res.redirect('/admin/adminCoupon/editCoupon/' + couponId);
        }
        // If no conflicts are found, you can update the coupon
        editedCoupon.name = req.body.name;
        editedCoupon.discount = req.body.discount;
        editedCoupon.expiryDate = req.body.date;
        editedCoupon.purchaseLimit = req.body.limit;
        editedCoupon.description = req.body.description


        await editedCoupon.save();
        // console.log('Coupon updated:', editedCoupon);
        res.redirect('/admin/adminCoupon'); // Redirect to the adminCoupon page
    } catch (error) {
        console.log(error.message);
    }
}
