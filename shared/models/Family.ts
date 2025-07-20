export type Family = {
  id: string;

  husbandId?: string;
  wifeId?: string;
  childIds?: string[];

  metadata?: {
    source?: {
      gedcom?: {
        id: string;
        husbandId?: string;
        wifeId?: string;
        childIds?: string[];
      };
    } & Record<string, any>;
  } & Record<string, any>;
};
