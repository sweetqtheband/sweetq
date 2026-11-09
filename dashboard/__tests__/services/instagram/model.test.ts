/**
 * Tests for Instagram Posts Model
 */

import { StoredInstagramPost } from "@/types/instagram-post";
import { Model } from "@/app/models/instagramPost";

describe("InstagramPost Model", () => {
  it("should create a model with all fields", () => {
    const data = {
      id: "123",
      caption: "Test post",
      media_type: "IMAGE",
      media_url: "https://example.com/image.jpg",
      thumbnail_url: "https://example.com/thumb.jpg",
      permalink: "https://instagram.com/p/123",
      timestamp: "2024-01-01T00:00:00Z",
      synced_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const model = Model(data);

    expect(model.id).toBe("123");
    expect(model.caption).toBe("Test post");
    expect(model.media_type).toBe("IMAGE");
    expect(model.permalink).toBe("https://instagram.com/p/123");
  });

  it("should set default dates", () => {
    const data = {
      id: "123",
      media_type: "VIDEO",
      permalink: "https://instagram.com/p/123",
      timestamp: "2024-01-01T00:00:00Z",
    };

    const model = Model(data);

    expect(model.synced_at).toBeInstanceOf(Date);
    expect(model.created_at).toBeInstanceOf(Date);
    expect(model.updated_at).toBeInstanceOf(Date);
  });

  it("should handle children objects", () => {
    const data = {
      id: "123",
      media_type: "CAROUSEL_ALBUM",
      permalink: "https://instagram.com/p/123",
      timestamp: "2024-01-01T00:00:00Z",
      children: [
        {
          id: "child1",
          media_type: "IMAGE",
          media_url: "https://example.com/child1.jpg",
        },
        {
          id: "child2",
          media_type: "VIDEO",
          thumbnail_url: "https://example.com/child2_thumb.jpg",
        },
      ],
    };

    const model = Model(data);

    expect(model.children).toHaveLength(2);
    expect(model.children?.[0].id).toBe("child1");
    expect(model.children?.[1].media_type).toBe("VIDEO");
  });

  it("should handle missing optional fields", () => {
    const data = {
      id: "123",
      media_type: "IMAGE",
      permalink: "https://instagram.com/p/123",
      timestamp: "2024-01-01T00:00:00Z",
    };

    const model = Model(data);

    expect(model.caption).toBeUndefined();
    expect(model.media_url).toBeUndefined();
    expect(model.children).toBeUndefined();
  });
});

describe("StoredInstagramPost", () => {
  it("should conform to storage interface", () => {
    const post: StoredInstagramPost = {
      id: "123",
      media_type: "IMAGE",
      permalink: "https://instagram.com/p/123",
      timestamp: "2024-01-01T00:00:00Z",
      caption: "Test",
      synced_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(post.id).toBe("123");
    expect(post.media_type).toBe("IMAGE");
    expect(post.synced_at).toBeInstanceOf(Date);
  });
});
