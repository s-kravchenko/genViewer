import express from 'express';
import importGedcomRoute from './routes/importGedcom';
import treesRoute from './routes/trees';
import treeRoute from './routes/tree';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use(importGedcomRoute);
app.use(treesRoute);
app.use(treeRoute);

app.listen(5001, () => { console.log('Server started on port 5001') });
