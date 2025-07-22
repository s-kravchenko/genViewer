export type Person = {
  id: string;

  givenName?: string;
  surname?: string;
  birthDate?: string;
  deathDate?: string;
  sex: string;

  metadata?: {
    source?: {
      gedcom?: {
        id: string;
      };
    };
  } & Record<string, any>;
};
