import express from 'express';
import * as componentController from '../controllers/componentController.js';
import { componentValidator } from '../middleware/componentValidation.js';

const router = express.Router();

/**
 * @route   POST /api/components
 * @desc    Create a new PC component
 * @access  Public (Authentication middleware is excluded for now)
 * @body    { name, brand, category, description, images, prices, stockStatus, rating, reviewCount, createdBy }
 */
router.post('/', componentValidator, componentController.createComponent);

/**
 * @route   GET /api/components
 * @desc    Retrieve all PC components with optional filters (search, category, brand, minPrice, maxPrice),
 *          sorting (newest, oldest, priceLowToHigh, priceHighToLow, rating), and pagination
 * @access  Public
 */
router.get('/', componentController.getAllComponents);

/**
 * @route   GET /api/components/:id
 * @desc    Retrieve a single PC component details by its MongoDB ObjectId
 * @access  Public
 */
router.get('/:id', componentController.getComponentById);

/**
 * @route   PUT /api/components/:id
 * @desc    Update an existing PC component by its MongoDB ObjectId
 * @access  Public (Authentication middleware is excluded for now)
 * @body    { name, brand, category, description, images, prices, stockStatus, rating, reviewCount }
 */
router.put('/:id', componentValidator, componentController.updateComponent);

/**
 * @route   DELETE /api/components/:id
 * @desc    Delete a PC component by its MongoDB ObjectId
 * @access  Public (Authentication middleware is excluded for now)
 */
router.delete('/:id', componentController.deleteComponent);

export default router;
