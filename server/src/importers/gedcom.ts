import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readGedcom, SelectionGedcom } from 'read-gedcom';
import { Person } from '@shared/models/Person';
import { Family } from '@shared/models/Family';
import { Tree } from '@shared/models/Tree';
import { clear as clearDb } from '../repositories/neo4j/neo4j';
import { saveTree } from '../repositories/neo4j/treeRepo';

export class GedcomImporter {
  public async import(filePath: string, originalFileName: string): Promise<Tree> {
    // Extract GEDCOM data from the file
    const gedcomData = this.extract(filePath);

    // Transform GEDCOM data into a tree structure
    const tree = this.transform(gedcomData, originalFileName);

    // Load the tree into the database
    const importResult = await this.load(tree);

    if (!importResult) {
      throw new Error('Failed to import GEDCOM data');
    }

    console.log(`GEDCOM import completed, tree ID: ${tree.id}`);
    return tree;
  }

  private extract(filePath: string): SelectionGedcom {
    const buffer = fs.readFileSync(path.resolve(filePath));
    const gedcom = readGedcom(buffer);
    return gedcom;
  }

  private transform(
    gedcomData: SelectionGedcom,
    originalFileName: string,
  ): Tree {
    const people: Person[] = gedcomData
      .getIndividualRecord()
      .arraySelect()
      .map((ind) => ({
        id: ind.pointer()[0]?.toString() ?? '',
        givenName:
          ind.getName()?.getGivenName()?.value?.()[0]?.toString() ?? '',
        surname: ind.getName()?.getSurname()?.value?.()[0]?.toString() ?? '',
        birthDate: ind.getEventBirth()?.getDate()?.toString() ?? '',
        deathDate: ind.getEventDeath()?.getDate()?.toString() ?? '',
      }));

    const families: Family[] = gedcomData
      .getFamilyRecord()
      .arraySelect()
      .map((family) => ({
        id: family.pointer()[0]?.toString() ?? '',
        husbandId: family.getHusband()?.value?.()[0]?.toString() ?? '',
        wifeId: family.getWife()?.value?.()[0]?.toString() ?? '',
        childrenIds: family
          .getChild()
          .getIndividualRecord()
          .arraySelect()
          .map((ind) => ind.pointer()[0]?.toString() ?? ''),
      }));

    return {
      id: uuidv4(), // Generate a unique ID for the tree
      people,
      families,
      fileName: originalFileName,
      createdAt: new Date().toISOString(),
    };
  }

  private async load(tree: Tree): Promise<boolean> {
    const result = await saveTree(tree);
    return result;
  }
}
