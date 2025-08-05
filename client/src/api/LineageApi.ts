import { Lineage } from '@shared/models';
import { RootResponse } from '@shared/contracts';

export async function fetchRoots(): Promise<RootResponse[] | null> {
  console.log('Fetching roots');

  try {
    const response = await fetch(`/api/root`);
    if (!response.ok) {
      console.error('Failed to fetch roots');
      return null;
    }

    console.log('Roots fetched');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch roots:', error);
    return null;
  }
}

export async function fetchLineages(): Promise<Lineage[] | null> {
  console.log('Fetching lineages');

  try {
    const response = await fetch(`/api/lineage`);
    if (!response.ok) {
      console.error('Failed to fetch lineages');
      return null;
    }

    console.log('Lineages fetched');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch lineages:', error);
    return null;
  }
}

export async function fetchLineage(id: string): Promise<Lineage | null> {
  console.log(`Fetching lineage ${id}`);

  try {
    const response = await fetch(`/api/lineage/${id}`);
    if (!response.ok) {
      console.error(`Failed to fetch lineage ${id}`);
      return null;
    }

    console.log(`Lineage ${id} fetched`);
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch lineage ${id}:`, error);
    return null;
  }
}
