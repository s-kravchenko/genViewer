import { Lineage, PersonDetails } from '@shared/models';

export async function createLineage(lineage: Omit<Lineage, 'id' | 'createdAt'>): Promise<Lineage> {
  console.log(`Creating lineage '${lineage.name}'`);

  const response = await fetch('/api/lineage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lineage),
  });

  if (!response.ok) throw new Error('Failed to create lineage');

  console.log('Lineage created');
  return response.json();
}

export async function fetchRoots(): Promise<PersonDetails[]> {
  console.log('Fetching roots');

  const response = await fetch(`/api/root`);
  if (!response.ok) throw new Error('Failed to fetch roots');

  const roots = await response.json();
  console.log(`Roots fetched: ${roots.length} items`);
  return roots;
}

export async function fetchLineages(): Promise<Lineage[]> {
  console.log('Fetching lineages');

    const response = await fetch(`/api/lineage`);
    if (!response.ok) throw new Error('Failed to fetch lineages');

    const lineages = await response.json();
    console.log(`Lineages fetched: ${lineages.length} items`);
    return lineages;
}

export async function fetchLineage(id: string): Promise<Lineage> {
  console.log(`Fetching lineage ${id}`);

  const response = await fetch(`/api/lineage/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch lineage ${id}`);

  console.log(`Lineage ${id} fetched`);
  return response.json();
}
