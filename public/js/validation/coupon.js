const couponError = document.getElementById('cError')
const editCouopon = document.getElementById('cEditError')

const cNameRegex = /^[a-zA-Z0-9]+$/

function coupon() {
    let name = document.getElementById('addCouponName').value

    if (name.length === 0) {
        couponError.innerHTML = "Name required!";
        return false;
    }

    if (!cNameRegex.test(name)) {
        couponError.innerHTML = "Coupon name should only contain alphabets and numbers without spaces.";
        return false;
    }

    couponError.innerHTML = ""
    return true

}

function editCouopon() {
    let name = document.getElementById('addCouponName').value
    if (name.length === 0) {
        couponError.innerHTML = "Name required!";
        return false;
    }

    if (!cNameRegex.test(name)) {
        couponError.innerHTML = "Coupon name should only contain alphabets and numbers without spaces.";
        return false;
    }

    couponError.innerHTML = ""
    return true
}