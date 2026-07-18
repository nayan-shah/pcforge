import express from 'express';
import * as componentController from '../controllers/componentController.js';
import { componentValidator } from '../middleware/componentValidation.js';
import { uploadMultipleImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();


// Create a component (with optional image upload)
router.post('/', uploadMultipleImages, componentValidator, componentController.createComponent);

// Get all components
router.get('/', componentController.getAllComponents);

// Get a component by ID
router.get('/:id', componentController.getComponentById);

// Update a component by ID (with optional image upload)
router.put('/:id', uploadMultipleImages, componentValidator, componentController.updateComponent);

// Delete a component by ID
router.delete('/:id', componentController.deleteComponent);

export default router;

