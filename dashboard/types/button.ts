export enum Button {
  primary = "primary",
  secondary = "secondary",
  ghost = "ghost",
}

export type ButtonType = keyof typeof Button;
