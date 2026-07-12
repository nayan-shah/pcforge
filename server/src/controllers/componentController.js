import mongoose from 'mongoose';
import Component from '../models/Component.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Create a new component.
 * Expects a valid component payload in req.body.
 */
export const createComponent = async (req, res) => {
  try {
    const component = await Component.create(req.body);
    return res.status(201).json({ success: true, data: component });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Retrieve all components from the catalog.
 * Supports optional search, category and brand filters, pagination, and sorting.
 */
export const getAllComponents = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      brand,
      sortBy = 'newest',
      order = 'desc',
    } = req.query;

    const filters = {};
    if (search) filters.name = { $regex: search.trim(), $options: 'i' };
    if (category) filters.category = category;
    if (brand) filters.brand = brand;

    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['prices.0.currentPrice'] = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortOptions.rating = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }

    const [components, total] = await Promise.all([
      Component.find(filters).sort(sortOptions).skip(skip).limit(limit).lean(),
      Component.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      data: components,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieve a single component by its ID.
 */
export const getComponentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid component ID' });
    }

    const component = await Component.findById(id).lean();
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    return res.status(200).json({ success: true, data: component });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing component.
 */
export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid component ID' });
    }

    const component = await Component.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    return res.status(200).json({ success: true, data: component });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete a component by ID.
 */
export const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid component ID' });
    }
    // test comment
    const component = await Component.findByIdAndDelete(id).lean();
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    return res.status(200).json({ success: true, message: 'Component deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
