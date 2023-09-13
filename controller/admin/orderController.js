

// admin order page
exports.adminOrder = (req,res)=>{
    try {
        console.log('order page')
        res.render('admin/adminOrder')
    } catch (error) {
        console.log(error)
    }
}

