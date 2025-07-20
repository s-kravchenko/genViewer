import express from 'express';
import { TreeRepo } from '../repositories/TreeRepo';

const router = express.Router();

router.get('/api/trees', async (req, res) => {
  console.log('Request received: GET /api/trees');

  const treeRepo = new TreeRepo();
  const trees = await treeRepo.loadTrees();
  console.log(`GET /api/trees successful, HTTP 200 OK: ${trees.length} items`);
  
  res.status(200).json(trees);
});

export default router;
