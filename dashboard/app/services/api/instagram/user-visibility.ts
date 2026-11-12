import type { Filter, Document } from "mongodb";

export const hiddenInstagramUserFilter: Filter<Document> = { extracted: true, deleted: true };

export const visibleInstagramUserFilter: Filter<Document> = { $nor: [hiddenInstagramUserFilter] };
