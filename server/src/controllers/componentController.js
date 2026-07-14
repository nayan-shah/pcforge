import mongoose from 'mongoose';
import Component from '../models/Component.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({ success, message, data });
};

/**
 * Create a new component.
 */
export const createComponent = async (req, res) => {
  try {
    const { name, brand, category, createdBy } = req.body;

    if (!name || !brand || !category || !createdBy) {
      return sendResponse(res, 400, false, 'Name, brand, category, and createdBy are required.', null);
    }

    const component = await Component.create(req.body);
    return sendResponse(res, 201, true, 'Component created successfully.', component);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendResponse(res, 400, false, 'Validation failed.', error.message);
    }

    return sendResponse(res, 500, false, 'Failed to create component.', error.message);
  }
};

/*
  Retrieve all components with search, filtering, sorting, and pagination.
 */
export const getAllComponents = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const {
      search = '',
      category = '',
      brand = '',
      minPrice,
      maxPrice,
      sort = 'newest',
    } = req.query;

    const filters = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category) filters.category = category;
    if (brand) filters.brand = { $regex: brand.trim(), $options: 'i' };

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters['prices.currentPrice'] = {};

      if (minPrice !== undefined) {
        filters['prices.currentPrice'].$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filters['prices.currentPrice'].$lte = Number(maxPrice);
      }
    }

    let sortOptions = { createdAt: -1 };

    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'priceLowToHigh':
        sortOptions = { 'prices.currentPrice': 1 };
        break;
      case 'priceHighToLow':
        sortOptions = { 'prices.currentPrice': -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const [components, totalCount] = await Promise.all([
      Component.find(filters).sort(sortOptions).skip(skip).limit(limit).lean(),
      Component.countDocuments(filters),
    ]);

    return sendResponse(res, 200, true, 'Components fetched successfully.', {
      components,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to fetch components.', error.message);
  }
};

/**
 * Retrieve a single component by its ID.
 */
export const getComponentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, false, 'Invalid component ID.', null);
    }

    const component = await Component.findById(id).lean();
    if (!component) {
      return sendResponse(res, 404, false, 'Component not found.', null);
    }

    return sendResponse(res, 200, true, 'Component fetched successfully.', component);
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to fetch component.', error.message);
  }
};

/**
 * Update an existing component.
 */
export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, false, 'Invalid component ID.', null);
    }

    const component = await Component.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!component) {
      return sendResponse(res, 404, false, 'Component not found.', null);
    }

    return sendResponse(res, 200, true, 'Component updated successfully.', component);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendResponse(res, 400, false, 'Validation failed.', error.message);
    }

    return sendResponse(res, 500, false, 'Failed to update component.', error.message);
  }
};

/**
 * Delete a component by ID.
 */
export const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, false, 'Invalid component ID.', null);
    }

    const component = await Component.findByIdAndDelete(id).lean();
    if (!component) {
      return sendResponse(res, 404, false, 'Component not found.', null);
    }

    return sendResponse(res, 200, true, 'Component deleted successfully.', null);
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to delete component.', error.message);
  }
};
