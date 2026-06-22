import { useTheme } from "@/app/providers/theme";
import { pascalCase } from "@/app/utils";
import "./icon.scss";
interface IconProps {
  name: string;
}
export default function Icon({ name }: IconProps) {
  const { iconset } = useTheme();
  const IconComponent = iconset[pascalCase(name)];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in the current theme's iconset.`);
    return null;
  }

  return (
    <span className="sq-icon">
      <IconComponent />
    </span>
  );
}
