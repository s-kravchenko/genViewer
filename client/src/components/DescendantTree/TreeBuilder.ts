import { DataImport, Person, Family } from '@shared/models';

export interface Node extends Person {
  children: Node[];
}

export class TreeBuilder {
  private dataImport: DataImport;
  private people: Person[];
  private families: Family[];

  public constructor(dataImport: DataImport, people: Person[], families: Family[]) {
    this.dataImport = dataImport;
    this.people = people;
    this.families = families;
  }

  public build(): Node | null {
    const root = this.findRootPerson();
    if (!root) return null;

    return this.buildTreeNode(root);
  }

  private findRootPerson(): Person | null {
    const childIds = new Set(this.families.flatMap((f) => f.childIds ?? []));
    const root = this.people.find((p) => !childIds.has(p.id));
    return root ?? null;
  }

  private buildTreeNode(person: Person): Node {
    const children = this.families
      .filter((f) => f.husbandId === person.id || f.wifeId === person.id)
      .flatMap((f) => f.childIds ?? [])
      .map((childId) => this.people.find((p) => p.id === childId)!)
      .map((child) => this.buildTreeNode(child));

    return { ...person, children };
  }
}
