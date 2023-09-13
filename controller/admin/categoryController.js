const category = require('../../model/category')


//list or unlist category
exports.categoryStatus = async (req,res)=>{
    try {
        const categoryId = req.params.id
        const categoryData = await category.findOne({_id:categoryId})

        console.log('category status',categoryId,categoryData)

        if(categoryData){
            if(categoryData.status === true){
                await category.findByIdAndUpdate({_id:categoryId},{$set:{status : false}})
                console.log("category unlisted")
            }else{
                await category.findByIdAndUpdate({_id:categoryId},{$set:{status : true}})
                console.log('category listed')
            }
        }
        console.log("redirecting")

        res.redirect('/admin/adminCategory')
    } catch (error) {
        console.log(error.message)
    }
}


// admin category page
exports.adminCategory = async (req,res)=>{
    try{
        console.log('admin category page')

        const categoryData = await category.find({})
        console.log('categoryData',categoryData);

        var message = req.app.locals.specialContext;
        req.app.locals.specialContext = null

        res.render('admin/adminCategory',{message ,categoryData})
    }catch(error){
        console.log(error)
    }
    }


//get edit category
exports.getCategoryEdit = async (req,res)=>{
    try {
        console.log('edit cate')
    
        const id = req.params.id
        console.log(id)
        const catagoryData = await category.findOne({_id:id})

        console.log('img',catagoryData.image)

       res.render('admin/editCategory',{catagoryData,}) 
    } catch (error) {
        console.log(error.message)
    }
}    

// post edit category
exports.postEditCat = async (req,res)=>{
    try {
        console.log('post edt cate')
        
        const editId = req.params.id
        let name = req.body.name 
        const editData = await category.findByIdAndUpdate({_id:editId},{$set:{name:name}}) 

        if(req.file){
           await category.findByIdAndUpdate({_id:editId},{$set:{image:req.file.filename}})
        }
        
        res.redirect('/admin/adminCategory')

    } catch (error) {
        console.log(error.message);
    }
}

// get add category page
exports.getAddCategory = async (req,res)=>{
    try {
        console.log('add cate')

        let nameExist=req.app.locals.specialContext
        req.app.locals.specialContext=null
        
        res.render('admin/addCategory',{nameExist})

    } catch (error) {
        console.log(error.message);
    }
}


// post add categoty page
exports.postAddCategory = async (req,res)=>{
    try {
        console.log("adding category")
        const categoryData = await category.find({})

        const name = req.body.name
        const image = req.file.filename
        // const existingName = await category.findOne({name})
        const existingName = await category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        console.log('existingName',existingName)
        if(existingName){
            req.app.locals.specialContext = 'Name already exists';
            console.log('category exist')
           return res.redirect('/admin/adminCategory/addCat')
        }

        const CategoryDet = new category ({name,image})
        const cateData = await CategoryDet.save()

        console.log('catagory save',CategoryDet)

        res.redirect('/admin/adminCategory')
    } catch (error) {
        console.log(error.message)
    }
}