const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader(folder) {
  const uploadPath = path.join(process.cwd(), "uploads", folder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext);
    }
  });

  return multer({ storage });
}

module.exports = createUploader;
