import { DataImport, Person, Family } from '../models';

export interface DataImportResponse {
  dataImport: DataImport;
  people: Person[];
  families: Family[];
}
