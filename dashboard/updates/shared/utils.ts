import { execSync } from "child_process";

export const pipe = (...args: any) => {
  const [fn, ...rest] = args;
  return async (params: any): Promise<any> =>
    rest.length ? pipe(...rest)(await fn(params)) : fn(params);
};

const mimeTypesToExtensions: { [key: string]: string } = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/apng": "apng",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const getFileExtensionFromMimeType = (mimeType: string): string => {
  const extension = mimeTypesToExtensions[mimeType.toLowerCase()];
  if (extension) {
    return extension;
  }
  return ""; // Si no se encuentra, devolver una cadena vacía
};

export const getUserImage = async (user: any) => {
  try {
    const response = await fetch(user.profile_pic_url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.status}: ${response.statusText}`);

    const mimeType = response.headers.get("Content-Type") || "image/jpeg";

    const arrayBuffer = await response.arrayBuffer();

    const blob = new Blob([arrayBuffer], { type: mimeType });

    const fileName = `${user.username}.${getFileExtensionFromMimeType(mimeType)}`;
    const file = new File([blob], fileName, { type: mimeType });

    return file;
  } catch (error) {
    return null;
  }
};

export const getLocalHostIp = () => {
  try {
    const output = execSync("cat /etc/resolv.conf | grep nameserver").toString();
    const match = output.match(/\d+\.\d+\.\d+\.\d+/);
    const ip = match ? match[0] : "localhost";
    return ip;
  } catch (error) {
    return "localhost"; // fallback
  }
};

export const toLocalISOString = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const millis = String(date.getMilliseconds()).padStart(3, "0");

  // Offset en minutos respecto a UTC
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}${sign}${offsetHours}:${offsetMinutes}`;
};
