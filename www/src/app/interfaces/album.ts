import { Media } from './media';

export interface Album {
  id: string;
  title?: string;
  description?: string;
  date?: Date;
  cover?: string;
  tracks?: Array<Media>;
}
