const category = require('../../model/category')


//list or unlist category
exports.categoryStatus = async (req, res) => {
    try {
        const categoryId = req.params.id
        const categoryData = await category.findOne({ _id: categoryId })


        if (categoryData) {
            if (categoryData.status === true) {
                await category.findByIdAndUpdate({ _id: categoryId }, { $set: { status: false } })
            } else {
                await category.findByIdAndUpdate({ _id: categoryId }, { $set: { status: true } })
            }
        }

        res.redirect('/admin/adminCategory')
    } catch (error) {
        console.log(error.message)
    }
}


// admin category page
exports.adminCategory = async (req, res) => {
    try {
        console.log('admin category page')

        const categoryData = await category.find({})

        var message = req.app.locals.specialContext;
        req.app.locals.specialContext = null

        res.render('admin/adminCategory', { message, categoryData })
    } catch (error) {
        console.log(error)
    }
}


//get edit category
exports.getCategoryEdit = async (req, res) => {
    try {

        const id = req.params.id
        console.log(id)
        const catagoryData = await category.findOne({ _id: id })


        res.render('admin/editCategory', { catagoryData })
    } catch (error) {
        console.log(error.message)
    }
}

// post edit category
exports.postEditCat = async (req, res) => {
    try {

        const editId = req.params.id
        let name = req.body.name
        await category.findByIdAndUpdate({ _id: editId }, { $set: { name: name } })

        if (req.file) {
            await category.findByIdAndUpdate({ _id: editId }, { $set: { image: req.file.filename } })
        }

        res.redirect('/admin/adminCategory')

    } catch (error) {
        console.log(error.message);
    }
}

// get add category page
exports.getAddCategory = async (req, res) => {
    try {

        let nameExist = req.app.locals.specialContext
        req.app.locals.specialContext = null

        res.render('admin/addCategory', { nameExist })

    } catch (error) {
        console.log(error.message);
    }
}


// post add categoty page
exports.postAddCategory = async (req, res) => {
    try {
        console.log("adding category")
        const name = req.body.name
        const image = req.file.filename
        const existingName = await category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingName) {
            req.app.locals.specialContext = 'Name already exists';
            return res.redirect('/admin/adminCategory/addCat')
        }

        const CategoryDet = new category({ name, image })
        await CategoryDet.save()


        res.redirect('/admin/adminCategory')
    } catch (error) {
        console.log(error.message)
    }
}