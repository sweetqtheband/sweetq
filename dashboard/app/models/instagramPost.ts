import { StoredInstagramPost } from "@/types/instagram-post";

type Model = StoredInstagramPost;

export const Model = (data: any): Model => {
  const obj: Model = {
    id: String(data.id),
    media_type: data.media_type || "IMAGE",
    permalink: String(data.permalink),
    timestamp: String(data.timestamp),
    synced_at: data.synced_at ? new Date(data.synced_at) : new Date(),
    created_at: data.created_at ? new Date(data.created_at) : new Date(),
    updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
  };

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.caption) {
    obj.caption = String(data.caption);
  }

  if (data.media_url) {
    obj.media_url = String(data.media_url);
  }

  if (data.thumbnail_url) {
    obj.thumbnail_url = String(data.thumbnail_url);
  }

  if (data.children && Array.isArray(data.children)) {
    obj.children = data.children.map((child: any) => ({
      id: String(child.id),
      media_type: child.media_type || "IMAGE",
      media_url: child.media_url ? String(child.media_url) : undefined,
      thumbnail_url: child.thumbnail_url ? String(child.thumbnail_url) : undefined,
      timestamp: child.timestamp ? String(child.timestamp) : undefined,
    }));
  }

  return obj;
};
