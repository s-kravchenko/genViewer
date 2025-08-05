import { neo4j } from './neo4j.connector';
import { Lineage } from '@shared/models';
import { linkPersonToLineage } from './relationship.repository';

export async function loadLineages(): Promise<Lineage[]> {
  console.log('Loading lineages');

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (l:Lineage)
        OPTIONAL MATCH (p:Person)-[:FOUNDED]->(l)
        RETURN l, p
        ORDER BY l.name`,
    );

    const lineages: Lineage[] = result.records.map((r) => ({
      id: r.get('l').properties.id,
      name: r.get('l').properties.name,
      founderId: r.get('p')?.properties.id,
      createdAt: r.get('l').properties.createdAt,
    }));

    console.log('Loaded lineages:', lineages.length);
    return lineages;
  } catch (err) {
    console.error('Failed to load lineages:', err);
    return [];
  } finally {
    await session.close();
  }
}

export async function saveLineage(lineage: Lineage): Promise<boolean> {
  console.log(`Saving lineage ${lineage.id}`);

  const session = neo4j.session();

  // Step 1: Save the Lineage node
  try {
    const result = await session.run(
      `MERGE (l:Lineage {id: $id})
        SET l.name = $name,
            l.createdAt = $createdAt
        RETURN l`,
      lineage,
    );

    if (result.records.length === 0) {
      console.error(`Failed to save lineage ${lineage.id}`);
      return false;
    }
  } catch (err) {
    console.error(`Failed to save lineage ${lineage.id}:`, err);
    return false;
  } finally {
    await session.close();
  }

  // Step 2: Connect root person to Lineage
  const result = await linkPersonToLineage(lineage.founderId, lineage.id);
  if (!result) return false;

  return true;
}
