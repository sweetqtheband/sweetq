import { Band } from './band';
export interface Gig {
  id: number;
  date: string;
  day: string;
  month: string;
  year: string;
  city: string;
  hour: string;
  venue: string;
  address?: string;
  map?: string;
  bands: Band[];
  event: string;
  tickets: string;
  expired?: boolean;
}
