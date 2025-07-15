import express from 'express';
import { upload } from '../middleware/multer';

const router = express.Router();

router.post('/api/import/gedcom', upload.single('gedcom'), async (req, res) => {
  if (!req.file?.path) {
    res.status(400).send({ error: 'No file uploaded' });
    return;
  }

  res.send({
    status: 'ok',
    filename: req.file.originalname,
    path: req.file.path,
  });
});

export default router;
