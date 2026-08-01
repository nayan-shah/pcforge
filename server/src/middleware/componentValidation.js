import { body, validationResult } from 'express-validator';
import { deleteCloudinaryImages, getUploadedImageUrls } from './uploadMiddleware.js';
import { ApiError } from '../utils/apiError.js';

const CATEGORIES = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'HDD', 'PSU', 'Cabinet', 'Cooler', 'Monitor', 'Keyboard', 'Mouse'];
const STOCK_STATUSES = ['In Stock', 'Out of Stock', 'Preorder'];
const JSON_FIELDS = ['specifications', 'compatibility', 'prices'];

const parseJsonFields = (req, res, next) => {
  try {
    for (const field of JSON_FIELDS) {
      if (typeof req.body[field] === 'string' && req.body[field].trim()) {
        req.body[field] = JSON.parse(req.body[field]);
      }
    }
    if (req.body['tags[]'] !== undefined) {
      req.body.tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    }
    next();
  } catch {
    next(new ApiError(400, 'Specifications, compatibility, and prices must contain valid JSON.'));
  }
};

const validationRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters.'),
  body('brand').trim().notEmpty().withMessage('Brand is required.').isLength({ max: 80 }).withMessage('Brand cannot exceed 80 characters.'),
  body('category').trim().isIn(CATEGORIES).withMessage('Choose a valid component category.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),
  body('stockStatus').optional({ checkFalsy: true }).isIn(STOCK_STATUSES).withMessage('Choose a valid stock status.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
  body('tags.*').optional().trim().isLength({ max: 40 }).withMessage('Tags cannot exceed 40 characters.'),
  body('specifications').optional().isObject().withMessage('Specifications must be an object.'),
  body('compatibility').optional().isObject().withMessage('Compatibility must be an object.'),
  body('prices').optional().isArray().withMessage('Prices must be an array.'),
  body('prices.*.storeName').if(body('prices').exists()).trim().notEmpty().withMessage('Each price needs a store name.'),
  body('prices.*.productUrl').if(body('prices').exists()).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Each price needs a valid product URL.'),
  body('prices.*.currentPrice').if(body('prices').exists()).isFloat({ min: 0 }).withMessage('Prices must be non-negative.'),
  body('prices.*.currency').if(body('prices').exists()).isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code.'),
  body('rating').optional({ checkFalsy: true }).isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5.'),
  body('reviewCount').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Review count must be a non-negative integer.'),
];

const reportValidation = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  deleteCloudinaryImages(getUploadedImageUrls(req))
    .finally(() => next(new ApiError(400, 'Validation failed.', result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })))));
};

export const componentValidator = [parseJsonFields, ...validationRules, reportValidation];
