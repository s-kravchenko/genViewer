import express from 'express';
import { loadTrees } from '../repositories/neo4j/treeRepo';

const router = express.Router();

router.get('/api/trees', async (req, res) => {
  console.log('GET /api/trees');
  const trees = await loadTrees();
  res.json(trees);
});

export default router;
