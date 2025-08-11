import express from 'express';
import { loadLineages, saveLineage } from '../repositories/neo4j/lineage.repository';
import { Lineage } from '@shared/models';

const router = express.Router();

router.post('/api/lineage', async (req, res) => {
  console.log('Request received: POST /api/lineage: ', req.body);

  if (!req.body) {
    res.status(400).send({ error: 'No lineage data provided' });
    return;
  }

  try {
    const lineage = await saveLineage(req.body);

    console.log(`POST /api/lineage successful, HTTP 201 OK:`, lineage);

    res.status(201).send(lineage);
  } catch (err) {
    console.error('Failed to create lineage:', err);
    res.status(500).send({ error: 'Lineage creation failed' });
  }
});

router.get('/api/lineage', async (req, res) => {
  console.log('Request received: GET /api/lineage');

  const lineages = await loadLineages();
  console.log(`GET /api/lineage successful, HTTP 200 OK: ${lineages.length} items`);

  res.status(200).json(lineages);
});

export default router;
