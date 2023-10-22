const mongoose = require('mongoose')

const products = mongoose.Schema({
    image:{
        type:Array,
    },
    name:{
        type:String,
        required:true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'category',
        required: true
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    quantity:{
        type:Number,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    description:{
        type : String,
        required:true
    },
    offer:{
        type: Number,
        default: 0,
    },
    expiryDate:{
        type : Date ,
        required : true
    },
    discountPrice:{
        type:Number,
        default : 0
    }

})

module.exports = mongoose.model('Products',products)