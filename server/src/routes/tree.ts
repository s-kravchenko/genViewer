import express from 'express';
import { TreeRepo } from '../repositories/TreeRepo';

const router = express.Router();

router.get('/api/tree/:treeId', async (req, res) => {
  const treeId = req.params.treeId;
  const treeRepo = new TreeRepo();
  const tree = await treeRepo.loadTree(treeId);
  res.json(tree);
});

export default router;
