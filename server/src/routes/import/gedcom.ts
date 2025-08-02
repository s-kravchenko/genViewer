import express from 'express';
import { DataImport } from '@shared/models/DataImport';
import { upload } from '../../middleware/multer';
import { GedcomImporter } from '../../importers/gedcom';

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

    const { id, originalFileName, filePath, createdAt } = dataImport;
    const response = {
      id,
      originalFileName,
      filePath,
      createdAt,
    };
    console.log(`POST /api/import/gedcom successful, HTTP 201 OK:`, response);

    res.status(201).send(response);
  } catch (err) {
    console.error('GEDCOM import failed:', err);
    res.status(500).send({ error: 'Upload failed' });
  }
});

export default router;
