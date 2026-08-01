import mongoose from 'mongoose';
import Build from '../models/Build.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

const buildSelect = '_id user name components totalPrice totalPower createdAt updatedAt';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createBuild = async (req, res, next) => {
  try {
    const { name, components = [], totalPrice = 0, totalPower = 0 } = req.body;

    if (!name?.trim()) {
      return next(new ApiError(400, 'Build name is required.'));
    }

    if (!Array.isArray(components)) {
      return next(new ApiError(400, 'Components must be provided as an array.'));
    }

    const build = await Build.create({
      user: req.user.userId,
      name: name.trim(),
      components,
      totalPrice,
      totalPower,
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { savedBuilds: build._id },
    });

    const populatedBuild = await Build.findById(build._id).select(buildSelect).populate('user', 'name email');
    sendSuccess(res, 201, 'Build created successfully.', populatedBuild);
  } catch (error) {
    next(error);
  }
};

export const getAllBuilds = async (req, res, next) => {
  try {
    const builds = await Build.find({ user: req.user.userId }).select(buildSelect).sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Builds fetched successfully.', builds);
  } catch (error) {
    next(error);
  }
};

export const getBuildById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, 'Invalid build id.'));
    }

    const build = await Build.findById(id).select(buildSelect).populate('user', 'name email');

    if (!build) {
      return next(new ApiError(404, 'Build not found.'));
    }

    if (build.user._id.toString() !== req.user.userId) {
      return next(new ApiError(403, 'You are not allowed to access this build.'));
    }

    sendSuccess(res, 200, 'Build fetched successfully.', build);
  } catch (error) {
    next(error);
  }
};

export const deleteBuild = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, 'Invalid build id.'));
    }

    const build = await Build.findById(id);

    if (!build) {
      return next(new ApiError(404, 'Build not found.'));
    }

    if (build.user.toString() !== req.user.userId) {
      return next(new ApiError(403, 'You are not allowed to delete this build.'));
    }

    await build.deleteOne();
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { savedBuilds: build._id },
    });

    sendSuccess(res, 200, 'Build deleted successfully.', null);
  } catch (error) {
    next(error);
  }
};
