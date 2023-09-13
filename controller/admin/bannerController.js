// admin banner page

exports.adminBanner = (req,res)=>{
    try{
        console.log('banner page')
        res.render('admin/adminBanner')
    }catch(error){
        console.log(error)
    }
}