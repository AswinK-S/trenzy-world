const dotenv = require('dotenv').config();
const express = require('express')
const app = express()
const path = require('path');
const nocache = require ('nocache')
const session = require('express-session')


const connectDB = require('./config/database')


app.use((req,res,next)=>{
  res.set("Cache-control","no-store,no-cache")
  next()
})


// user route
const home = require('./router/user/userRoute')
// admin route
const admin = require('./router/admin/adminRoute')


app.use(express.urlencoded({ extended: true}));
app.use(express.json())

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
  }));


//static files
app.set('view engine','ejs')
app.set('views','./views')
app.use(express.static(path.join(__dirname,'public')))

//connect db
connectDB();

app.use('/',home)
app.use('/admin',admin)

app.listen(3000,()=>{
    console.log('server running on port http://localhost:3000')
})