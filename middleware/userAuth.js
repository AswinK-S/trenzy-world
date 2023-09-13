const User = require('../model/customer')



//checking user session and user status
const loggedIn = async (req, res, next) => {
    try {

        if (req.session.name && req.session.status) {
            console.log(req.session.name)
            next()
        } else {
            req.session.destroy()
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error);
    }
}

//checks the user blocked or not
const blockStatus = async (req,res,next)=>{
    try {
        if(req.session.name){
            const userDeatail = await User.findOne({_id:req.session.name})
            console.log('midlwre userdata',userDeatail)
            if(userDeatail && userDeatail.status){
                return next()
            }else{
                console.log('user blocked')
                req.app.locals.specialContext="user blocked"
                req.session.destroy()
                res.redirect('/login')
            }
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}



// checking user is logged in or not
const loggedOut = async (req, res, next) => {
    try {
        if (!req.session.name ) {
            console.log('user')
            next()
            
        } else {
            console.log('middlewear session is there')
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = { loggedIn, loggedOut,blockStatus }