import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { toLocalISOString } from "./utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createLogger(file: string = "process.log") {
  const LOG_FILE = path.resolve(__dirname, path.join("..", "logs", file));
  return {
    logProcess: (message: string) => {
      const timestamp = toLocalISOString(new Date());
      const logMessage = `[${timestamp}] ${message}\n`;

      fs.appendFileSync(LOG_FILE, logMessage, "utf8");

      console.log(logMessage.trim());
    },
  };
}

export function logProcess(message: string) {
  const { logProcess } = createLogger();
  logProcess(message);
}
