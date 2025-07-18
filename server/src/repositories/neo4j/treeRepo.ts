import { Person } from '@shared/models/Person';
import { Family } from '@shared/models/Family';
import { Tree } from '@shared/models/Tree';
import { neo4jClient } from './neo4j';
import { savePerson } from './personRepo';
import { saveFamily } from './familyRepo';
import { linkNodeToTree } from './relationshipRepo';

export async function loadTrees(): Promise<Tree[]> {
  console.log('Loading trees');

  const session = neo4jClient.session();

  try {
    const result = await session.run('MATCH (t:Tree) RETURN t');

    if (result.records.length === 0) {
      console.error('Failed to load trees');
      return [];
    }

    const trees: Tree[] = result.records.map((r) => r.get('t').properties);

    console.log('Loaded trees:', trees.length);
    return trees;
  } catch (err) {
    console.error('Failed to load trees:', err);
    return [];
  } finally {
    await session.close(); // make sure it's always closed
  }
}

export async function loadTree(treeId: string): Promise<Tree | null> {
  console.log('Loading tree:', treeId);

  const session = neo4jClient.session();

  try {
    const result = await session.run(
      `MATCH (t:Tree {id: $treeId})
       OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
       OPTIONAL MATCH (f:Family)-[:MEMBER_OF]->(t)
       RETURN t,
              collect(DISTINCT p) AS people,
              collect(DISTINCT f) AS families`,
      { treeId },
    );

    if (result.records.length === 0) {
      console.error(`Failed to load tree ${treeId}`);
      return null;
    }

    const record = result.records[0];
    const treeNode = record.get('t').properties;

    const people: Person[] = record
      .get('people')
      .map((node: any) => node.properties);
    const families: Family[] = record
      .get('families')
      .map((node: any) => node.properties);

    return {
      id: treeNode.id,
      fileName: treeNode.fileName,
      createdAt: treeNode.createdAt,
      people,
      families,
    };
  } catch (err) {
    console.error(`Failed to load tree ${treeId}:`, err);
    return null;
  } finally {
    await session.close(); // make sure it's always closed
  }
}

export async function saveTree(tree: Tree): Promise<boolean> {
  const session = neo4jClient.session();

  // Step 1: Create the Tree node
  try {
    const result = await session.run(
      `MERGE (t:Tree {id: $id})
      SET t.fileName = $fileName,
          t.createdAt = $createdAt
      RETURN t`,
      tree,
    );

    if (result.records.length === 0) {
      console.error(`Failed to save Tree node ${tree.id}`);
      return false;
    }
  } catch (err) {
    console.error(`Failed to save Tree node ${tree.id}`);
    return false;
  } finally {
    await session.close(); // make sure it's always closed
  }

  // Step 2: Create Person nodes
  for (const person of tree.people) {
    console.log('Importing person:', person);

    const personResult = await savePerson(person);
    if (!personResult) return false;

    const linkResult = await linkNodeToTree('Person', person.id, tree.id);
    if (!linkResult) return false;
  }

  // Step 3: Create Family nodes
  for (const family of tree.families) {
    console.log('Importing family:', family);

    const familyResult = await saveFamily(family);
    if (!familyResult) return false;

    const result = await linkNodeToTree('Family', family.id, tree.id);
    if (!result) return false;
  }

  return true;
}
