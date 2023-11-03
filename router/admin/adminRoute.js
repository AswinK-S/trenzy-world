const express = require('express')
const admin = express()
const router = express.Router()
const nocache = require('nocache')
const uploadForCat = require('../../config/multerCate')//multer category
const uploadProd =require('../../config/multerProd')//multer product
const uploadBanner = require('../../config/multerBanner')//multer banner

//middlewear
const isAdmin = require('../../middleware/adminAuth')
const checkImage =require('../../middleware/imageCheck')

const  adminController = require('../../controller/admin/adminController')
const categoryController = require('../../controller/admin/categoryController')
const productController = require('../../controller/admin/productController')
const couponController = require('../../controller/admin/couponController')
const orderController = require('../../controller/admin/orderController')
const bannerController = require('../../controller/admin/bannerController')


// admin login page
admin.get('/',isAdmin.isLoggedOut,adminController.adminLogin)

// admin logout page
admin.get('/adminLogOut',adminController.logout)
admin.post('/adminLogOut',adminController.logout)


//admin dashboard
admin.get('/adminDash',isAdmin.isLoggedIn,adminController.getAdmin)
admin.post('/adminDash',adminController.adminDash)

//pdf sales report download
admin.get('/generatePDF', adminController.generatePDF);

// admin user 
admin.get('/adminUser',isAdmin.isLoggedIn,adminController.getUserData)
admin.get('/userStatus/:id',adminController.userStatus)            // block/unblock user


// admin product
admin.get('/adminProduct',isAdmin.isLoggedIn,productController.adminProduct)

admin.get('/adminProduct/addProduct',isAdmin.isLoggedIn,productController.addProduct)        // get addProduct
admin.post('/adminProduct/addProduct',uploadProd.array('image',10),checkImage.checkImageCount,productController.postAddProduct)//post product

admin.get('/productStatus/:id',productController.productStatus)  //product status
admin.get('/adminProduct/editProduct/:id',productController.editProduct) //product edit
admin.post('/adminProduct/edit/:id',uploadProd.array('image',4),productController.postEditProd)   //post product edit

admin.get('/producImagetDelete/:id',productController.imageDelete)  // product image delete


// admin category
admin.get('/adminCategory',isAdmin.isLoggedIn,categoryController.adminCategory)       //get category page

admin.get('/adminCategory/addCat',isAdmin.isLoggedIn,categoryController.getAddCategory)       //get  add category page
admin.post('/adminCategory/addCat',uploadForCat.single('image'),categoryController.postAddCategory)  //post category 

admin.get('/categoryStatus/:id',isAdmin.isLoggedIn,categoryController.categoryStatus)    //list or unlist category
admin.get('/adminCategory/edit/:id',isAdmin.isLoggedIn,categoryController.getCategoryEdit)     // edit category
admin.post('/adminCategory/edit/:id',uploadForCat.single('image'),categoryController.postEditCat)   // post edit category

// admin coupon
admin.get('/adminCoupon',isAdmin.isLoggedIn,couponController.adminCoupon)
admin.get('/addCoupon',couponController.getAddCoupon)
admin.get('/couponStatus/:id',couponController.couponStatus)
//add coupon
admin.post('/addCoupon',couponController.postAddCoupon)
//edit coupon
admin.get('/adminCoupon/editCoupon/:id',couponController.getEditCoupon)
//post edit coupon
admin.post('/adminCoupon/editCoupon/:id',couponController.postEditCoupon)

// admin order
admin.get('/adminOrder',isAdmin.isLoggedIn,orderController.adminOrder)
admin.get('/adminOrder/editOrder/:id',orderController.getAdminEditStatus)
admin.post('/adminOrder/orderEdit/:id',isAdmin.isLoggedIn,orderController.orderStatus)

// adnim banner
admin.get('/adminBanner',isAdmin.isLoggedIn,bannerController.adminBanner)

admin.get('/adminBanner/addBanner',isAdmin.isLoggedIn,bannerController.getAddBanner)       //get  add banner page
admin.post('/adminBanner/addBanner',uploadBanner.single('image'),bannerController.postAddBanner)  //post category 

admin.get('/adminBanner/edit/:id',isAdmin.isLoggedIn,bannerController.getbannerEdit)     // edit category
admin.post('/adminBanner/edit/:id',uploadBanner.single('image'),bannerController.postBannerEdit)   // post edit category



module.exports = admin