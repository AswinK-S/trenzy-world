const Products = require('../../model/product.js')
const Category = require('../../model/category')

// admin product page
exports.adminProduct =async (req,res)=>{
    try{
        const productData= await Products.find({}).populate("category")
        res.render('admin/adminProduct',{productData})
    }catch(error){
        console.log(error)
    }
}


//get add product
exports.addProduct = async (req, res) => {
    try {
        // Get the error message from res.locals
       
        const category = await Category.find({ status: true });
        res.render('admin/addProduct', { category });
    } catch (error) {
        console.log(error.message);
    }
}
   

//post add product
exports.postAddProduct = async (req, res) => {
    try {
        const { name, category, brand, price, quantity, description,size,offer,date } = req.body;
        let images = [];

        for (let file of req.files) {
            images.push(file.filename);
        }

        const categoryId = await Category.findOne({ name: category });
        // console.log('category', categoryId, category);

            await new Products({
                name: name,
                category: categoryId._id,
                brand,
                price,
                image: images,
                quantity,
                size,
                description,
                offer:offer,
                date,
            }).save();
        

        

        res.redirect('/admin/adminProduct');
    } catch (error) {
        console.log(error.message);
    }
};


//product list or unlist
exports.productStatus = async (req,res)=>{
    try {
        console.log('product status')
        const productId = await req.params.id
        // console.log('_id',productId)
        const productData = await Products.findOne({_id:productId})
        // console.log('proddata',productData)
        if(productData){
            console.log('sts',productData.status)
            if(productData.status===true){
                console.log('status changing to false')
                await Products.findByIdAndUpdate({_id:productId},{$set:{status:false}})
                console.log('status changing to false')
            }else{
                await Products.findByIdAndUpdate({_id:productId},{$set:{status:true}})
                console.log('status changing to true')
            }
        }
        res.redirect('/admin/adminProduct')
        
    } catch (error) {
        console.log(error.message)
    }
}

//edit product page
exports.editProduct = async (req,res)=>{
    try {
        console.log('edit product page')
        const prodId= req.params.id
        // console.log('PROD ID',prodId )
        const prodData = await Products.findOne({_id:prodId}).populate('category')
        const cateData= await Category.find({status:true})


        res.render('admin/editProduct',{prodData,cateData})
    } catch (error) {
        console.log(error.message)
    }
}

//post edit product
exports.postEditProd = async (req,res)=>{
    try {
        // console.log('post edit product')

        console.log('files',req.files)

        const prodId = req.params.id
        // console.log("prod _ID",prodId );
        // console.log('req.body',req.body );
        const {product_name,product_brand,category,product_price,product_description,product_quantity,offer,date,orginalPrice}=req.body
        
            const price = Number(product_price)
        

        // console.log(typeof product_price);

        const categoryId = await Category.findOne({name:category})
        // console.log('categoryId',categoryId);

        const editPrdData = await Products.updateOne({_id:prodId},{$set:{
            name : product_name,
            brand : product_brand,
            category:categoryId._id,
            price : price,
            quantity:product_quantity,
            description : product_description,
            expiryDate:date,
            offer:offer,
            orginalPrice:orginalPrice

        }})
        // console.log('edt',editPrdData)
        
        
        if(req.files && req.files.length>0){
            const images=req.files.map((file)=>file.filename)
            // console.log('images :',images);
            const product = await Products.findById(prodId)
            // console.log('image edit product ;',product)
            product.image.push(images[0])
            await product.save()
        }
        res.redirect('/admin/adminProduct')
    } catch (error) {
        console.log(error.message);
    }
}



//delete image 
exports.imageDelete = async (req,res)=>{
    try {
        console.log('delete image')
        const prodId = req.params.id
        const imageUrl = req.query.imageURL
        // console.log('imageurl : ', imageUrl,'prod id : ', prodId)

        const product = await Products.findById(prodId);
        if (!product) {
            console.log('Product not found');   
        }

        // Remove the imageUrl from the image array
        const updatedImages = product.image.filter((image) => image !== imageUrl);
        // Update the product document with the modified image array
        product.image = updatedImages;
        // Save the updated product document
        await product.save();
        res.redirect('/admin/adminProduct')

    } catch (error) {
        console.log(error.message)
    }
}