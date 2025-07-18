import express from 'express';
import { loadTree } from '../repositories/neo4j/treeRepo';

const router = express.Router();

router.get('/api/tree/:treeId', async (req, res) => {
  const treeId = req.params.treeId;
  const tree = await loadTree(treeId);
  res.json(tree);
});

export default router;
