import { neo4j } from './neo4j.connector';

export async function linkPersonToFamily(
  personId: string,
  familyId: string,
  role: 'HUSBAND_IN' | 'WIFE_IN' | 'CHILD_IN',
): Promise<boolean> {
  console.log(`Saving link '${role}' from person ${personId} to family ${familyId}`);

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (p:Person {id: $personId}), (f:Family {id: $familyId})
        MERGE (p)-[:${role}]->(f)
        RETURN p`,
      { personId, familyId },
    );

    if (result.records.length === 0) {
      console.error(`Failed to save link '${role}' from person ${personId} to family ${familyId}`);
      return false;
    }

    console.log(`Link '${role}' from person ${personId} to family ${familyId} saved`);

    return true;
  } catch (err) {
    console.error(
      `Failed to save link '${role}' from person ${personId} to family ${familyId}:`,
      err,
    );
    return false;
  } finally {
    await session.close();
  }
}

export async function linkPersonToLineage(personId: string, lineageId: string): Promise<boolean> {
  console.log(`Saving link 'FOUNDED' from person ${personId} to lineage ${lineageId}`);

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (p:Person {id: $personId}), (f:Lineage {id: $lineageId})
        MERGE (p)-[:FOUNDED]->(f)
        RETURN p`,
      { personId, lineageId },
    );

    if (result.records.length === 0) {
      console.error(`Failed to save link 'FOUNDED' from person ${personId} to family ${lineageId}`);
      return false;
    }

    console.log(`Link 'FOUNDED' from person ${personId} to family ${lineageId} saved`);

    return true;
  } catch (err) {
    console.error(
      `Failed to save link 'FOUNDED' from person ${personId} to family ${lineageId}:`,
      err,
    );
    return false;
  } finally {
    await session.close();
  }
}

export async function linkNodeToFileImport(
  nodeType: 'Person' | 'Family',
  nodeId: string,
  fileImportId: string,
): Promise<boolean> {
  console.log(`Saving link 'MEMBER_OF' from ${nodeType} ${nodeId} to file import ${fileImportId}`);

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (n:${nodeType} {id: $nodeId}), (i:FileImport {id: $fileImportId})
        MERGE (n)-[:MEMBER_OF]->(i)
        RETURN n`,
      { nodeId, fileImportId },
    );

    if (result.records.length === 0) {
      console.error(
        `Failed to save 'MEMBER_OF' link from ${nodeType} ${nodeId} to file import ${fileImportId}`,
      );
      return false;
    }

    console.log(`Link 'MEMBER_OF' from ${nodeType} ${nodeId} to file import ${fileImportId} saved`);

    return true;
  } catch (err) {
    console.error(
      `Failed to save link 'MEMBER_OF' from ${nodeType} ${nodeId} to file import ${fileImportId}:`,
      err,
    );
    return false;
  } finally {
    await session.close();
  }
}
