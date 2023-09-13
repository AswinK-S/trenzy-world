const admin = require('../../model/admin.js')
const User = require('../../model/customer.js')


//login page
exports.adminLogin = async (req,res,next)=>{
    try{
        var passwordError = req.app.locals.specialContext
        req.app.locals.specialContext =null

        console.log("adminlogin page")

        res.render('admin/adminLogin',{passwordError})
    }catch(error){
        console.log(error.message)
    }
}


//dashboard
exports.getAdmin = async (req,res,next)=>{
    try {
            console.log ('admin dashboard')
            res.render('admin/adminDash')
        
        
    } catch (error) {
        console.log(error)
    }
}


//logout
exports.logout = async (req,res) =>{
    try {
    console.log("session before logging out",req.session.isLogged);

    req.session.destroy()
    console.log("session after logout",req.session);
    res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}


//post admin dashboard
exports.adminDash =async (req,res)=>{
    try {
     console.log('admin credentials checking')  
     console.log (req.body.email)
     console.log(admin)

     const adminData = await admin.findOne({email:req.body.email}) 
      if(adminData){
        if(req.body.password===adminData.password){
            req.session.isLogged=req.body.email;
            console.log('admin password and email is correct',req.session.isLogged)
            res.redirect('/admin/adminDash')
        }else{
            req.app.locals.specialContext = "incorrect password or email"
            res.redirect('/admin')
        }
      } else{
        req.app.locals.specialContext ="incorrct admin details"
        res.redirect('/admin',)
      }
    }catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');

    }
}



// admin user page
exports.getUserData = async (req,res)=>{
    try{
        const users = await User.find({})
        res.render('admin/adminUser',{users})
        
    }catch(error){
        console.log(error)
    }
}


//block and unblock user

exports.userStatus = async (req,res)=>{
    try {
        const userId = req.params.id
        const userData = await User.findById({_id:userId})
        console.log("user Data", userData)
        if(userData){
            if(userData.status === true){
            await User.findByIdAndUpdate({_id:userId},{$set:{status:false}})
            }else{
                await User.findByIdAndUpdate({_id:userId},{$set: {status : true}})
            }
        }
        console.log("redirecting after blocking or unblocking")
        res.redirect('/admin/adminUser')
    } catch (error) {
        console.log(error.message)
    }
}







