import express from 'express';

export type User = {
  name: String;
  age: number;
};

const app = express();

const users: User[] = [
  { name: 'John', age: 30 },
  { name: 'Mary', age: 28 },
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.listen(5001, () => { console.log('Server started on port 5001') });
