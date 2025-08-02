import express from 'express';
import importGedcomRoute from './routes/import/gedcom';
import dataImportsRoute from './routes/dataImports';
import dataImportRoute from './routes/dataImport';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use(importGedcomRoute);
app.use(dataImportsRoute);
app.use(dataImportRoute);

app.listen(5001, () => { console.log('Server started on port 5001') });
