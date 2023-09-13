const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: ((req, file, cb) => {
        console.log('file',file)
        cb(null, path.join(__dirname, '../public/categoryImages'))
    
    }),
    filename: ((req, file, cb) => {
        console.log('filename',file)
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    })
})
const upload = multer({ storage: storage })

module.exports = upload