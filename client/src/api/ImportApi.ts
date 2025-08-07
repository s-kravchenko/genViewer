import { DataImport, DataImportDetails } from '@shared/models';

export async function fetchDataImports(): Promise<DataImport[]> {
  console.log('Fetching data imports');

  const response = await fetch(`/api/import`);
  if (!response.ok) throw new Error('Failed to fetch data imports');

  console.log('Data imports fetched');
  return response.json();
}

export async function fetchDataImportDetails(id: string): Promise<DataImportDetails> {
  console.log(`Fetching data import ${id}`);

  const response = await fetch(`/api/import/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch data import ${id}`);

  console.log(`Data import ${id} fetched`);
  return response.json();
}

export async function importGedcom(file: string | Blob): Promise<DataImport> {
  console.log('Importing GEDCOM data');

  const formData = new FormData();
  formData.append('gedcom', file);

  const response = await fetch('/api/import/gedcom', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to import GEDCOM data');

  console.log('GEDCOM data imported');
  return response.json();
}
