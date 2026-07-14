import express from "express";
import * as componentController from "../controllers/componentController.js";

const router = express.Router();

/**
 * @route   POST /api/components
 * @desc    Create a new component
 * @access  Public
 */
router.post("/", componentController.createComponent);

/**
 * @route   GET /api/components
 * @desc    Retrieve all components with optional filtering, sorting, and pagination
 * @access  Public
 */
router.get("/", componentController.getAllComponents);

/**
 * @route   GET /api/components/:id
 * @desc    Retrieve a single component by its ID
 * @access  Public
 */
router.get("/:id", componentController.getComponentById);

/**
 * @route   PUT /api/components/:id
 * @desc    Update an existing component by its ID
 * @access  Public
 */
router.put("/:id", componentController.updateComponent);

/**
 * @route   DELETE /api/components/:id
 * @desc    Delete a component by its ID
 * @access  Public
 */
router.delete("/:id", componentController.deleteComponent);

export default router;
