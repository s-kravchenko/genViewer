import express from 'express';
import { Neo4jRepo } from '../repositories/Neo4jRepo';

const router = express.Router();

router.get('/api/lineage', async (req, res) => {
  console.log('Request received: GET /api/lineage');

  const repo = new Neo4jRepo();
  const lineages = await repo.loadLineages();
  console.log(`GET /api/lineage successful, HTTP 200 OK: ${lineages.length} items`);

  res.status(200).json(lineages);
});

export default router;
