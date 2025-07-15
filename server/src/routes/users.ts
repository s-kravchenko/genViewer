import express from 'express';
import { User } from '@shared/types/user';

const router = express.Router();

const users: User[] = [
  { name: 'John', age: 30 },
  { name: 'Mary', age: 28 },
];

router.get('/api/users', (req, res) => {
  res.json(users);
});

export default router;
