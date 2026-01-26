export interface Field {
  field: string;
  type: string;
  value: any;
  disabled?: boolean;
  removable?: boolean;
  translations: Record<string, any>;
  fields: Record<string, any>;
  files: Record<string, any>;
  methods: Record<string, any>;
  formState: Record<string, any>;
  internalState: Record<string, any>;
  renders: Record<string, any>;
  ref: any;
  params: any;
  pathname: string;
  replace: Function;
  onAddFileHandler: Function;
  onRemoveFileHandler: Function;
  onInputHandler: Function;
  onFormStateHandler: Function;
  onInternalStateHandler: Function;
  onRemoveHandler: Function;
  className?: string | undefined;
  loading?: boolean;
  ready?: boolean;
}
