import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as Gedcom from 'read-gedcom';
import { Person } from '@shared/models/Person';
import { Family } from '@shared/models/Family';
import { FileImport } from '@shared/models/FileImport';
import { saveFileImportDetails } from '../repositories/neo4j/fileImport.repository';

export class GedcomImporter {
  public async import(originalFileName: string, filePath: string): Promise<FileImport> {
    // Extract GEDCOM data from the file
    const buffer = fs.readFileSync(path.resolve(filePath));
    const gedcomData = Gedcom.readGedcom(buffer);

    // Transform GEDCOM data into a file import structure
    const gedcomIdToUuidMap: Record<string, string> = this.createGedcomIdToUuidMap(gedcomData);

    const people: Person[] = gedcomData
      .getIndividualRecord()
      .arraySelect()
      .map((ind) => this.gedcomIndividualToPerson(ind, gedcomIdToUuidMap));

    const families: Family[] = gedcomData
      .getFamilyRecord()
      .arraySelect()
      .map((fam) => this.gedcomFamilyToFamily(fam, gedcomIdToUuidMap));

    const personIds = people.map((p) => p.id);
    const familyIds = families.map((f) => f.id);

    const fileImport = {
      id: uuidv4(), // Generate a unique id for the file import

      originalFileName,
      filePath,
      createdAt: new Date().toISOString(),

      people,
      families,

      personIds,
      familyIds,
    };

    // Load the file import into the database
    const importResult = await saveFileImportDetails(people, families, fileImport);

    if (!importResult) {
      throw new Error('Failed to import GEDCOM data');
    }

    console.log(`GEDCOM import completed, file import id: ${fileImport.id}`);
    return fileImport;
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

      familyIds:
        ind
          .getFamilyAsSpouse()
          .arraySelect()
          .map((fam) => gedcomIdToUuidMap[fam.pointer()[0]?.toString() ?? '']) ?? [],

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
