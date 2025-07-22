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
    console.log('TreeRepo: Loading trees');

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (t:Tree)
         RETURN t`
      );

      if (result.records.length === 0) {
        console.error('TreeRepo: Failed to load trees');
        return [];
      }

      const trees: Tree[] = result.records.map((r) => r.get('t').properties);

      console.log('TreeRepo: Loaded trees:', trees.length);
      return trees;
    } catch (err) {
      console.error('TreeRepo: Failed to load trees:', err);
      return [];
    } finally {
      await session.close();
    }
  }

  public async loadTree(treeId: string): Promise<Tree | null> {
    console.log('TreeRepo: Loading tree:', treeId);

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
        console.error(`TreeRepo: Failed to load tree ${treeId}`);
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
      console.error(`TreeRepo: Failed to load tree ${treeId}:`, err);
      return null;
    } finally {
      await session.close();
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
        console.error(`TreeRepo: Failed to save Tree node ${tree.id}`);
        return false;
      }
    } catch (err) {
      console.error(`TreeRepo: Failed to save Tree node ${tree.id}`);
      return false;
    } finally {
      await session.close();
    }

    // Step 2: Save Person nodes
    for (const person of tree.people) {
      const personResult = await this.savePerson(person);
      if (!personResult) return false;

      const linkResult = await this.linkNodeToTree('Person', person.id, tree.id);
      if (!linkResult) return false;
    }

    // Step 3: Save Family nodes
    for (const family of tree.families) {
      const familyResult = await this.saveFamily(family);
      if (!familyResult) return false;

      const result = await this.linkNodeToTree('Family', family.id, tree.id);
      if (!result) return false;
    }

    return true;
  }

  public async savePerson(person: Person): Promise<boolean> {
    console.log(`TreeRepo: Saving person ${person.id}`);

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MERGE (p:Person {id: $id})
         SET p.givenName = $givenName,
             p.surname = $surname,
             p.birthDate = $birthDate,
             p.deathDate = $deathDate,
             p.sex = $sex,
             p.metadata = apoc.convert.toJson($metadata)
         RETURN p`,
        person,
      );

      if (result.records.length === 0) {
        console.error(`TreeRepo: Failed to save person ${person.id}`);
        return false;
      }

      console.log(`TreeRepo: Person ${person.id} saved`);

      return true;
    } catch (err) {
      console.error(`TreeRepo: Failed to save person ${person.id}:`, err);
      return false;
    } finally {
      await session.close();
    }
  }

  public async saveFamily(family: Family): Promise<boolean> {
    console.log(`TreeRepo: Saving family ${family.id}`);

    const session = this.driver.session();

    // Step 1: Save the Family node
    try {
      const familyResult = await session.run(
        `MERGE (f:Family {id: $id})
         SET f.metadata = apoc.convert.toJson($metadata)
         RETURN f`,
        family,
      );

      if (familyResult.records.length === 0) {
        console.error(`TreeRepo: Failed to save family ${family.id}`);
        return false;
      }

      console.log(`TreeRepo: Family ${family.id} saved`);
    } catch (err) {
      console.error(`TreeRepo: Failed to save family ${family.id}:`, err);
    return false;
    } finally {
      await session.close();
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
    console.log(`TreeRepo: Saving ${role} link from person ${personId} to family ${familyId}`);

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
          `TreeRepo: Failed to save ${role} link from person ${personId} to family ${familyId}`,
        );
        return false;
      }

      console.log(`TreeRepo: ${role} link from person ${personId} to family ${familyId} saved`);

      return true;
    } catch (err) {
      console.error(
        `TreeRepo: Failed to save ${role} link from person ${personId} to family ${familyId}:`,
        err,
      );
      return false;
    } finally {
      await session.close();
    }
  }

  public async linkNodeToTree(
    nodeType: 'Person' | 'Family',
    nodeId: string,
    treeId: string,
  ): Promise<boolean> {
    console.log(`TreeRepo: Saving MEMBER_OF link from ${nodeType} ${nodeId} to tree ${treeId}`);

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (n:${nodeType} {id: $nodeId}), (t:Tree {id: $treeId})
         MERGE (n)-[:MEMBER_OF]->(t)
         RETURN n`,
        { nodeId, treeId },
      );

      if (result.records.length === 0) {
        console.error(
          `TreeRepo: Failed to save MEMBER_OF link from ${nodeType} ${nodeId} to tree ${treeId}`,
        );
        return false;
      }

        console.log(`TreeRepo: MEMBER_OF link from ${nodeType} ${nodeId} to tree ${treeId} saved`);

      return true;
    } catch (err) {
      console.error(
        `TreeRepo: Failed to save MEMBER_OF link from ${nodeType} ${nodeId} to tree ${treeId}:`,
        err,
      );
      return false;
    } finally {
      await session.close();
    }
  }
}
