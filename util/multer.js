const multer = require('multer')
const { makeDirectory } = require('./file')


const upload = (UPC_ID, filemimeType) => {
    console.log("sssss")
    const fileStorage = multer.diskStorage({
        destination: async (req, file, cb) => { 

            //const directoryPath = await makeDirectory(UPC_ID)
            cb(null,`images`)
        },
        filename: (req, file, cb) => { 
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // cb(null, file.fieldname + '-' + uniqueSuffix+file.originalname);
            cb(null, `productImageMulter-${UPC_ID}.${filemimeType}`);
        }
    })

    return multer({
        storage: fileStorage,
    }).single('image')
} 

const upload2 = () => {
    const fileStorage = multer.diskStorage({
        destination: async (req, file, cb) => { 

            //const directoryPath = await makeDirectory(UPC_ID)
            cb(null,`images`)
        },
        filename: (req, file, cb) => { 
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // cb(null, file.fieldname + '-' + uniqueSuffix+file.originalname);
            //cb(null, `productImageMulter-${UPC_ID}.${filemimeType}`);
        }
    })
    
    const fileFilter = (req,file,cb) => {
        if (!file.originalname.match(/\.(jpg|png|gif|jpeg)$/)){
            return cb(null, false) //reject
        }
        cb(null,true)//accept
    }
    return multer({
        fileFilter
    }).single('image')
} 



module.exports = { upload, upload2 }
