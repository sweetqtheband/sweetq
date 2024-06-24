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
  nextId?: number;
  spotify?: any;
  apple?: any;
  isPlaying?: boolean;
  isCurrent?: boolean;
}
