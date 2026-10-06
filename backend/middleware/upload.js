import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // field name prefix keeps portrait and CV names unique even if saved in the same millisecond
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

// Images (portrait): check both the extension and the declared mimetype
// (relying on mimetype alone is spoofable, but this still blocks the vast
// majority of accidental/casual misuse).
const imageTypes = /jpeg|jpg|png|gif|webp/;

// CV: PDF, DOC and DOCX only
const cvExtensions = [".pdf", ".doc", ".docx"];
const cvMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // The hero form sends the CV in a field named "cv"
  if (file.fieldname === "cv") {
    if (cvExtensions.includes(ext) && cvMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("CV must be a PDF, DOC or DOCX file"));
  }

  // Every other upload field is treated as an image, as before
  const extOk = imageTypes.test(ext);
  const mimeOk = imageTypes.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max, matches the admin form
  },
});

export default upload;