import express from 'express';

const app = express();

const users = [
  { name: 'John', age: 30 },
  { name: 'Mary', age: 28 },
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.listen(5001, () => { console.log('Server started on port 5001') });
