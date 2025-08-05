import neo4jDriver from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || '12345678';

if (!password) {
  console.error('Neo4j password environment variable is not set!');
  process.exit(1);
}

export const neo4j = neo4jDriver.driver(uri, neo4jDriver.auth.basic(user, password));

// Use a simple, lightweight query to verify the connection
async function connectAndVerify() {
  const session = neo4j.session();
  try {
    // This simple query confirms that the database is reachable
    // and can successfully run a transaction.
    await session.run('RETURN 1');
    console.log('Neo4j connection successful');
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    process.exit(1);
  } finally {
    await session.close();
  }
}

connectAndVerify();
