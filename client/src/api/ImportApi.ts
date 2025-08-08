import { FileImport, FileImportDetails } from '@shared/models';

export async function fetchFileImports(): Promise<FileImport[]> {
  console.log('Fetching file imports');

  const response = await fetch(`/api/import`);
  if (!response.ok) throw new Error('Failed to fetch file imports');

  console.log('File imports fetched');
  return response.json();
}

export async function fetchFileImportDetails(id: string): Promise<FileImportDetails> {
  console.log(`Fetching file import ${id}`);

  const response = await fetch(`/api/import/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch file import ${id}`);

  console.log(`File import ${id} fetched`);
  return response.json();
}

export async function importGedcom(file: string | Blob): Promise<FileImport> {
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
