import { Person } from './Person';

export interface Lineage {
  id: string;

  name: string;
  createdAt: string; // ISO 8601

  founderId: string;
};
