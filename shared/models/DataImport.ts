export interface DataImport {
  id: string;

  originalFileName: string;
  filePath: string;
  createdAt: string;

  personIds: string[];
  familyIds: string[];
};
