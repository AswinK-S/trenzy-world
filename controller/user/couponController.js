const Coupon = require('../../model/coupon')
const Cart = require('../../model/cart')

exports.postCouponValidation = async (req, res) => {
    try {
        console.log('coupon validation');
        const couponCode = req.body.couponCode; // Corrected typo
        const userId = req.session.name;
        const cart = await Cart.findOne({user: userId})
        console.log('coupon code', couponCode, 'user id:', userId,'cart :',cart.total);
         const cartTotal = cart.total
        const coupon = await Coupon.findOne({
            name: couponCode,
            status: true,
        });

        console.log('coupon:', coupon);

        if (coupon) {
            console.log('Coupon is there');

            if (coupon.users.includes(userId)) {

                console.log('Already claimed the coupon');
                return res.json({ success: false, message: "Already claimed the coupon" });

            } else if (cartTotal <= coupon.purchaseLimit) {

                return res.json({ success: false, message: `Minimum Purchase of ₹${coupon.purchaseLimit} is required` });

            } else if (coupon.expiryDate < new Date()){

                res.json({success:false,message:'coupon expired'})

            }else if (cartTotal >= coupon.purchaseLimit) {
                const newTotal = cartTotal - coupon.discount;
                return res.json({ success: true, newTotal });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
