
export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export interface InstagramPage {
  data: InstagramPost[];
  paging?: {
    cursors?: { after?: string };
    next?: string;
  };
}