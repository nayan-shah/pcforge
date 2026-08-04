import multer from 'multer';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';

const storage = createCloudinaryStorage({
  cloudinary,
  folder: 'pcforge/components',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new ApiError(400, 'Only image files are allowed.'));
      return;
    }
    callback(null, true);
  },
});

export const getUploadedImageUrls = (req) =>
  (req.files || []).map((file) => file.path).filter(Boolean);

export const deleteCloudinaryImages = async (urls = []) => {
  await Promise.allSettled(urls.map(async (url) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^/.]+$/);
    if (match) await cloudinary.uploader.destroy(match[1]);
  }));
};

export const uploadMultipleImages = upload.array('images', 5);
