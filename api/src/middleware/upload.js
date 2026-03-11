import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) { 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `artist-${uniqueSuffix}${extension}`);
  }
});
 
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
 
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  
  }
}).fields([
  { name: 'photo', maxCount: 1 }, 
  { name: 'role' },
  { name: 'name' },
  { name: 'email' },
  { name: 'phone' },
  { name: 'category' },
  { name: 'city' },
  { name: 'portfolio_url' },
  { name: 'password' },
  { name: 'business_type' },
  { name: 'address_line' },
  { name: 'state_region' },
  { name: 'postal_code' },
  { name: 'country' },
]);
 
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
    }
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ success: false, error: error.message });
  }
  next(error);
};
 
export const getImageUrl = (filename) => {
  if (!filename) return null;
  const port = process.env.PORT || 4000;
  return `http://localhost:${port}/uploads/images/${filename}`;
};
