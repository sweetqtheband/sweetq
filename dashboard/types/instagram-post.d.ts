
export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  children?: InstagramMediaChild[];
}

export interface InstagramMediaChild {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  media_url?: string;
  thumbnail_url?: string;
  timestamp?: string;
}

export interface InstagramPage {
  data: InstagramPost[];
  paging?: {
    cursors?: { after?: string; before?: string };
    next?: string;
    previous?: string;
  };
}

export interface InstagramInsights {
  name: string;
  period?: string;
  values: Array<{ value: number; end_time?: string }>;
  title?: string;
  description?: string;
}

export interface InstagramInsightsResponse {
  data: InstagramInsights[];
  paging?: {
    cursors?: { after?: string; before?: string };
  };
}

export interface StoredInstagramPost {
  _id?: string;
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  children?: InstagramMediaChild[];
  synced_at: Date;
  created_at: Date;
  updated_at: Date;
}