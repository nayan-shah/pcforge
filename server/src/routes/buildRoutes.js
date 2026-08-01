import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createBuild,
  getAllBuilds,
  getBuildById,
  deleteBuild,
} from '../controllers/buildController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createBuild);
router.get('/', getAllBuilds);
router.get('/:id', getBuildById);
router.delete('/:id', deleteBuild);

export default router;
