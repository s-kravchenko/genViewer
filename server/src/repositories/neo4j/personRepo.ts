import { Person } from '@shared/models/Person';
import { neo4jClient } from './neo4j';

export async function loadPerson(id: string): Promise<Person | null> {
  const session = neo4jClient.session();

  try {
    const result = await session.run(
      `MATCH (p:Person {id: $id})
       RETURN p`,
      { id },
    );

    if (result.records.length === 0) {
      console.error(`Failed to load person ${id}`);
      return null;
    }

    const node = result.records[0].get('p');
    const props = node.properties;

    return {
      id: props.id,
      givenName: props.givenName,
      surname: props.surname,
      birthDate: props.birthDate,
      deathDate: props.deathDate,
    };
  } catch (err) {
    console.error(`Failed to load person ${id}:`, err);
    return null;
  } finally {
    await session.close(); // make sure it's always closed
  }
}

export async function savePerson(person: Person): Promise<boolean> {
  const session = neo4jClient.session();

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
