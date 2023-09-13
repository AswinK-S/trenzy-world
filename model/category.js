const mongoose = require('mongoose')

const category = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    status:{
        type : Boolean,
        default: true
    },
    image : {
        type : String
    }
})

module.exports = mongoose.model('category',category)