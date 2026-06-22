export type AsideHook = { key: string; component: React.ReactNode };
export interface Aside {
  before: AsideHook[];
  after: AsideHook[];
  main: AsideHook[];
}
