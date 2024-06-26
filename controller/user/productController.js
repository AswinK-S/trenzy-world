const Product = require('../../model/product.js')
const Category = require('../../model/category.js');
const dotenv = require('dotenv').config()



// shop page
exports.shopPage = async (req, res) => {
    try {
        let search = req.query.search || '';
        search = search.replace(/\+$/, '').trim();
        const queryString = search.replace(/\+$/, '').trim();
        const user = req.session.name
        const price = req.query.price;
        let sort = req.query.sort || { name: 1 }
        let query = {
            status: true,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ]
        }

        // Function to search and set category in the queryy
        const setSearchCategory = async (queryString) => {
            if (queryString.length > 0) {
                let searchTerm = queryString.toLowerCase()
                const matchingCategories = await Category.find({
                    name: { $regex: new RegExp(queryString, 'i') }
                });

                if (matchingCategories.length > 0) {
                    if(matchingCategories.length===1){
                    catName = matchingCategories[0]._id;
                    query.category = catName;
                    
                    }else{
                       let result= matchingCategories.filter((item)=>{return item.name.toLowerCase()===searchTerm})
                       if(result){
                         catName=result[0]._id
                        query.category=catName
                       }
                    }

                }
            }
        }

        // Call the function to set the category based on the search query
        await setSearchCategory(queryString);

        if (typeof price === 'string') {
            const price1 = parseInt(price);
            const minPrice = price1 - 999;
            const maxPrice = price1;

            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            };
        } else if (Array.isArray(price)) {
            minPrice = Math.min(...price.map(Number)) - 999;
            maxPrice = Math.max(...price.map(Number));
            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            };
        }


        if (sort == 1) {
            sort = { price: 1 }
        } else {
            sort = { price: -1 }
        }


        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 6;

        const product = await Product.find(query).limit(limit * 1).skip((page - 1) * limit).sort(sort);
        const products = await Product.find({})
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        const currentDate = new Date();

        // Render the shop page template with products and pagination data
        res.render('user/shop', { user, product, totalPages,page, queryString, currentDate });
    } catch (error) {
        console.log(error.message);
    }
}




// product detail page
exports.singleProduct = async (req, res) => {
    try {
        const user = req.session.name
        const id = req.params.id
        let product = await Product.findById({ _id: id })
        const currentDate = new Date();

        if (product.offer && product.expiryDate) {

            if (currentDate <= product.expiryDate) {

                if (product.orginalPrice === 0) {


                    let orgnlPrice = product.price
                    let discountPrice = (orgnlPrice * product.offer) / 100
                    let finalDiscPrce = Math.ceil(orgnlPrice - discountPrice)
                    await Product.updateOne({ _id: id }, { $set: { discountPrice: finalDiscPrce } })
                    await Product.updateOne({_id:id},{$set:{price:finalDiscPrce}})
                    await Product.updateOne({_id:id},{$set:{orginalPrice:orgnlPrice}})
                }

            }
        }

        res.render('user/product', { user, product, currentDate })
    } catch (error) {
        console.log(error.message);
    }
}