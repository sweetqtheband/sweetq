export const Layout = {
  isAdmin: (path: string) => path.startsWith('/admin'), 
  hasAdminMenu: (path: string) => Layout.isAdmin(path) && !path.startsWith('/admin/login'),
};