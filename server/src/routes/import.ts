import express from 'express';
import { DataImport } from '@shared/models/DataImport';
import { Neo4jRepo } from '../repositories/Neo4jRepo';
import { upload } from '../middleware/multer';
import { GedcomImporter } from '../importers/gedcom';

const router = express.Router();

router.post('/api/import/gedcom', upload.single('gedcom'), async (req, res) => {
  console.log(`Request received: POST /api/import/gedcom { file=${req.file} }`);

  if (!req.file?.path) {
    res.status(400).send({ error: 'No file uploaded' });
    return;
  }

  try {
    const gedcomImporter = new GedcomImporter();
    const dataImport: DataImport = await gedcomImporter.import(
      req.file.originalname,
      req.file.path,
    );

    console.log(`POST /api/import/gedcom successful, HTTP 201 OK:`, dataImport);

    res.status(201).send(dataImport);
  } catch (err) {
    console.error('GEDCOM import failed:', err);
    res.status(500).send({ error: 'Upload failed' });
  }
});

router.get('/api/import', async (req, res) => {
  console.log('Request received: GET /api/import');

  const repo = new Neo4jRepo();
  const dataImports = await repo.loadDataImports();
  console.log(`GET /api/import successful, HTTP 200 OK: ${dataImports.length} items`);

  res.status(200).json(dataImports);
});

router.get('/api/import/:id', async (req, res) => {
  console.log(`Request received: GET /api/import/:id=${req.params.id}`);

  const id = req.params.id;
  const repo = new Neo4jRepo();
  const dataImport = await repo.loadDataImport(id);
  console.log(`GET /api/import/:id=${req.params.id} successful, HTTP 200 OK`);

  res.status(200).json(dataImport);
});

export default router;
