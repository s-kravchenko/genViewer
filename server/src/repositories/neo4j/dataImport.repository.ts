import { neo4j } from './neo4j.connector';
import { Person, Family, DataImport, DataImportDetails } from '@shared/models';
import { savePerson } from './person.repository';
import { saveFamily } from './family.repository';
import { linkNodeToDataImport } from './relationship.repository';

export async function loadDataImports(): Promise<DataImport[]> {
  console.log('Loading data imports');

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (i:DataImport)
        RETURN i`,
    );

    const dataImports: DataImport[] = result.records.map((r) => r.get('i').properties);

    console.log('Loaded data imports:', dataImports.length);
    return dataImports;
  } catch (err) {
    console.error('Failed to load data imports:', err);
    return [];
  } finally {
    await session.close();
  }
}

export async function loadDataImportDetails(id: string): Promise<DataImportDetails | null> {
  console.log('Loading data import details:', id);

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (i:DataImport {id: $id})
        OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(i)
        OPTIONAL MATCH (f:Family)-[:MEMBER_OF]->(i)
        OPTIONAL MATCH (f)<-[:HUSBAND_IN]-(h:Person)
        OPTIONAL MATCH (f)<-[:WIFE_IN]-(w:Person)
        OPTIONAL MATCH (f)<-[:CHILD_IN]-(c:Person)
        WITH i, collect(DISTINCT p) AS people, f, h, w, collect(DISTINCT c.id) AS childIds
        RETURN i,
              people,
              collect(DISTINCT {
                family: f,
                husbandId: h.id,
                wifeId: w.id,
                childIds: childIds
              }) AS families`,
      { id },
    );

    if (result.records.length === 0) {
      console.error(`Failed to load data import details ${id}`);
      return null;
    }

    const record = result.records[0];

    const dataImport = record.get('i').properties;

    const people: Person[] = record.get('people').map((node: any) => node.properties);
    console.log(`Loaded ${people.length} people`);

    const families: Family[] = record.get('families').map((node: any) => ({
      id: node.family.properties.id,
      husbandId: node.husbandId ?? null,
      wifeId: node.wifeId ?? null,
      childIds: node.childIds ?? [],
    }));
    console.log(`Loaded ${families.length} families`);

    return {
      ...dataImport,
      people,
      families,
    };
  } catch (err) {
    console.error(`Failed to load data import details ${id}:`, err);
    return null;
  } finally {
    await session.close();
  }
}

export async function saveDataImportDetails(
  people: Person[],
  families: Family[],
  dataImport: DataImport,
): Promise<boolean> {
  console.log(`Saving data import ${dataImport.id}`);

  const session = neo4j.session();

  // Step 1: Save the DataImport node
  try {
    const result = await session.run(
      `MERGE (i:DataImport {id: $id})
        SET i.originalFileName = $originalFileName,
            i.filePath = $filePath,
            i.createdAt = $createdAt
        RETURN i`,
      dataImport,
    );

    if (result.records.length === 0) {
      console.error(`Failed to save data import ${dataImport.id}`);
      return false;
    }
  } catch (err) {
    console.error(`Failed to save data import ${dataImport.id}:`, err);
    return false;
  } finally {
    await session.close();
  }

  // Step 2: Save Person nodes
  for (const personId of dataImport.personIds) {
    const person = people.find((p) => p.id === personId);
    if (!person) return false;

    const personResult = await savePerson(person);
    if (!personResult) return false;

    const linkResult = await linkNodeToDataImport('Person', person.id, dataImport.id);
    if (!linkResult) return false;
  }

  // Step 3: Save Family nodes
  for (const familyId of dataImport.familyIds) {
    const family = families.find((f) => f.id === familyId);
    if (!family) return false;

    const familyResult = await saveFamily(family);
    if (!familyResult) return false;

    const result = await linkNodeToDataImport('Family', family.id, dataImport.id);
    if (!result) return false;
  }

  return true;
}
