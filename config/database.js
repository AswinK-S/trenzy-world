const mongoose = require('mongoose')


mongoose.set('strictQuery',false);
const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI).then(()=>{
            console.log("Connected to MongoDB")
        })
        // console.log(`MongoDB Connected:${conn.connection.host}`)
    }catch(error){
        console.log("error from db")
        console.log(error);
    }
}

module.exports = connectDB;