import mongoose from 'mongoose';
import Component from '../models/Component.js';
import cloudinary from '../config/cloudinary.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Consistent response envelope used by all controller methods.
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({ success, message, data });
};

/**
 * Extracts a Cloudinary public_id from a secure URL so we can call
 * cloudinary.uploader.destroy() on it.
 *
 * Cloudinary URLs follow the pattern:
 *   https://res.cloudinary.com/<cloud>/<resource_type>/upload/<version>/<folder/public_id>.<ext>
 *
 * We need everything between /upload/<version>/ and the file extension.
 * Example:
 *   "https://res.cloudinary.com/demo/image/upload/v1234/pcforge/components/abc.jpg"
 *   → "pcforge/components/abc"
 */
const extractPublicId = (url) => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // Remove the optional version segment (e.g. "v1234/")
    const afterUpload = parts[1].replace(/^v\d+\//, '');

    // Strip the file extension
    const publicId = afterUpload.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch {
    return null;
  }
};

/**
 * Deletes an array of Cloudinary image URLs in parallel.
 * Errors are logged but do not throw — a failed purge should never
 * prevent the main operation from succeeding.
 */
const purgeCloudinaryImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;

  const deletePromises = imageUrls.map(async (url) => {
    const publicId = extractPublicId(url);
    if (!publicId) return;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error(`[Cloudinary] Failed to delete image "${publicId}":`, err.message);
    }
  });

  await Promise.allSettled(deletePromises);
};

// ─────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────

/**
 * POST /components
 *
 * Creates a new component. The `createdBy` field is set from the
 * authenticated user's JWT payload (req.user.userId) — never from
 * the request body, which would allow privilege escalation.
 *
 * Image URLs are provided by uploadMiddleware via req.body.images.
 */
export const createComponent = async (req, res) => {
  try {
    const { name, brand, category } = req.body;

    if (!name || !brand || !category) {
      // Clean up any already-uploaded images before rejecting
      await purgeCloudinaryImages(req.body.images || []);
      return sendResponse(res, 400, false, 'Name, brand, and category are required.', null);
    }

    const component = await Component.create({
      ...req.body,
      createdBy: req.user.userId, // Always set from the verified JWT
    });

    return sendResponse(res, 201, true, 'Component created successfully.', component);
  } catch (error) {
    if (error.name === 'ValidationError') {
      await purgeCloudinaryImages(req.body.images || []);
      return sendResponse(res, 400, false, 'Validation failed.', error.message);
    }

    return sendResponse(res, 500, false, 'Failed to create component.', error.message);
  }
};

// ─────────────────────────────────────────────────────────────────────
// READ — LIST
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /components
 *
 * Returns a paginated, filtered, and sorted list of components.
 * All parameters are optional — defaults produce the 20 newest components.
 *
 * Query params:
 *   search       — regex match against name and brand
 *   category     — exact enum match
 *   brand        — case-insensitive regex match
 *   sort         — newest | oldest | priceLowToHigh | priceHighToLow | rating
 *   page         — 1-indexed page number (default: 1)
 *   limit        — items per page (default: 20)
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

// ─────────────────────────────────────────────────────────────────────
// READ — SINGLE
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /components/:id
 *
 * Retrieves a single component by its MongoDB ObjectId.
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

// ─────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────

/**
 * PUT /components/:id
 *
 * Updates a component. Image handling works as follows:
 *
 * 1. The client sends `existingImages[]` — the Cloudinary URLs it wants
 *    to KEEP from the current images array.
 * 2. uploadMiddleware may add new files to req.body.images.
 * 3. This controller:
 *    a. Diffs the old images vs the kept images to find deleted URLs.
 *    b. Purges deleted images from Cloudinary.
 *    c. Merges kept existing images with newly uploaded URLs.
 *    d. Saves the merged array.
 */
export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendResponse(res, 400, false, 'Invalid component ID.', null);
    }

    // Fetch the current document to get the current images list
    const existing = await Component.findById(id).select('images').lean();
    if (!existing) {
      await purgeCloudinaryImages(req.body.images || []);
      return sendResponse(res, 404, false, 'Component not found.', null);
    }

    // existingImages[] is a FormData field the client sends to indicate
    // which of the current images should be retained.
    const keptImageUrls = Array.isArray(req.body['existingImages[]'])
      ? req.body['existingImages[]']
      : req.body['existingImages[]']
        ? [req.body['existingImages[]']]
        : [];

    // Find images that were in the old array but are no longer kept
    const oldImages = existing.images || [];
    const removedImages = oldImages.filter((url) => !keptImageUrls.includes(url));

    // Purge removed images from Cloudinary (fire-and-forget style)
    await purgeCloudinaryImages(removedImages);

    // New uploads come from uploadMiddleware as req.body.images (array)
    const newlyUploadedImages = Array.isArray(req.body.images)
      ? req.body.images
      : req.body.images
        ? [req.body.images]
        : [];

    // Merge: kept existing + newly uploaded
    const mergedImages = [...keptImageUrls, ...newlyUploadedImages];

    // Build the update payload, overriding images with the merged array
    const updateData = {
      ...req.body,
      images: mergedImages,
      createdBy: existing.createdBy, // Never allow createdBy to be changed
    };

    // Remove the raw existingImages fields from the update payload
    delete updateData['existingImages[]'];

    const component = await Component.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return sendResponse(res, 200, true, 'Component updated successfully.', component);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendResponse(res, 400, false, 'Validation failed.', error.message);
    }

    return sendResponse(res, 500, false, 'Failed to update component.', error.message);
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────

/**
 * DELETE /components/:id
 *
 * Deletes a component and purges all its associated Cloudinary images.
 * Image cleanup is attempted even if the document delete succeeds —
 * orphaned images are logged but do not cause the response to fail.
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

    // Purge all images associated with this component from Cloudinary
    await purgeCloudinaryImages(component.images || []);

    return sendResponse(res, 200, true, 'Component deleted successfully.', null);
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to delete component.', error.message);
  }
};
