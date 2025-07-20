import neo4j, { Driver } from 'neo4j-driver';

import { Person } from '@shared/models/Person';
import { Family } from '@shared/models/Family';
import { Tree } from '@shared/models/Tree';

export class TreeRepo {
  private driver: Driver;

  public constructor() {
    this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
  }

  public async loadTrees(): Promise<Tree[]> {
    console.log('Loading trees');

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (t:Tree)
         RETURN t`
      );

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

  public async loadTree(treeId: string): Promise<Tree | null> {
    console.log('Loading tree:', treeId);

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (t:Tree {id: $treeId})
         OPTIONAL MATCH (p:Person)-[:MEMBER_OF]->(t)
         OPTIONAL MATCH (f:Family)-[:MEMBER_OF]->(t)
         OPTIONAL MATCH (f)<-[:HUSBAND_IN]-(h:Person)
         OPTIONAL MATCH (f)<-[:WIFE_IN]-(w:Person)
         OPTIONAL MATCH (f)<-[:CHILD_IN]-(c:Person)
         WITH t, collect(DISTINCT p) AS people, f, h, w, collect(DISTINCT c.id) AS childIds
         RETURN t,
                people,
                collect(DISTINCT {
                  family: f,
                  husbandId: h.id,
                  wifeId: w.id,
                  childIds: childIds
                }) AS families`,
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
      console.log(`TreeRepo: ${people.length} people loaded`);

      const families: Family[] = record
        .get('families')
        .map((node: any) => ({
          id: node.family.properties.id,
          husbandId: node.husbandId ?? null,
          wifeId: node.wifeId ?? null,
          childIds: node.childIds ?? [],
        }));
      console.log(`TreeRepo: ${families.length} families loaded:`, families);

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

  public async saveTree(tree: Tree): Promise<boolean> {
    const session = this.driver.session();

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

      const personResult = await this.savePerson(person);
      if (!personResult) return false;

      const linkResult = await this.linkNodeToTree('Person', person.id, tree.id);
      if (!linkResult) return false;
    }

    // Step 3: Create Family nodes
    for (const family of tree.families) {
      console.log('Importing family:', family);

      const familyResult = await this.saveFamily(family);
      if (!familyResult) return false;

      const result = await this.linkNodeToTree('Family', family.id, tree.id);
      if (!result) return false;
    }

    return true;
  }

  public async savePerson(person: Person): Promise<boolean> {
    const session = this.driver.session();

    try {
      const result = await session.run(
        `MERGE (p:Person {id: $id})
         SET p.givenName = $givenName,
             p.surname = $surname,
             p.birthDate = $birthDate,
             p.deathDate = $deathDate,
             p.metadata = apoc.convert.toJson($metadata)
         RETURN p`,
        person,
      );

      if (result.records.length === 0) {
        console.error(`Failed to save Person node ${person.id}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`Failed to save Person node ${person.id}:`, err);
      return false;
    } finally {
      await session.close(); // make sure it's always closed
    }
  }

  public async saveFamily(family: Family): Promise<boolean> {
    const session = this.driver.session();

    // Step 1: Create the Family node
    try {
      const familyResult = await session.run(
        `MERGE (f:Family {id: $id})
         SET f.metadata = apoc.convert.toJson($metadata)
         RETURN f`,
        family,
      );

      if (familyResult.records.length === 0) {
        console.error(`Failed to save Family node ${family.id}`);
        return false;
      }
    } catch (err) {
      console.error(`Failed to save Family node ${family.id}:`, err);
      return false;
    } finally {
      await session.close(); // make sure it's always closed
    }

    // Step 2: Connect spouses to Family
    if (family.husbandId) {
      const result = await this.linkPersonToFamily(
        family.husbandId,
        family.id,
        'HUSBAND_IN',
      );
      if (!result) return false;
    }

    if (family.wifeId) {
      const result = await this.linkPersonToFamily(
        family.wifeId,
        family.id,
        'WIFE_IN',
      );
      if (!result) return false;
    }

    // Step 3: Connect children to Family
    for (const childId of family.childIds ?? []) {
      const result = await this.linkPersonToFamily(childId, family.id, 'CHILD_IN');
      if (!result) return false;
    }

    return true;
  }

  public async linkPersonToFamily(
    personId: string,
    familyId: string,
    role: 'HUSBAND_IN' | 'WIFE_IN' | 'CHILD_IN',
  ): Promise<boolean> {
    const session = this.driver.session();

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

  public async linkNodeToTree(
    nodeType: 'Person' | 'Family',
    nodeId: string,
    treeId: string,
  ): Promise<boolean> {
    const session = this.driver.session();

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
}
