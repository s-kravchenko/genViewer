import express from 'express';
import { TreeRepo } from '../repositories/TreeRepo';

const router = express.Router();

router.get('/api/tree/:treeId', async (req, res) => {
  console.log(`Request received: GET /api/tree/:treeId=${req.params.treeId}`);

  const treeId = req.params.treeId;
  const treeRepo = new TreeRepo();
  const tree = await treeRepo.loadTree(treeId);
  console.log(`GET /api/tree/:treeId=${req.params.treeId} successful, HTTP 200 OK`);
  
  res.status(200).json(tree);
});

export default router;
