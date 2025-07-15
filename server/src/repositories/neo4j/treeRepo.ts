import { Person } from '@shared/models/Person';
import { Family } from '@shared/models/Family';
import { Tree } from '@shared/models/Tree';
import { session } from './neo4j';
import { savePerson } from './personRepo';
import { saveFamily } from './familyRepo';
import { linkNodeToTree } from './relationshipRepo';

export async function loadTree(treeId: string): Promise<Tree | null> {
  const result = await session.run(
    `MATCH (t:Tree {id: $treeId})
     OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
     OPTIONAL MATCH (f:Family)-[:MEMBER_OF]->(t)
     RETURN t,
            collect(DISTINCT p) AS people,
            collect(DISTINCT f) AS families`,
    { treeId },
  );

  if (result.records.length === 0) return null;

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
}

export async function saveTree(tree: Tree): Promise<boolean> {
  // Step 1: Create the Tree node
  const result = await session.run(
    `MERGE (t:Tree {id: $id})
     SET t.fileName = $fileName,
         t.createdAt = $createdAt
     RETURN t`,
    tree,
  );

  if (result.records.length === 0) {
    console.error(`Failed to create Tree node ${tree.id}`);
    return false;
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
