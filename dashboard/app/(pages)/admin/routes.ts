import { Route } from '@/types/route';

export const routes: Route[] = [
  {
    text: 'instagram',
    path: '/admin/instagram',
  },
  {
    text: 'tracks',
    path: '/admin/tracks',
  },
  {
    text: 'gigs',
    path: '/admin/gigs',
  },

  {
    text: 'bands',
    path: '/admin/bands',
  },
  {
    text: 'config',
    children: [
      {
        text: 'users',
        path: '/admin/users',
      },
      {
    text: 'layouts',
    path: '/admin/layouts'
  },
  {
        text: 'tags',
        path: '/admin/tags',
      },
    ],
  },
];
