import express from 'express';
import { loadLineages } from '../repositories/neo4j/lineage.repository';

const router = express.Router();

router.get('/api/lineage', async (req, res) => {
  console.log('Request received: GET /api/lineage');

  const lineages = await loadLineages();
  console.log(`GET /api/lineage successful, HTTP 200 OK: ${lineages.length} items`);

  res.status(200).json(lineages);
});

export default router;
