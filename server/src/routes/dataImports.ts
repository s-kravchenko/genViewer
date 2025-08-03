import express from 'express';
import { Neo4jRepo } from '../repositories/Neo4jRepo';

const router = express.Router();

router.get('/api/data-imports', async (req, res) => {
  console.log('Request received: GET /api/data-imports');

  const repo = new Neo4jRepo();
  const dataImports = await repo.loadDataImports();
  console.log(`GET /api/data-imports successful, HTTP 200 OK: ${dataImports.length} items`);

  res.status(200).json(dataImports);
});

export default router;
