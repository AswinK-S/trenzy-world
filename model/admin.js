const mongoose = require('mongoose')

const adminData = mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password :{
        type: String,
        required: true
    }    
})


const admin =  mongoose.model('admin',adminData)
module.exports= admin