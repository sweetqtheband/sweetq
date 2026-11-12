import type { Document } from "mongodb";

export function buildUserFilters(values: Record<string, any> | undefined): Document[] {
  if (!values) return [{ unfollow: false }];

  const filters: Document[] = [];
  for (const key of Object.keys(values)) {
    switch (key) {
      case "tags":
        filters.push({ tags: { $in: values[key] } });
        break;
      case "withoutTags":
        filters.push({ tags: { $nin: values[key] } });
        break;
      case "show":
        if (values[key] !== "2") filters.push({ unfollow: values[key] === "1" });
        break;
      case "treatment":
        if (Array.isArray(values[key]) && values[key].length > 0) {
          filters.push({ treatment: { $in: values[key].map((item: string | number) => +item) } });
        }
        break;
      case "country":
      case "state":
      case "city":
        if (values[key]) filters.push({ [key]: +values[key] });
        break;
    }
  }
  return filters;
}
