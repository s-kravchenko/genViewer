import { Person } from '../models/Person';

export interface RootResponse {
  root: Person;
  descendantCount: number;
};
