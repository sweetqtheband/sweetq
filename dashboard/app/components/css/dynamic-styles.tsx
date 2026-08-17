interface DynamicStylesProps {
  variables?: Record<string, string>;
  classes?: Record<string, Record<string, string>>;
}

export default function DynamicStyles({ variables = {}, classes = {} }: DynamicStylesProps) {
  const varsCss = Object.entries(variables)
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n");

  const classesCss = Object.entries(classes)
    .map(([className, properties]) => {
      const props = Object.entries(properties)
        .map(([key, val]) => `${key}: ${val};`)
        .join("\n");
      return `.${className} {\n${props}\n}`;
    })
    .join("\n");

  const css = `
    :root {
      ${varsCss}
    }
    ${classesCss}
  `;

  return (
    <style suppressHydrationWarning data-dynamic-style="true">
      {css}
    </style>
  );
}
