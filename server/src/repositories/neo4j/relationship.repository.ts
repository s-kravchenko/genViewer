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
      console.error(
        `Failed to save link '${role}' from person ${personId} to family ${familyId}`,
      );
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
      console.error(
        `Failed to save link 'FOUNDED' from person ${personId} to family ${lineageId}`,
      );
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

export async function linkNodeToDataImport(
  nodeType: 'Person' | 'Family',
  nodeId: string,
  dataImportId: string,
): Promise<boolean> {
  console.log(
    `Saving link 'MEMBER_OF' from ${nodeType} ${nodeId} to data import ${dataImportId}`,
  );

  const session = neo4j.session();

  try {
    const result = await session.run(
      `MATCH (n:${nodeType} {id: $nodeId}), (i:DataImport {id: $dataImportId})
        MERGE (n)-[:MEMBER_OF]->(i)
        RETURN n`,
      { nodeId, dataImportId },
    );

    if (result.records.length === 0) {
      console.error(
        `Failed to save 'MEMBER_OF' link from ${nodeType} ${nodeId} to data import ${dataImportId}`,
      );
      return false;
    }

    console.log(
      `Link 'MEMBER_OF' from ${nodeType} ${nodeId} to data import ${dataImportId} saved`,
    );

    return true;
  } catch (err) {
    console.error(
      `Failed to save link 'MEMBER_OF' from ${nodeType} ${nodeId} to data import ${dataImportId}:`,
      err,
    );
    return false;
  } finally {
    await session.close();
  }
}
