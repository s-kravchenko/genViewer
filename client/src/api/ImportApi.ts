import { DataImport } from '@shared/models';
import { DataImportResponse } from '@shared/contracts';

export class ImportApi {
  public static async fetchDataImports(): Promise<DataImport[] | null> {
    console.log('Fetching data imports');

    try {
      const response = await fetch(`/api/import`);
      if (!response.ok) {
        console.error('Failed to fetch data imports');
        return null;
      }

      console.log('Data imports fetched');
      return response.json();
    } catch (error) {
      console.error('Failed to fetch data imports:', error);
      return null;
    }
  }

  public static async fetchDataImport(id: string): Promise<DataImportResponse | null> {
    console.log(`Fetching data import ${id}`);

    try {
      const response = await fetch(`/api/import/${id}`);
      if (!response.ok) {
        console.error(`Failed to fetch data import ${id}`);
        return null;
      }

      console.log(`Data import ${id} fetched`);
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch data import ${id}:`, error);
      return null;
    }
  }

  public static async importGedcom(file: string | Blob): Promise<DataImport | null> {
    console.log('Importing GEDCOM data');

    const formData = new FormData();
    formData.append('gedcom', file);

    try {
      const response = await fetch('/api/import/gedcom', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Failed to import GEDCOM data');
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Failed to import GEDCOM data:', error);
      return null;
    }
  }
}
