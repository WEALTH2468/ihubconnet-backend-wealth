const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const path = req.originalUrl.split('/');

    let destinationFolder = '';
    // Determine the destination folder based on the request endpointc
    console.log(path);
    switch (path[1]) {
      case 'documents':
        destinationFolder = 'document-library';
        break;
      case 'settings':
        destinationFolder = 'logo';
        break;
      default:
        destinationFolder = 'images'; // Default folder if endpoint doesn't match
    }

    callback(null, destinationFolder);
  },
  filename: (req, file, callback) => {
    // Remove spaces from the original filename
    const filenameWithoutSpaces = file.originalname.replace(/\s+/g, '');

    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(filenameWithoutSpaces);
    callback(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  },
});

module.exports = multer({ storage: storage }).fields([
  { name: 'background', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
  { name: 'picture', maxCount: 1 },
  { name: 'file', maxCount: 5 },
  { name: 'logo', maxCount: 1 },
  { name: 'customerPhoto', maxCount: 1 },
  { name: 'attachment', maxCount: 1 },
  { name: 'checkInOutImage', maxCount: 1 },
]);
