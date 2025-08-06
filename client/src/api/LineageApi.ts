import { Lineage } from '@shared/models';
import { RootResponse } from '@shared/contracts';

export async function fetchRoots(): Promise<RootResponse[]> {
  console.log('Fetching roots');

  const response = await fetch(`/api/root`);
  if (!response.ok) throw new Error('Failed to fetch roots');

  console.log('Roots fetched');
  return response.json();
}

export async function fetchLineages(): Promise<Lineage[]> {
  console.log('Fetching lineages');

    const response = await fetch(`/api/lineage`);
    if (!response.ok) throw new Error('Failed to fetch lineages');

    console.log('Lineages fetched');
    return response.json();
}

export async function fetchLineage(id: string): Promise<Lineage> {
  console.log(`Fetching lineage ${id}`);

  const response = await fetch(`/api/lineage/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch lineage ${id}`);

  console.log(`Lineage ${id} fetched`);
  return response.json();
}
