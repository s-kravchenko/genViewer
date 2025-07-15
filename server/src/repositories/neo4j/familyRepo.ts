import { Family } from '@shared/models/Family';
import { session } from './neo4j';
import { linkPersonToFamily } from './relationshipRepo';

export async function loadFamily(id: string): Promise<Family | null> {
  const result = await session.run(
    `MATCH (f:Family {id: $id})
     OPTIONAL MATCH (h:Person)-[:HUSBAND_IN]->(f)
     OPTIONAL MATCH (w:Person)-[:WIFE_IN]->(f)
     OPTIONAL MATCH (c:Person)-[:CHILD_IN]->(f)
     RETURN f,
            h.id AS husbandId,
            w.id AS wifeId,
            collect(c.id) AS childrenIds`,
    { id },
  );

  if (result.records.length === 0) return null;

  const record = result.records[0];

  return {
    id: id,
    husbandId: record.get('husbandId') ?? null,
    wifeId: record.get('wifeId') ?? null,
    childrenIds: record.get('childrenIds') ?? [],
  };
}

export async function saveFamily(family: Family): Promise<boolean> {
  // Step 1: Create the Family node
  const familyResult = await session.run(
    `MERGE (f:Family {id: $id})
     RETURN f`,
    family,
  );

  if (familyResult.records.length === 0) {
    console.error(`Failed to create Family node ${family.id}`);
    return false;
  }

  // Step 2: Connect spouses to Family
  if (family.husbandId) {
    const result = await linkPersonToFamily(
      family.husbandId,
      family.id,
      'HUSBAND_IN',
    );
    if (!result) return false;
  }

  if (family.wifeId) {
    const result = await linkPersonToFamily(
      family.wifeId,
      family.id,
      'WIFE_IN',
    );
    if (!result) return false;
  }

  // Step 3: Connect children to Family
  for (const childId of family.childrenIds ?? []) {
    const result = await linkPersonToFamily(childId, family.id, 'CHILD_IN');
    if (!result) return false;
  }

  return true;
}
