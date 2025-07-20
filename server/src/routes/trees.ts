import express from 'express';
import { TreeRepo } from '../repositories/TreeRepo';

const router = express.Router();

router.get('/api/trees', async (req, res) => {
  console.log('GET /api/trees');
  const treeRepo = new TreeRepo();
  const trees = await treeRepo.loadTrees();
  res.json(trees);
});

export default router;
