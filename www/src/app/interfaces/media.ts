export interface Media {
  id: string;
  title?: string;
  date?: Date;
  cover?: string;
  video?: string;
  status?: string;
  duration?: string;
  advance?: string;
  ended?: boolean;
  download?:boolean
  nextId?: number;
  spotify?: any;
  apple?: any;
  description?: string|null;
  lyrics?: string|null;
  isPlaying?: boolean;
  isCurrent?: boolean;
}
