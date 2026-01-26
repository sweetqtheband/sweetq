import fs from "fs";
import path from "path";

export const logger = (...args: any) => {
  const msg = args
    .map((arg: any) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg))
    .join(" ");

  const line = `[${new Date().toISOString()}] ${msg}`;

  const filePath = "/var/log/sweetq.log";
  const dir = path.dirname(filePath);

  // Crear carpeta si no existe
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.appendFileSync("/var/log/sweetq.log", line + "\n", { flag: "a", encoding: "utf8" });
};
