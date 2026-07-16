import { body, validationResult } from 'express-validator';


export const componentValidationRules = [
  // Validate name (required, 3-100 chars)
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  // Validate brand (required)
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),

  // Validate category (required, enum)
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'CPU',
      'GPU',
      'Motherboard',
      'RAM',
      'SSD',
      'HDD',
      'PSU',
      'Cabinet',
      'Cooler',
      'Monitor',
      'Keyboard',
      'Mouse',
    ])
    .withMessage(
      'Category must be one of: CPU, GPU, Motherboard, RAM, SSD, HDD, PSU, Cabinet, Cooler, Monitor, Keyboard, Mouse'
    ),

  // Validate description (optional, max 2000 chars)
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  // Validate images array
  body('images')
    .isArray()
    .withMessage('Images must be an array'),

  // Validate prices array
  body('prices')
    .isArray()
    .withMessage('Prices must be an array'),

  // Validate stockStatus (optional, enum)
  body('stockStatus')
    .optional()
    .trim()
    .isIn(['In Stock', 'Out of Stock', 'Preorder'])
    .withMessage('Stock status must be one of: In Stock, Out of Stock, Preorder'),

  // Validate rating (optional, float 0-5)
  body('rating')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a number between 0 and 5'),

  // Validate reviewCount (optional, non-negative integer)
  body('reviewCount')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Review count must be a non-negative integer'),
];


// Middleware to check validation results and return formatted errors
export const validateComponent = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return errors in clean JSON format
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
        location: err.location,
      })),
    });
  }
  next();
};


export const componentValidator = [...componentValidationRules, validateComponent];

export default componentValidator;
