import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';


// Cloudinary storage configuration for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pcforge/components',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

// Filter to accept image mime-types only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Multer upload config (5MB limit per file)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// Middleware to handle uploading up to 5 images
export const uploadMultipleImages = (req, res, next) => {
  const uploadArray = upload.array('images', 5);

  uploadArray(req, res, (err) => {
    if (err) {
      let errorMessage = err.message;

      // Map multer-specific limits to custom messages
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'File size too large. Maximum size allowed is 5MB per file.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = 'Too many files. Maximum allowed is 5 images.';
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Image upload failed',
        error: errorMessage,
      });
    }

    // Attach uploaded secure URLs to req.body.images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => file.path);
    } else {
      req.body.images = req.body.images || [];
    }

    next();
  });
};

export default uploadMultipleImages;
