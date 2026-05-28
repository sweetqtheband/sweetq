export type Action = {
  type?: string;
  item?: Record<string, any>;
  open?: boolean;
  method?: string;
} | null;
