import express from 'express';
import * as componentController from '../controllers/componentController.js';
import { componentValidator } from '../middleware/componentValidation.js';
import { uploadMultipleImages } from '../middleware/uploadMiddleware.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public routes (no auth required) ────────────────────────────────
// Any user can browse and view components (used by catalog, builder, etc.)

// Get all components (paginated, filterable, sortable)
router.get('/', componentController.getAllComponents);

// Get related products for a component by its ID.
router.get('/:id/related', componentController.getRelatedComponents);

// Get a single component by ID.
router.get('/:id', componentController.getComponentById);

// ── Admin-only routes (JWT + admin role required) ────────────────────
// authMiddleware verifies the JWT and sets req.user.
// adminMiddleware performs a DB lookup to confirm the user's role is 'admin'.

// Create a new component (with optional image upload)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  uploadMultipleImages,
  componentValidator,
  componentController.createComponent,
);

// Update an existing component (with optional image replacement)
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  uploadMultipleImages,
  componentValidator,
  componentController.updateComponent,
);

// Delete a component (also purges its Cloudinary images)
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  componentController.deleteComponent,
);

export default router;
