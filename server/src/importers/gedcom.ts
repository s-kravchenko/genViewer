import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as Gedcom from 'read-gedcom';
import { Person } from '@shared/models/Person';
import { Family } from '@shared/models/Family';
import { Tree } from '@shared/models/Tree';
import { TreeRepo } from '../repositories/TreeRepo';

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

  private extract(filePath: string): Gedcom.SelectionGedcom {
    const buffer = fs.readFileSync(path.resolve(filePath));
    const gedcom = Gedcom.readGedcom(buffer);
    return gedcom;
  }

  private transform(gedcomData: Gedcom.SelectionGedcom, originalFileName: string): Tree {
    const gedcomIdToUuidMap: Record<string, string> = this.createGedcomIdToUuidMap(gedcomData);

    const people: Person[] = gedcomData
      .getIndividualRecord()
      .arraySelect()
      .map((ind) => this.gedcomIndividualToPerson(ind, gedcomIdToUuidMap));

    const families: Family[] = gedcomData
      .getFamilyRecord()
      .arraySelect()
      .map((fam) => this.gedcomFamilyToFamily(fam, gedcomIdToUuidMap));

    return {
      id: uuidv4(), // Generate a unique ID for the tree
      people,
      families,
      fileName: originalFileName,
      createdAt: new Date().toISOString(),
    };
  }

  private async load(tree: Tree): Promise<boolean> {
    const treeRepo = new TreeRepo();
    const result = await treeRepo.saveTree(tree);
    return result;
  }

  private createGedcomIdToUuidMap(gedcomData: Gedcom.SelectionGedcom): Record<string, string> {
    const gedcomIdToUuidMap: Record<string, string> = {};

    const gedcomRecords = [
      ...gedcomData.getIndividualRecord().arraySelect(),
      ...gedcomData.getFamilyRecord().arraySelect(),
    ];

    gedcomRecords.forEach((r) => {
      const gedcomId = r.pointer()[0]?.toString();
      if (gedcomId) {
        gedcomIdToUuidMap[gedcomId] = uuidv4();
      }
    });

    return gedcomIdToUuidMap;
  }

  private gedcomIndividualToPerson(
    ind: Gedcom.SelectionIndividualRecord,
    gedcomIdToUuidMap: Record<string, string>,
  ): Person {
    const gedcomId: string = ind.pointer()[0]?.toString() ?? '';

    // Extract sex value
    const sexTag = ind.getSex()?.value?.()[0]?.toString().toLowerCase() ?? '';
    const sex: 'male' | 'female' | 'unknown' =
      sexTag === 'm' ? 'male' : sexTag === 'f' ? 'female' : 'unknown';

    return {
      id: gedcomIdToUuidMap[gedcomId],

      givenName: ind.getName()?.getGivenName()?.value?.()[0]?.toString() ?? '',
      surname: ind.getName()?.getSurname()?.value?.()[0]?.toString() ?? '',
      birthDate: this.normalizeGedcomDate(ind.getEventBirth()?.getDate()?.toString() ?? ''),
      deathDate: this.normalizeGedcomDate(ind.getEventDeath()?.getDate()?.toString() ?? ''),
      sex,

      metadata: {
        source: {
          gedcom: {
            id: gedcomId,
          },
        },
      },
    };
  }

  private gedcomFamilyToFamily(
    family: Gedcom.SelectionFamilyRecord,
    gedcomIdToUuidMap: Record<string, string>,
  ): Family {
    const gedcomId = family.pointer()[0]?.toString() ?? '';
    const gedcomHusbandId = family.getHusband()?.value?.()[0]?.toString() ?? '';
    const gedcomWifeId = family.getWife()?.value?.()[0]?.toString() ?? '';
    const gedcomChildIds = family
      .getChild()
      .getIndividualRecord()
      .arraySelect()
      .map((ind) => ind.pointer()[0]?.toString() ?? '');

    return {
      id: gedcomIdToUuidMap[gedcomId],
      husbandId: gedcomIdToUuidMap[gedcomHusbandId],
      wifeId: gedcomIdToUuidMap[gedcomWifeId],
      childIds: gedcomChildIds.map((id) => gedcomIdToUuidMap[id]),

      metadata: {
        source: {
          gedcom: {
            id: gedcomId,
            husbandId: gedcomHusbandId,
            wifeId: gedcomWifeId,
            childIds: gedcomChildIds,
          },
        },
      },
    };
  }

  private normalizeGedcomDate(raw: string): string {
    if (raw === '(empty selection)') return '';

    const cleaned = raw.replace(/^DATE\s*/i, '').trim();

    // Match '0039 BC' or '0039 AD' formats
    const bcOrAdMatch = cleaned.match(/^0*(\d{1,4})\s*(BC|AD)$/i);
    if (bcOrAdMatch) {
      const year = parseInt(bcOrAdMatch[1], 10);
      const era = bcOrAdMatch[2].toUpperCase();
      return era === 'BC' ? `${year} BC` : `${year}`;
    }

    return cleaned;
  }
}
