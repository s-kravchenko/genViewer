import express from 'express';
import importGedcomRoute from './routes/import/gedcom';
import dataImportsRoute from './routes/dataImports';
import dataImportRoute from './routes/dataImport';
import rootsRoute from './routes/roots';
import lineageRoute from './routes/lineage';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use(importGedcomRoute);
app.use(dataImportsRoute);
app.use(dataImportRoute);
app.use(rootsRoute);
app.use(lineageRoute);

app.listen(5001, () => { console.log('Server started on port 5001') });
