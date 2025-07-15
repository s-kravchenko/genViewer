import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', '12345678'),
);

export const session = driver.session();

export const clear = async () => {
  await session.run(
    `MATCH (n)
     DETACH DELETE n`,
  );
};
