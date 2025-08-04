import express from 'express';
import importRoutes from './routes/import';
import rootRoute from './routes/root';
import lineageRoute from './routes/lineage';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use(importRoutes);
app.use(rootRoute);
app.use(lineageRoute);

app.listen(5001, () => { console.log('Server started on port 5001') });
