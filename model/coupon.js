const mongoose = require('mongoose')

const coupon = mongoose.Schema({
    name :{
        type: String,
        required : true
    },
    discount :{
        type : Number,
        required : true
    },
    purchaseLimit:{
        type : Number,
        required : true
    },
    expiryDate : {
        type : Date ,
        required : true
    },
    status :{
        type : Boolean,
        default : true
    },
    users :{
        type : Array
    }
    
})

module.exports = mongoose.model('coupon',coupon)