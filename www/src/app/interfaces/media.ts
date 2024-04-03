export interface Media {
  id: string;
  title?: string;
  date?: Date,
  cover?: string;
  video?: string;
  status?: string;
  duration?: string;
  advance?: string;
  ended?: boolean;
  nextId?: number;
  isPlaying?: boolean;
  isCurrent?: boolean;
}
