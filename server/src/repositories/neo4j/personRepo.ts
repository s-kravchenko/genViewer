import { Person } from '@shared/models/Person';
import { session } from './neo4j';

export async function loadPerson(id: string): Promise<Person | null> {
  const result = await session.run(
    `MATCH (p:Person {id: $id})
     RETURN p`,
    { id },
  );

  if (result.records.length === 0) return null;

  const node = result.records[0].get('p');
  const props = node.properties;

  return {
    id: props.id,
    givenName: props.givenName,
    surname: props.surname,
    birthDate: props.birthDate,
    deathDate: props.deathDate,
  };
}

export async function savePerson(person: Person): Promise<boolean> {
  const result = await session.run(
    `MERGE (p:Person {id: $id})
     SET p.givenName = $givenName,
         p.surname = $surname,
         p.birthDate = $birthDate,
         p.deathDate = $deathDate
     RETURN p`,
    person,
  );

  if (result.records.length === 0) {
    console.error(`Failed to create Person node ${person.id}`);
    return false;
  }

  return true;
}
