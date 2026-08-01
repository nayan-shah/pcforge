import mongoose from 'mongoose';
import Component from '../models/Component.js';
import { deleteCloudinaryImages, getUploadedImageUrls } from '../middleware/uploadMiddleware.js';
import { ApiError, notFound } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

const MAX_LIMIT = 100;
const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  priceLowToHigh: { 'prices.currentPrice': 1, _id: 1 },
  priceHighToLow: { 'prices.currentPrice': -1, _id: 1 },
  rating: { rating: -1, reviewCount: -1, _id: -1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const parsePositiveInteger = (value, defaultValue, maximum) => {
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || (maximum && parsed > maximum)) {
    throw new ApiError(400, `Provide a whole number between 1 and ${maximum || 'the allowed maximum'}.`);
  }
  return parsed;
};

const buildComponentPayload = (body, images) => {
  const fields = ['name', 'brand', 'category', 'description', 'stockStatus', 'tags', 'specifications', 'compatibility', 'prices', 'rating', 'reviewCount'];
  return Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]).concat([['images', images]]));
};

export const createComponent = async (req, res, next) => {
  const uploadedImages = getUploadedImageUrls(req);
  try {
    const component = await Component.create({
      ...buildComponentPayload(req.body, uploadedImages),
      createdBy: req.user.userId,
    });
    return sendSuccess(res, 201, 'Component created successfully.', component);
  } catch (error) {
    await deleteCloudinaryImages(uploadedImages);
    return next(error);
  }
};

export const getAllComponents = async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 20, MAX_LIMIT);
    const { search = '', category, brand, minPrice, maxPrice, sort = 'newest' } = req.query;
    if (!SORTS[sort]) throw new ApiError(400, 'Choose a valid sort option.');

    const filter = {};
    if (search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: pattern }, { brand: pattern }, { tags: pattern }];
    }
    if (category) filter.category = category;
    if (brand?.trim()) filter.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, 'i');
    if (minPrice !== undefined || maxPrice !== undefined) {
      const price = {};
      if (minPrice !== undefined && (!Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)) throw new ApiError(400, 'minPrice must be a non-negative number.');
      if (maxPrice !== undefined && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0)) throw new ApiError(400, 'maxPrice must be a non-negative number.');
      if (Number(minPrice) > Number(maxPrice) && minPrice !== undefined && maxPrice !== undefined) throw new ApiError(400, 'minPrice cannot exceed maxPrice.');
      if (minPrice !== undefined) price.$gte = Number(minPrice);
      if (maxPrice !== undefined) price.$lte = Number(maxPrice);
      filter['prices.currentPrice'] = price;
    }

    const totalCount = await Component.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const components = page > Math.max(totalPages, 1)
      ? []
      : await Component.find(filter).sort(SORTS[sort]).skip((page - 1) * limit).limit(limit).lean();

    return sendSuccess(res, 200, 'Components fetched successfully.', {
      components,
      totalCount,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    return next(error);
  }
};

export const getComponentById = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid component ID.');
    const component = await Component.findById(req.params.id).lean();
    if (!component) throw notFound('Component not found.');
    return sendSuccess(res, 200, 'Component fetched successfully.', component);
  } catch (error) {
    return next(error);
  }
};

export const updateComponent = async (req, res, next) => {
  const uploadedImages = getUploadedImageUrls(req);
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid component ID.');
    const existing = await Component.findById(req.params.id).select('images').lean();
    if (!existing) throw notFound('Component not found.');

    const requestedKeptImages = req.body['existingImages[]'];
    const keptImages = (Array.isArray(requestedKeptImages) ? requestedKeptImages : [requestedKeptImages])
      .filter((url) => typeof url === 'string' && existing.images.includes(url));
    const images = [...new Set([...keptImages, ...uploadedImages])];
    const component = await Component.findByIdAndUpdate(
      req.params.id,
      buildComponentPayload(req.body, images),
      { new: true, runValidators: true },
    );
    await deleteCloudinaryImages(existing.images.filter((url) => !keptImages.includes(url)));
    return sendSuccess(res, 200, 'Component updated successfully.', component);
  } catch (error) {
    await deleteCloudinaryImages(uploadedImages);
    return next(error);
  }
};

export const deleteComponent = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid component ID.');
    const component = await Component.findByIdAndDelete(req.params.id).lean();
    if (!component) throw notFound('Component not found.');
    await deleteCloudinaryImages(component.images);
    return sendSuccess(res, 200, 'Component deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
