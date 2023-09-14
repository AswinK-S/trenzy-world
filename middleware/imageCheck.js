
const checkImageCount = (req, res, next) => {
    console.log('image check middleware');
    const imageFileCount = req.files; // Access the value from req
  
    console.log('Number of uploaded images:', imageFileCount.length);
  
    if (imageFileCount.length !== 4) {
      req.app.locals.imageCountMessage = 'Please select exactly four image files.';
      return res.redirect('/admin/adminProduct/addProduct');
    }
    next();
};

module.exports = {checkImageCount}
