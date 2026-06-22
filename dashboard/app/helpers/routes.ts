import { headers } from "next/headers";

export const getRoute = async () => {
  const headersList = await headers();

  const fullUrl = headersList.get("x-current-url") || headersList.get("referer") || "";

  if (fullUrl) {
    const urlObj = new URL(fullUrl);
    const pathname = urlObj.pathname;
    return pathname;
  }
};
