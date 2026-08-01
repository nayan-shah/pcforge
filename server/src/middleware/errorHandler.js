import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

const normaliseError = (err) => {
  if (err instanceof ApiError) return err;
  if (err.statusCode) return new ApiError(err.statusCode, err.message);

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Each image must be 5 MB or smaller.'
      : err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'A maximum of 5 images can be uploaded.'
        : 'Image upload failed.';
    return new ApiError(400, message);
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return new ApiError(400, 'Validation failed.', details);
  }

  if (err.name === 'CastError') return new ApiError(400, 'Invalid resource identifier.');
  if (err.code === 11000) return new ApiError(409, 'A record with those values already exists.');
  return new ApiError(500, 'An unexpected server error occurred.');
};

const errorHandler = (err, req, res, next) => {
  // Keep Express' four-argument error-middleware signature.
  void next;
  const error = normaliseError(err);

  if (error.statusCode >= 500) {
    console.error(err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    data: null,
    ...(error.details ? { errors: error.details } : {}),
  });
};

export default errorHandler;
