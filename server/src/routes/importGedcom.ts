import express from 'express';
import { Tree } from '@shared/models/Tree';
import { upload } from '../middleware/multer';
import { GedcomImporter } from '../importers/gedcom';

const router = express.Router();

router.post('/api/import/gedcom', upload.single('gedcom'), async (req, res) => {
  if (!req.file?.path) {
    res.status(400).send({ error: 'No file uploaded' });
    return;
  }

  try {
    const gedcomImporter = new GedcomImporter();
    const tree: Tree = await gedcomImporter.import(req.file.path, req.file.originalname);

    res.status(201).send({
      treeId: tree.id,
      filename: req.file.originalname,
      path: req.file.path,
    });
  } catch (err) {
    console.error('GEDCOM import failed:', err);
    res.status(500).send({ error: 'Upload failed' });
  }
});

export default router;
