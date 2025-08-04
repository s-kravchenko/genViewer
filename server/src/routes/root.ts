import express from 'express';
import { Neo4jRepo } from '../repositories/Neo4jRepo';

const router = express.Router();

router.get('/api/root', async (req, res) => {
  console.log('Request received: GET /api/root');

  const repo = new Neo4jRepo();
  const roots = await repo.loadRoots();
  console.log(`GET /api/root successful, HTTP 200 OK: ${roots.length} items`);

  res.status(200).json(roots);
});

export default router;
