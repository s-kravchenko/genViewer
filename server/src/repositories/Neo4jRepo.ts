import neo4j, { Driver } from 'neo4j-driver';

import { Person, Family, DataImport, RootInfo, Lineage } from '@shared/models';
import { DataImportResponse } from '@shared/contracts/DataImportResponse';

export class Neo4jRepo {
  private driver: Driver;

  public constructor() {
    this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
  }

  public async loadDataImports(): Promise<DataImport[]> {
    console.log('Neo4jRepo: Loading data imports');

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (i:DataImport)
         RETURN i`,
      );

      const dataImports: DataImport[] = result.records.map((r) => r.get('i').properties);

      console.log('Neo4jRepo: Loaded data imports:', dataImports.length);
      return dataImports;
    } catch (err) {
      console.error('Neo4jRepo: Failed to load data imports:', err);
      return [];
    } finally {
      await session.close();
    }
  }

  public async loadDataImport(id: string): Promise<DataImportResponse | null> {
    console.log('Neo4jRepo: Loading data import:', id);

    const session = this.driver.session();

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
        console.error(`Neo4jRepo: Failed to load data import ${id}`);
        return null;
      }

      const record = result.records[0];

      const dataImport = record.get('i').properties;

      const people: Person[] = record.get('people').map((node: any) => node.properties);
      console.log(`Neo4jRepo: ${people.length} people loaded`);

      const families: Family[] = record.get('families').map((node: any) => ({
        id: node.family.properties.id,
        husbandId: node.husbandId ?? null,
        wifeId: node.wifeId ?? null,
        childIds: node.childIds ?? [],
      }));
      console.log(`Neo4jRepo: ${families.length} families loaded:`, families);

      return {
        dataImport: dataImport,
        people,
        families,
      };
    } catch (err) {
      console.error(`Neo4jRepo: Failed to load data import ${id}:`, err);
      return null;
    } finally {
      await session.close();
    }
  }

  public async saveDataImport(people: Person[], families: Family[], dataImport: DataImport): Promise<boolean> {
    console.log(`Neo4jRepo: Saving data import ${dataImport.id}`);

    const session = this.driver.session();

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
        console.error(`Neo4jRepo: Failed to save data import ${dataImport.id}`);
        return false;
      }
    } catch (err) {
      console.error(`Neo4jRepo: Failed to save data import ${dataImport.id}:`, err);
      return false;
    } finally {
      await session.close();
    }

    // Step 2: Save Person nodes
    for (const personId of dataImport.personIds) {
      const person = people.find((p) => p.id === personId);
      if (!person) return false;

      const personResult = await this.savePerson(person);
      if (!personResult) return false;

      const linkResult = await this.linkNodeToDataImport('Person', person.id, dataImport.id);
      if (!linkResult) return false;
    }

    // Step 3: Save Family nodes
    for (const familyId of dataImport.familyIds) {
      const family = families.find((f) => f.id === familyId);
      if (!family) return false;

      const familyResult = await this.saveFamily(family);
      if (!familyResult) return false;

      const result = await this.linkNodeToDataImport('Family', family.id, dataImport.id);
      if (!result) return false;
    }

    return true;
  }

  public async loadRoots(): Promise<RootInfo[]> {
    console.log('Neo4jRepo: Loading roots');

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (root:Person)
         WHERE root.sex = 'male' AND NOT (root)-[:CHILD_IN]->(:Family)
         CALL apoc.path.expandConfig(root, {
           relationshipFilter: "HUSBAND_IN|WIFE_IN>,CHILD_IN<",
           maxLevel: 20,
           uniqueness: "NODE_GLOBAL"
         }) YIELD path
         WITH root, last(nodes(path)) AS descendant
         WHERE root <> descendant AND descendant:Person
         WITH
           root,
           COUNT(DISTINCT elementId(descendant)) AS descendantCount
         RETURN
           root,
           descendantCount
         ORDER BY descendantCount DESC`,
      );

      const roots: RootInfo[] = result.records.map((r) => ({
        root: r.get('root').properties,
        descendantCount: r.get('descendantCount').toNumber(),
      }));

      console.log('Neo4jRepo: Loaded roots:', roots.length);
      return roots;
    } catch (err) {
      console.error('Neo4jRepo: Failed to load roots:', err);
      return [];
    } finally {
      await session.close();
    }
  }

  public async loadLineages(): Promise<Lineage[]> {
    console.log('Neo4jRepo: Loading lineages');

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (l:Lineage)
         OPTIONAL MATCH (p:Person)-[:FOUNDED]->(l)
         RETURN l, p
         ORDER BY l.name`,
      );

      const lineages: Lineage[] = result.records.map((r) => ({
        id: r.get('l').properties.id,
        name: r.get('l').properties.name,
        founderId: r.get('p')?.properties.id,
        createdAt: r.get('l').properties.createdAt,
      }));

      console.log('Neo4jRepo: Loaded lineages:', lineages.length);
      return lineages;
    } catch (err) {
      console.error('Neo4jRepo: Failed to load lineages:', err);
      return [];
    } finally {
      await session.close();
    }
  }

  public async saveLineage(lineage: Lineage): Promise<boolean> {
    console.log(`Neo4jRepo: Saving lineage ${lineage.id}`);

    const session = this.driver.session();

    // Step 1: Save the Lineage node
    try {
      const result = await session.run(
        `MERGE (l:Lineage {id: $id})
         SET l.name = $name,
             l.createdAt = $createdAt
         RETURN l`,
        lineage,
      );

      if (result.records.length === 0) {
        console.error(`Neo4jRepo: Failed to save lineage ${lineage.id}`);
        return false;
      }
    } catch (err) {
      console.error(`Neo4jRepo: Failed to save lineage ${lineage.id}:`, err);
      return false;
    } finally {
      await session.close();
    }

    // Step 2: Connect root person to Lineage
    const result = await this.linkPersonToLineage(lineage.founderId, lineage.id);
    if (!result) return false;

    return true;
  }

  public async savePerson(person: Person): Promise<boolean> {
    console.log(`Neo4jRepo: Saving person ${person.id}`);

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
        console.error(`Neo4jRepo: Failed to save person ${person.id}`);
        return false;
      }

      console.log(`Neo4jRepo: Person ${person.id} saved`);

      return true;
    } catch (err) {
      console.error(`Neo4jRepo: Failed to save person ${person.id}:`, err);
      return false;
    } finally {
      await session.close();
    }
  }

  public async saveFamily(family: Family): Promise<boolean> {
    console.log(`Neo4jRepo: Saving family ${family.id}`);

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
        console.error(`Neo4jRepo: Failed to save family ${family.id}`);
        return false;
      }

      console.log(`Neo4jRepo: Family ${family.id} saved`);
    } catch (err) {
      console.error(`Neo4jRepo: Failed to save family ${family.id}:`, err);
      return false;
    } finally {
      await session.close();
    }

    // Step 2: Connect spouses to Family
    if (family.husbandId) {
      const result = await this.linkPersonToFamily(family.husbandId, family.id, 'HUSBAND_IN');
      if (!result) return false;
    }

    if (family.wifeId) {
      const result = await this.linkPersonToFamily(family.wifeId, family.id, 'WIFE_IN');
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
    console.log(`Neo4jRepo: Saving ${role} link from person ${personId} to family ${familyId}`);

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
          `Neo4jRepo: Failed to save ${role} link from person ${personId} to family ${familyId}`,
        );
        return false;
      }

      console.log(`Neo4jRepo: ${role} link from person ${personId} to family ${familyId} saved`);

      return true;
    } catch (err) {
      console.error(
        `Neo4jRepo: Failed to save ${role} link from person ${personId} to family ${familyId}:`,
        err,
      );
      return false;
    } finally {
      await session.close();
    }
  }

  public async linkPersonToLineage(
    personId: string,
    lineageId: string,
  ): Promise<boolean> {
    console.log(`Neo4jRepo: Saving FOUNDED link from person ${personId} to lineage ${lineageId}`);

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId}), (f:Lineage {id: $lineageId})
         MERGE (p)-[:FOUNDED]->(f)
         RETURN p`,
        { personId, lineageId },
      );

      if (result.records.length === 0) {
        console.error(
          `Neo4jRepo: Failed to save FOUNDED link from person ${personId} to family ${lineageId}`,
        );
        return false;
      }

      console.log(`Neo4jRepo: FOUNDED link from person ${personId} to family ${lineageId} saved`);

      return true;
    } catch (err) {
      console.error(
        `Neo4jRepo: Failed to save FOUNDED link from person ${personId} to family ${lineageId}:`,
        err,
      );
      return false;
    } finally {
      await session.close();
    }
  }

  public async linkNodeToDataImport(
    nodeType: 'Person' | 'Family',
    nodeId: string,
    dataImportId: string,
  ): Promise<boolean> {
    console.log(
      `Neo4jRepo: Saving MEMBER_OF link from ${nodeType} ${nodeId} to data import ${dataImportId}`,
    );

    const session = this.driver.session();

    try {
      const result = await session.run(
        `MATCH (n:${nodeType} {id: $nodeId}), (i:DataImport {id: $dataImportId})
         MERGE (n)-[:MEMBER_OF]->(i)
         RETURN n`,
        { nodeId, dataImportId },
      );

      if (result.records.length === 0) {
        console.error(
          `Neo4jRepo: Failed to save MEMBER_OF link from ${nodeType} ${nodeId} to data import ${dataImportId}`,
        );
        return false;
      }

      console.log(
        `Neo4jRepo: MEMBER_OF link from ${nodeType} ${nodeId} to data import ${dataImportId} saved`,
      );

      return true;
    } catch (err) {
      console.error(
        `Neo4jRepo: Failed to save MEMBER_OF link from ${nodeType} ${nodeId} to data import ${dataImportId}:`,
        err,
      );
      return false;
    } finally {
      await session.close();
    }
  }
}
