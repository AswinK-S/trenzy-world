const Banner = require('../../model/banner') 

// admin banner page
exports.adminBanner =async (req,res)=>{
    try{
        const banner = await Banner.find({})
        res.render('admin/adminBanner',{banner})
    }catch(error){
        console.log(error.message)
    }
}

//get add banner page
exports.getAddBanner = async (req,res)=>{
    try{


        let nameExist = req.app.locals.specialContext
        req.app.locals.specialContext = null

        res.render('admin/addBanner', { nameExist })

    }catch(error){
        console.log(error.message);
    }
}

//post add banner 
exports.postAddBanner = async (req,res)=>{
    try{
        console.log("adding banner")
        const name = req.body.name
        const description =req.body.description
        const image = req.file.filename
        const existingName = await Banner.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingName) {
            req.app.locals.specialContext = 'Name already exists';
            return res.redirect('/admin/adminBanner/addBanner')
        }

        const bannerDetail = new Banner ({ name, image,description })
        await bannerDetail.save()


        res.redirect('/admin/adminBanner')
    }catch(error){
        console.log(error.message)
    }
}

//get edit banner
exports.getbannerEdit = async(req,res)=>{
    try{
        const id = req.params.id
        const banner =  await Banner.findOne({_id:id})
        res.render('admin/editBanner',{banner})
    }catch(error){
        console.log(error.message)
    }
}

//post edit banner
exports.postBannerEdit = async (req,res)=>{
    try {
        const editId = req.params.id

        let name = req.body.name
        let description = req.body.description
        const editData = await Banner.findByIdAndUpdate({ _id: editId }, { $set: { name: name ,description:description} })
        if (req.file) {
            await Banner.findByIdAndUpdate({ _id: editId }, { $set: { image: req.file.filename } })
        }

        res.redirect('/admin/adminBanner')

    } catch (error) {
        console.log(error.message)
    }
}