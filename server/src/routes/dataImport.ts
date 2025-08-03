import express from 'express';
import { Neo4jRepo } from '../repositories/Neo4jRepo';

const router = express.Router();

router.get('/api/data-import/:id', async (req, res) => {
  console.log(`Request received: GET /api/data-import/:id=${req.params.id}`);

  const id = req.params.id;
  const repo = new Neo4jRepo();
  const dataImport = await repo.loadDataImport(id);
  console.log(`GET /api/data-import/:id=${req.params.id} successful, HTTP 200 OK`);

  res.status(200).json(dataImport);
});

export default router;
