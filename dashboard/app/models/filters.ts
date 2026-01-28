import { createHash } from "crypto";

function hashFilters(filters: Record<string, any>) {
  const stable = stableStringifyDeep(filters);
  return createHash("sha1").update(stable).digest("hex");
}

function stableStringifyDeep(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringifyDeep).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `"${k}":${stableStringifyDeep(value[k])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

type Model = {
  _id: string;
  key: string;
  filters: Record<string, any>;
  expires: Date;
};
export const Model = (data: any): Model => {
  const obj = {
    filters: data.filters || {},
    key: data.key || null,
    expires: data.expires || null,
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (!data?.key) {
    obj.key = hashFilters(obj.filters);
  }

  if (!data?.expires) {
    // expire in 1 day
    obj.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  return obj;
};
