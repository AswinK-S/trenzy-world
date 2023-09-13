const admin = require('../model/admin')



const isLoggedIn = async (req,res,next)=>{
try {
    console.log('middlewear')
    if(req.session.isLogged){
        console.log("here",req.session.isLogged)
        next()
    }else{
    console.log("from here",req.session.isLogged)
    return  res.redirect('/admin')
    }
} catch (error) {
    console.log(error.message)
}
}


const isLoggedOut = async (req,res,next)=>{
    try {
        if(req.session.isLogged){
            console.log("trying to logout session is there",req.session.isLogged)
            res.redirect('admin/adminDash')
        }else{
            console.log('this')
            return next()
        }
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {isLoggedIn,isLoggedOut}