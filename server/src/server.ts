import express from 'express';
import importGedcomRoute from './routes/importGedcom';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use(importGedcomRoute);

app.listen(5001, () => { console.log('Server started on port 5001') });
