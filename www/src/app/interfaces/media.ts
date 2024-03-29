export interface Media {
  id: string;
  title?: string;
  date?: Date,
  cover?: string;
  status?: string;
  duration?: string;
  advance?: string;
  ended?: boolean;
  nextId?: number;
  isPlaying?: boolean;
  isCurrent?: boolean;
}
