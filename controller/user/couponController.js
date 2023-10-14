const Coupon = require('../../model/coupon')
const Cart = require('../../model/cart')

exports.postCouponValidation = async (req, res) => {
    try {
        console.log('coupon validation');
        console.log('coupon code',req.body.couponCode)
        const couponCode = req.body.couponCode; // Corrected typo
        const userId = req.session.name;
        let cart = await Cart.findOne({ user: userId })
        console.log('coupon code', couponCode, 'user id:', userId, 'cart :', cart.total);
        const cartTotal = cart.total
        const orginalCartTotal = cartTotal
        req.session.orginalCartTotal = orginalCartTotal

       

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

            } else if (coupon.expiryDate < new Date()) {
                res.json({ success: false, message: 'coupon expired' })

            } else if (cartTotal >= coupon.purchaseLimit) {
                console.log('cart total before updation :', cartTotal)
                const newTotal = cartTotal - coupon.discount;
                console.log('new total_______________', newTotal)
                await Cart.updateOne({ user: userId }, { $set: { couponApplied:"pending" } })
                // console.log('cart total after updation :', nwCart.total)
                req.session.appliedCoupon = couponCode;
                req.session.payableTotal = newTotal
                return res.json({ success: true, newTotal, message: `flat discout of  ₹${coupon.discount} applied` });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


exports.postRemoveCoupon = async (req, res) => {
    try {
        console.log('removing the coupon-----------')
        const userId = req.session.name
        const orginalCartTotal = req.session.orginalCartTotal
        const couponCode = req.session.appliedCoupon || ""
        console.log('coupon code ;', couponCode)
        const coupon = await Coupon.findOne({
            name: couponCode,
            status: true,
        })
        console.log('coupon ', coupon)
        const cart = await Cart.findOne({ user: userId })
        console.log('cart :', cart)

        if (couponCode) {
            await Cart.updateOne({ user: userId }, { $set: { total: orginalCartTotal, couponApplied: "" } });
            req.session.payableTotal = orginalCartTotal;
            console.log('payable :',orginalCartTotal)
            req.session.appliedCoupon = "";
            res.json({ success: true, cartTotal: orginalCartTotal });
        } else {
            console.log('no coupon')
            return res.json({ success: false, orginalCartTotal, message: "not valid coupons" });
        }

    } catch (error) {
        console.log(error.message)
    }
}