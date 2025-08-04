export interface Person {
  id: string;

  givenName?: string;
  surname?: string;
  birthDate?: string;
  deathDate?: string;
  sex: string;

  familyIds: string[];

  metadata?: {
    source?: {
      gedcom?: {
        id: string;
      };
    };
  } & Record<string, any>;
};
