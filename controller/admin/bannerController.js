const Banner = require('../../model/banner') 

// admin banner page
exports.adminBanner =async (req,res)=>{
    try{
        console.log('banner page')
        const banner = await Banner.find({})
        // console.log('bnner',banner)
        res.render('admin/adminBanner',{banner})
    }catch(error){
        console.log(error.message)
    }
}

//get add banner page
exports.getAddBanner = async (req,res)=>{
    try{

        console.log('add banner page')

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
        // console.log('existingName', existingName)
        if (existingName) {
            req.app.locals.specialContext = 'Name already exists';
            // console.log('banner exist')
            return res.redirect('/admin/adminBanner/addBanner')
        }

        const bannerDetail = new Banner ({ name, image,description })
        await bannerDetail.save()

        // console.log('banner save', bannerDetail)

        res.redirect('/admin/adminBanner')
    }catch(error){
        console.log(error.message)
    }
}

//get edit banner
exports.getbannerEdit = async(req,res)=>{
    try{
        console.log('edit page')
        const id = req.params.id
        // console.log('id___:',id)
        const banner =  await Banner.findOne({_id:id})
        // console.log('banner_____',banner)
        res.render('admin/editBanner',{banner})
    }catch(error){
        console.log(error.message)
    }
}

//post edit banner
exports.postBannerEdit = async (req,res)=>{
    try {
        console.log('editing banner');
        const editId = req.params.id

        let name = req.body.name
        let description = req.body.description
        // console.log('id :',editId,'name :',name);
        const editData = await Banner.findByIdAndUpdate({ _id: editId }, { $set: { name: name ,description:description} })
        // console.log('edit data ',editData)
        if (req.file) {
            await Banner.findByIdAndUpdate({ _id: editId }, { $set: { image: req.file.filename } })
        }

        res.redirect('/admin/adminBanner')

    } catch (error) {
        console.log(error.message)
    }
}