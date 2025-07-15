import { Family } from './Family';
import { Person } from './Person';

export type Tree = {
  id: string;
  people: Person[];
  families: Family[];
  fileName: string;
  createdAt: string;
};
