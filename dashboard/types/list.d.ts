export type BaseListItem = {
  fields: Record<string, any>;
  getAll: (searchParams?: any, cache?: boolean) => Promise<any>;
  parseAll: (data: any[], i18n?: i18n) => any[] | Promise<any[]>;
  post: (data: any) => Promise<any>;
  put(id: string, data: any): Promise<any>;
  delete(id: string | string[]): Promise<any>;
  getActions(params?: any): Record<string, any>;
  getBatchActions(params?: any): Record<string, any>;
  getTranslations(i18n: any, instance): Record<string, any>;
  getFields(params?: any): Promise<Record<string, any>>;
  getFilters(params?: any): Promise<Record<string, any>>;
  getMethods(router?: any): Record<string, any>;
  getOptions(params?: any): Promise<string, string>;
  getRenders(params?: any): Record<string, any>;
};
