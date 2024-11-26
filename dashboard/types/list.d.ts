export type BaseListItem = {
  fields: Record<string, any>;
  getAll: (searchParams?: any) => Promise<any>;
  parseAll: (data: any[], i18n?: i18n) => any[] | Promise<any[]>;
  post: (data: any) => Promise<any>;
  put(id: string, data: any): Promise<any>;
  delete(id: string | string[]): Promise<any>;
  getTranslations(i18n: any, instance): Record<string, any>;
  getFields(searchParams?: any): Promise<Record<string, any>>;
  getMethods(router?: any): Record<string, any>;
  getOptions(params?: any): Promise<string, string>;
};
