import { neo4j } from './neo4j.connector';
import { Person, Family, FileImport, FileImportDetails } from '@shared/models';
import { savePerson } from './person.repository';
import { saveFamily } from './family.repository';
import { linkNodeToFileImport } from './relationship.repository';

export async function loadFileImports(): Promise<FileImport[]> {
  console.log('Loading file imports');

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (i:FileImport)
        RETURN i`,
    );

    const fileImports: FileImport[] = result.records.map((r) => r.get('i').properties);

    console.log('Loaded file imports:', fileImports.length);
    return fileImports;
  } catch (err) {
    console.error('Failed to load file imports:', err);
    return [];
  } finally {
    await session.close();
  }
}

export async function loadFileImportDetails(id: string): Promise<FileImportDetails | null> {
  console.log('Loading file import details:', id);

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (i:FileImport {id: $id})
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
      console.error(`Failed to load file import details ${id}`);
      return null;
    }

    const record = result.records[0];

    const fileImport = record.get('i').properties;

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
      ...fileImport,
      people,
      families,
    };
  } catch (err) {
    console.error(`Failed to load file import details ${id}:`, err);
    return null;
  } finally {
    await session.close();
  }
}

export async function saveFileImportDetails(
  people: Person[],
  families: Family[],
  fileImport: FileImport,
): Promise<boolean> {
  console.log(`Saving file import ${fileImport.id}`);

  const session = neo4j.session();

  // Step 1: Save the FileImport node
  try {
    const result = await session.run(
      `MERGE (i:FileImport {id: $id})
        SET i.originalFileName = $originalFileName,
            i.filePath = $filePath,
            i.createdAt = $createdAt
        RETURN i`,
      fileImport,
    );

    if (result.records.length === 0) {
      console.error(`Failed to save file import ${fileImport.id}`);
      return false;
    }
  } catch (err) {
    console.error(`Failed to save file import ${fileImport.id}:`, err);
    return false;
  } finally {
    await session.close();
  }

  // Step 2: Save Person nodes
  for (const personId of fileImport.personIds) {
    const person = people.find((p) => p.id === personId);
    if (!person) return false;

    const personResult = await savePerson(person);
    if (!personResult) return false;

    const linkResult = await linkNodeToFileImport('Person', person.id, fileImport.id);
    if (!linkResult) return false;
  }

  // Step 3: Save Family nodes
  for (const familyId of fileImport.familyIds) {
    const family = families.find((f) => f.id === familyId);
    if (!family) return false;

    const familyResult = await saveFamily(family);
    if (!familyResult) return false;

    const result = await linkNodeToFileImport('Family', family.id, fileImport.id);
    if (!result) return false;
  }

  return true;
}
