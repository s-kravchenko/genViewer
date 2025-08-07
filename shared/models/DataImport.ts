import { Person } from './Person';
import { Family } from './Family';
export interface DataImport {
  id: string;

  originalFileName: string;
  filePath: string;
  createdAt: string;

  personIds: string[];
  familyIds: string[];
}

export interface DataImportDetails extends DataImport {
  people: Person[];
  families: Family[];
}
