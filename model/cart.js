const mongoose =require('mongoose')

const cart = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products:[{
        products:{
            type : mongoose.Schema.Types.ObjectId,
            ref:'Products',
            required: true
        },
        price:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        size:{
            type:String,
            required:true
        }
    }],
    total : {
        type:Number,
        default: 0
    },
    couponApplied:{
        type:String
    }
})


module.exports = mongoose.model('cart',cart)