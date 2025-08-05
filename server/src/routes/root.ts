import express from 'express';
import { loadRoots } from '../repositories/neo4j/root.repository';

const router = express.Router();

router.get('/api/root', async (req, res) => {
  console.log('Request received: GET /api/root');

  const roots = await loadRoots();
  console.log(`GET /api/root successful, HTTP 200 OK: ${roots.length} items`);

  res.status(200).json(roots);
});

export default router;
