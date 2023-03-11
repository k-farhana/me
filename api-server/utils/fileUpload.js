const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
    // to store incoming file under uploads folder
    destination: function (req, file, cb) {
        const path = `./uploads`
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        console.log(file.fieldname);
        let t = file.originalname.split('.')
        let extension = t[t.length - 1]
        let generatedName = file.fieldname + '-' + uniqueSuffix + '.' + extension
        file.generatedName = generatedName
        cb(null, generatedName)
    }
})

// accepted mimetype
const MIMETYPES = ["image/png", "image/jpg", "image/jpeg"]

function acceptOnly(req, file, cb) {
    // console.log({ file });
    if (file.mimetype && MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        req.fileTypeError = true;
        cb(null, false)
    }
}


const UploadToDisk = multer({ storage: storage, limits: '1mb', fileFilter: acceptOnly, })

module.exports = { UploadToDisk }