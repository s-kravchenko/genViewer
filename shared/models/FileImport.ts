import { Person } from './Person';
import { Family } from './Family';
export interface FileImport {
  id: string;

  originalFileName: string;
  filePath: string;
  createdAt: string;

  personIds: string[];
  familyIds: string[];
}

export interface FileImportDetails extends FileImport {
  people: Person[];
  families: Family[];
}
