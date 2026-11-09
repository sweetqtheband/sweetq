/**
 * Tests for Instagram MCP tools
 * Uses mocked responses from Instagram API
 */

import {
  ListPostsInput,
  GetPostInput,
  GetInsightsInput,
  GetAccountInsightsInput,
  SearchPostsInput,
} from "@/app/services/api/instagram/validators";

describe("Instagram MCP Validators", () => {
  describe("ListPostsInput", () => {
    it("should validate with defaults", () => {
      const result = ListPostsInput.parse({});
      expect(result.limit).toBe(25);
      expect(result.cursor).toBeUndefined();
    });

    it("should validate with custom limit", () => {
      const result = ListPostsInput.parse({ limit: 10 });
      expect(result.limit).toBe(10);
    });

    it("should reject limit > 50", () => {
      expect(() => ListPostsInput.parse({ limit: 51 })).toThrow();
    });

    it("should accept media_type filter", () => {
      const result = ListPostsInput.parse({ media_type: "REELS" });
      expect(result.media_type).toBe("REELS");
    });

    it("should accept date range", () => {
      const startDate = new Date();
      const endDate = new Date();
      const result = ListPostsInput.parse({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      expect(result.start_date).toBeDefined();
      expect(result.end_date).toBeDefined();
    });
  });

  describe("GetPostInput", () => {
    it("should validate with post_id", () => {
      const result = GetPostInput.parse({ post_id: "12345" });
      expect(result.post_id).toBe("12345");
    });

    it("should reject missing post_id", () => {
      expect(() => GetPostInput.parse({})).toThrow();
    });
  });

  describe("GetInsightsInput", () => {
    it("should validate with post_id", () => {
      const result = GetInsightsInput.parse({ post_id: "12345" });
      expect(result.post_id).toBe("12345");
    });
  });

  describe("GetAccountInsightsInput", () => {
    it("should validate with default period", () => {
      const result = GetAccountInsightsInput.parse({});
      expect(result.period).toBe("day");
    });

    it("should accept different periods", () => {
      const result = GetAccountInsightsInput.parse({ period: "month" });
      expect(result.period).toBe("month");
    });
  });

  describe("SearchPostsInput", () => {
    it("should validate basic search", () => {
      const result = SearchPostsInput.parse({ query: "test" });
      expect(result.query).toBe("test");
      expect(result.limit).toBe(25);
      expect(result.skip).toBe(0);
    });

    it("should reject empty query", () => {
      expect(() => SearchPostsInput.parse({ query: "" })).toThrow();
    });

    it("should support pagination", () => {
      const result = SearchPostsInput.parse({
        query: "test",
        limit: 10,
        skip: 20,
      });
      expect(result.skip).toBe(20);
    });
  });
});
