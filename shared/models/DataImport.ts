import { Family } from './Family';
import { Person } from './Person';

export type DataImport = {
  id: string;
  people: Person[];
  families: Family[];
  originalFileName: string;
  filePath: string;
  createdAt: string;
};
