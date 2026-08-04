import { ApiError } from '../utils/apiError.js';
import { searchRetailers } from '../services/searchOrchestratorService.js';

export const searchProducts = async (req, res, next) => {
  try {
    const query = String(req.query.query ?? '').trim();
    if (!query) throw new ApiError(400, 'query is required.');
    return res.status(200).json(await searchRetailers(query));
  } catch (error) {
    return next(error);
  }
};
