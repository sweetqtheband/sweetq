import { ObjectId, type Collection, type Document } from "mongodb";
import { TREATMENTS } from "@/app/constants";
import es from "@/app/locales/es.json";
import en from "@/app/locales/en.json";
import { buildUserFilters } from "./user-filters";
import { visibleInstagramUserFilter } from "./user-visibility";
import type { z } from "zod";
import type { FilterOptionsInput, ListUsersInput } from "./validators";

type ListInput = z.infer<typeof ListUsersInput>;
type OptionsInput = z.infer<typeof FilterOptionsInput>;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const treatmentNames: Record<string, { es: string; en: string }> = {
  "treatments.person": { es: es.treatments.person, en: en.treatments.person },
  "treatments.collective": { es: es.treatments.collective, en: en.treatments.collective },
};

export const filterDefinitions = {
  combination: "All filters are combined with AND. Query searches username or full_name.",
  filters: {
    country: { type: "catalog ID", options: "country" },
    state: { type: "catalog ID", options: "state", parent: "country_id" },
    city: { type: "catalog ID", options: "city", parent: "state_id" },
    tags: { type: "tag ID array", options: "tag", behavior: "match any" },
    withoutTags: { type: "tag ID array", options: "tag", behavior: "exclude any" },
    treatment: {
      type: "number array",
      options: TREATMENTS.map((key, index) => ({ id: index + 1, key, name: treatmentNames[key] })),
    },
    show: {
      type: "string",
      default: "0",
      options: [
        { id: "0", meaning: "active (unfollow = false)" },
        { id: "1", meaning: "unfollowed (unfollow = true)" },
        { id: "2", meaning: "all" },
      ],
    },
  },
  options_tool: "instagram_search_filter_options",
};

export async function listUsers(collection: Collection<Document>, input: ListInput) {
  const clauses = buildUserFilters(input.filters);
  clauses.push(visibleInstagramUserFilter);
  if (input.query) {
    const term = escapeRegex(input.query);
    clauses.push({ $or: [
      { username: { $regex: term, $options: "i" } },
      { full_name: { $regex: term, $options: "i" } },
    ] });
  }
  if (input.cursor) clauses.push({ _id: { $gt: new ObjectId(input.cursor) } });
  const items = await collection.find(clauses.length ? { $and: clauses } : {}).sort({ _id: 1 }).limit(input.limit + 1).toArray();
  const has_more = items.length > input.limit;
  const page = items.slice(0, input.limit);
  return { items: page, has_more, next_cursor: has_more ? String(page[page.length - 1]._id) : null };
}

export async function searchFilterOptions(collection: Collection<Document>, input: OptionsInput) {
  const query: Document = {};
  if (input.query) {
    const term = escapeRegex(input.query);
    query.$or = input.type === "tag"
      ? [{ name: { $regex: term, $options: "i" } }]
      : [
          { "name.es": { $regex: term, $options: "i" } },
          { "name.en": { $regex: term, $options: "i" } },
          { name: { $regex: term, $options: "i" } },
        ];
  }
  if (input.country_id) query.country_id = input.country_id;
  if (input.state_id) query.state_id = input.state_id;
  if (input.cursor) query._id = { $gt: new ObjectId(input.cursor) };
  const documents = await collection.find(query).sort({ _id: 1 }).limit(input.limit + 1).toArray();
  const has_more = documents.length > input.limit;
  const page = documents.slice(0, input.limit);
  const items = page.map((item) => ({
    id: String(input.type === "tag" ? item._id : item.id),
    name: item.name,
    ...(input.type === "state" ? { country_id: item.country_id } : {}),
    ...(input.type === "city" ? { state_id: item.state_id } : {}),
  }));
  return { items, has_more, next_cursor: has_more ? String(page[page.length - 1]._id) : null };
}
