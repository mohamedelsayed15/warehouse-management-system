const multer = require('multer')

const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => { 
        cb(null,'images')
    },
    filename: (req, file, cb) => { 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix+file.originalname);
        //cb(null,file.filename +'-'+file.originalname)
    }
})
const fileFilter = (req,file,cb) => {
    if (!file.originalname.match(/\.(jpg|png|gif|jpeg)$/)){
        return cb(null, false) //reject
    }
    cb(null,true)//accept
    // if (
    //     file.mimetype === 'image/png' ||
    //     file.mimetype === 'image/jpg' ||
    //     file.mimetype === 'image/jpeg'
    //   ) {
    //     cb(null, true);
    //   } else {
    //     cb(null, false);
    //   }
}
const upload = multer({
    fileFilter,
    //storage: fileStorage,
}).single('image')

module.exports= upload