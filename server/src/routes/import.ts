import express from 'express';
import { FileImport } from '@shared/models/FileImport';
import { upload } from '../middleware/multer';
import { GedcomImporter } from '../importers/gedcom';
import {
  loadFileImports,
  loadFileImportDetails,
} from '../repositories/neo4j/fileImport.repository';

const router = express.Router();

router.post('/api/import/gedcom', upload.single('gedcom'), async (req, res) => {
  console.log(`Request received: POST /api/import/gedcom { file=${req.file} }`);

  if (!req.file?.path) {
    res.status(400).send({ error: 'No file uploaded' });
    return;
  }

  try {
    const gedcomImporter = new GedcomImporter();
    const fileImport: FileImport = await gedcomImporter.import(
      req.file.originalname,
      req.file.path,
    );

    console.log(`POST /api/import/gedcom successful, HTTP 201 OK:`, fileImport);

    res.status(201).send(fileImport);
  } catch (err) {
    console.error('GEDCOM import failed:', err);
    res.status(500).send({ error: 'Upload failed' });
  }
});

router.get('/api/import', async (req, res) => {
  console.log('Request received: GET /api/import');

  const fileImports = await loadFileImports();
  console.log(`GET /api/import successful, HTTP 200 OK: ${fileImports.length} items`);

  res.status(200).json(fileImports);
});

router.get('/api/import/:id', async (req, res) => {
  console.log(`Request received: GET /api/import/:id=${req.params.id}`);

  const id = req.params.id;
  const fileImport = await loadFileImportDetails(id);
  console.log(`GET /api/import/:id=${req.params.id} successful, HTTP 200 OK`);

  res.status(200).json(fileImport);
});

export default router;
