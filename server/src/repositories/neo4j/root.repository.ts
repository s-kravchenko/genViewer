import { neo4j } from './neo4j.connector';
import { RootResponse } from '@shared/contracts';

export async function loadRoots(): Promise<RootResponse[]> {
  console.log('Loading roots');

  const session = neo4j.session();

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

    const roots: RootResponse[] = result.records.map((r) => ({
      root: r.get('root').properties,
      descendantCount: r.get('descendantCount').toNumber(),
    }));

    console.log('Loaded roots:', roots.length);
    return roots;
  } catch (err) {
    console.error('Failed to load roots:', err);
    return [];
  } finally {
    await session.close();
  }
}
