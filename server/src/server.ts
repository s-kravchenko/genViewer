import express from 'express';
import usersRoute from './routes/users';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use(usersRoute);

app.listen(5001, () => { console.log('Server started on port 5001') });
