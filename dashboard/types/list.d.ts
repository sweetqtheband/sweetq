export type BaseListItem = {
  fields: Record<string, any>;
  getAll: (query?: string, limit?: number, cursor?: number) => Promise<any>;
  parseAll: (data: any[]) => any[];
  put(id: string, data: any): Promise<any>;
  getTranslations(i18n: any, instance): Record<string, any>;
};
