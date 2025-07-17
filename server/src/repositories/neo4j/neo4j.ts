import neo4j from 'neo4j-driver';

export const neo4jClient = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', '12345678'),
);

export const clear = async () => {
  const session = neo4jClient.session();

  try {
    await session.run(
      `MATCH (n)
      DETACH DELETE n`,
    );
  } catch (err) {
    console.error(`Failed to clear the database:`, err);
    return false;
  } finally {
    await session.close(); // make sure it's always closed
  }
};
