const mongoose = require('mongoose')

const address = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    addressField:[{
        name:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        state:{
            type : String,
            required:true  
        },
        district:{
            type:String,
            required:true
        },
        town:{
            type:String,
            required:true
        },
        pincode:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        }
    }]
})

module.exports = mongoose.model('Address',address)