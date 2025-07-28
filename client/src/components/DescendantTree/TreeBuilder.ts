import { Tree, Person } from '@shared/models';

export interface Node extends Person {
  children: Node[];
}

export class TreeBuilder {
  private tree: Tree;

  public constructor(tree: Tree) {
    this.tree = tree;
  }

  public build(): Node | null {
    const root = this.findRootPerson();
    if (!root) return null;

    return this.buildTreeNode(root);
  }

  private findRootPerson(): Person | null {
    const childIds = new Set(this.tree.families.flatMap((f) => f.childIds ?? []));
    const root = this.tree.people.find((p) => !childIds.has(p.id));
    return root ?? null;
  }

  private buildTreeNode(person: Person): Node {
    const children = this.tree.families
      .filter((f) => f.husbandId === person.id || f.wifeId === person.id)
      .flatMap((f) => f.childIds ?? [])
      .map((childId) => this.tree.people.find((p) => p.id === childId)!)
      .map((child) => this.buildTreeNode(child));

    return { ...person, children };
  }
}
