import express from 'express';
import { DataImportRepo } from '../repositories/DataImportRepo';

const router = express.Router();

router.get('/api/data-imports', async (req, res) => {
  console.log('Request received: GET /api/data-imports');

  const repo = new DataImportRepo();
  const dataImports = await repo.loadDataImports();
  console.log(`GET /api/data-imports successful, HTTP 200 OK: ${dataImports.length} items`);

  res.status(200).json(dataImports);
});

export default router;
