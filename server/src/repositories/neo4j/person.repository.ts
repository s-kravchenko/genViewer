import { neo4j } from './neo4j.connector';
import { Person } from '@shared/models';

export async function savePerson(person: Person): Promise<boolean> {
  console.log(`Saving person ${person.id}`);

  const session = neo4j.session();

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
      console.error(`Failed to save person ${person.id}`);
      return false;
    }

    console.log(`Person ${person.id} saved`);

    return true;
  } catch (err) {
    console.error(`Failed to save person ${person.id}:`, err);
    return false;
  } finally {
    await session.close();
  }
}
