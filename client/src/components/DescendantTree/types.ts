import { Person } from '@shared/models';

export type PersonWithGen = Person & { generation: number };

export type Connector = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
};
