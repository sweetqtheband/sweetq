import fs from "fs-extra";
import { join } from "path";
import { pascalCase } from "@/app/utils";

const iconsDir = join(process.cwd(), "/public/icons");

const icons: Record<string, string> = {};

try {
  const files = fs.readdirSync(iconsDir);

  const icons = [...files].reduce((acc, file) => {
    const filePath = join(iconsDir, file);
    if (file.endsWith(".svg")) {
      const iconName = file.replace(".svg", "");
      acc.push(
        "export { default as " +
          pascalCase(iconName) +
          ' } from "' +
          filePath.replace(process.cwd(), "@") +
          '";'
      );
    }
    return acc;
  }, []);

  fs.writeFileSync(join(process.cwd(), "app/themes/icons.ts"), icons.join("\n"));
  console.log("Icons file generated successfully.");
} catch (error) {
  console.error("Error reading icons:", error);
}
