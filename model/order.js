const mongoose =require('mongoose')

const orders = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    products:[{
        products:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Products',
            required:true
        },
        name:{
            type:String,
            required:true
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
        },
    
    }],
    orderStatus: {
        type:String
    },  
    paymentMode: {
        type: String,
        required:true
    },
    total: {
        type: Number
    },
    date: {
        type:Date
    },
    address: {
        type:Object
    },
    couponName : {
        type : String
    }

})

module.exports = mongoose.model('orders',orders)