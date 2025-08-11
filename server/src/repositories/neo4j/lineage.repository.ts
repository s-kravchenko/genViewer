import { v4 as uuidv4 } from 'uuid';
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

export async function saveLineage(payload: Omit<Lineage, 'id' | 'createdAt'>): Promise<Lineage | null> {
  console.log(`Saving lineage '${payload.name}'`);

  const session = neo4j.session();

  // Step 1: Save the Lineage node
  try {
    const result = await session.run(
      `
      MATCH (founder: Person {id: $founderId})

      CREATE (lineage:Lineage {
        id: $id,
        name: $name,
        createdAt: $createdAt
      })

      CREATE (founder)-[:FOUNDED]->(lineage)

      RETURN
        lineage.id AS id,
        lineage.name AS name,
        founder.id AS founderId,
        lineage.createdAt AS createdAt
      `,
      {
        id: uuidv4(),
        name: payload.name,
        founderId: payload.founderId,
        createdAt: new Date().toISOString(),
      },
    );

    if (result.records.length === 0) {
      console.error(`Failed to save lineage '${payload.name}'`);
      return null;
    }

    const rec = result.records[0];
    const lineage: Lineage = {
      id: rec.get('id'),
      name: rec.get('name'),
      founderId: rec.get('founderId'),
      createdAt: rec.get('createdAt'),
    }

    return lineage;
  } catch (err) {
    console.error(`Failed to save lineage '${payload.name}':`, err);
    return null;
  } finally {
    await session.close();
  }
}
