import { neo4jClient } from './neo4j';

export async function linkPersonToFamily(
  personId: string,
  familyId: string,
  role: 'HUSBAND_IN' | 'WIFE_IN' | 'CHILD_IN',
): Promise<boolean> {
  const session = neo4jClient.session();

  try {
    const result = await session.run(
      `MATCH (p:Person {id: $personId}), (f:Family {id: $familyId})
       MERGE (p)-[:${role}]->(f)
       RETURN p`,
      { personId, familyId },
    );

    if (result.records.length === 0) {
      console.error(
        `Failed to create link ${role} between person ${personId} and family ${familyId}`,
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      `Failed to create link ${role} between person ${personId} and family ${familyId}`,
    );
    return false;
  } finally {
    await session.close(); // make sure it's always closed
  }
}

export async function linkNodeToTree(
  nodeType: 'Person' | 'Family',
  nodeId: string,
  treeId: string,
): Promise<boolean> {
  const session = neo4jClient.session();

  try {
    const result = await session.run(
      `MATCH (n:${nodeType} {id: $nodeId}), (t:Tree {id: $treeId})
       MERGE (n)-[:MEMBER_OF]->(t)
       RETURN n`,
      { nodeId, treeId },
    );

    if (result.records.length === 0) {
      console.error(`Failed to link ${nodeType} ${nodeId} to tree ${treeId}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Failed to link ${nodeType} ${nodeId} to tree ${treeId}`);
    return false;
  } finally {
    await session.close(); // make sure it's always closed
  }
}
