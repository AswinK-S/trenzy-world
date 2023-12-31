const mongoose = require('mongoose')

const customer = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required: true,
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    isVerified:{
        type:Boolean
    },
    wallet:{
        type:Number,
        default: 0
    },
    referral:{
        type:String
    }


})

const user = mongoose.model('user',customer)
module.exports = user





