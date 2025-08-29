const multer = require("multer");
const path = require("path");
const fs = require("fs");

const doctorFolder = path.join(__dirname, "../uploads/doctor");

const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
ensureFolderExists(doctorFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath;
    if (file.fieldname === "doctor_Image") {
      folderPath = path.join(doctorFolder, "images");
    } else if (file.fieldname === "doctor_Agreement") {
      folderPath = path.join(doctorFolder, "agreements");
    }
    ensureFolderExists(folderPath);

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const randomNumber = Math.floor(Math.random() * 10000); 
    cb(null, `${Date.now()}_${randomNumber}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Allowed types are images, Excel, and PDF."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
