const Product = require('../../model/product.js')
const Category = require('../../model/category.js');
const dotenv = require('dotenv').config()



// shop page
exports.shopPage = async (req, res) => {
    try {
        let search = req.query.search || '';
        search = search.replace(/\+$/, '').trim();
        const queryString = search.replace(/\+$/, '').trim();
        console.log("queryString", queryString);
        const user = req.session.name
        const price = req.query.price;
        let sort = req.query.sort || {name:1}
        console.log("price : ", req.query.price);
        let query = { status: true,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ]
        }

        // Function to search and set category in the queryy
        const setSearchCategory = async (queryString) => {
            if (queryString.length > 0) {
                const matchingCategories = await Category.find({
                    name: { $regex: new RegExp(queryString, 'i') }
                });

                if (matchingCategories.length > 0) {
                    console.log('Matching Categories', matchingCategories);
                    catName = matchingCategories[0]._id;
                    console.log('name', catName);
                    query.category = catName;
                }
            }
        }

        // Call the function to set the category based on the search query
        await setSearchCategory(queryString);

        if (typeof price === 'string') {
            console.log('price', price, queryString);
            const price1 = parseInt(price);
            const minPrice = price1 - 999;
            const maxPrice = price1;
            console.log('string', minPrice, maxPrice);

            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            };
            console.log('price single', query);
        } else if (Array.isArray(price)) {
            console.log('price2', price, queryString);
            minPrice = Math.min(...price.map(Number)) - 999;
            maxPrice = Math.max(...price.map(Number));
            console.log('ara', minPrice, maxPrice);
            query.price = {
                $gte: minPrice,
                $lte: maxPrice
            };
        }


        if(sort==1){
            sort={price:1}
        }else{
            sort={price:-1}
        }


        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 6;

        console.log('query', query);
        const product = await Product.find(query).limit(limit * 1).skip((page - 1) * limit).sort(sort);
        const products =await Product.find({})
        console.log('product QUANTITY', products.quantity);

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        // Render the shop page template with products and pagination data
        res.render('user/shop', { user, product, totalPages, currentPage: page, page, queryString });
    } catch (error) {
        console.log(error.message);
    }
}




// product detail page
exports.singleProduct = async (req, res) => {
    try {
        console.log('product page');
        const user = req.session.name
        const id = req.params.id
        console.log('id', id)
        const product = await Product.findById({ _id: id })
        console.log('product', product)
        res.render('user/product', { user, product})
    } catch (error) {
        console.log(error.message);
    }
}