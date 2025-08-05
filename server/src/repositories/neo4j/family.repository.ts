import { neo4j } from './neo4j.connector';
import { Family } from '@shared/models';
import { linkPersonToFamily } from './relationship.repository';

export async function saveFamily(family: Family): Promise<boolean> {
  console.log(`Saving family ${family.id}`);

  const session = neo4j.session();

  // Step 1: Save the Family node
  try {
    const familyResult = await session.run(
      `MERGE (f:Family {id: $id})
        SET f.metadata = apoc.convert.toJson($metadata)
        RETURN f`,
      family,
    );

    if (familyResult.records.length === 0) {
      console.error(`Failed to save family ${family.id}`);
      return false;
    }

    console.log(`Family ${family.id} saved`);
  } catch (err) {
    console.error(`Failed to save family ${family.id}:`, err);
    return false;
  } finally {
    await session.close();
  }

  // Step 2: Connect spouses to Family
  if (family.husbandId) {
    const result = await linkPersonToFamily(family.husbandId, family.id, 'HUSBAND_IN');
    if (!result) return false;
  }

  if (family.wifeId) {
    const result = await linkPersonToFamily(family.wifeId, family.id, 'WIFE_IN');
    if (!result) return false;
  }

  // Step 3: Connect children to Family
  for (const childId of family.childIds ?? []) {
    const result = await linkPersonToFamily(childId, family.id, 'CHILD_IN');
    if (!result) return false;
  }

  return true;
}
