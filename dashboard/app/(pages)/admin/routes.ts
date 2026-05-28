import { Route } from "@/types/route";

export const routes: Route[] = [
  {
    text: "instagram",
    children: [
      {
        text: "followers",
        path: "/admin/instagram/followers",
      },
      {
        text: "following",
        path: "/admin/instagram/followings",
      },
    ],
  },
  {
    text: "tracks",
    path: "/admin/tracks",
  },
  {
    text: "gigs",
    path: "/admin/gigs",
  },

  {
    text: "bands",
    path: "/admin/bands",
  },
  {
    text: "finance",
    path: "/admin/finance",
    children: [
      {
        text: "finance-operations",
        path: "/admin/finance/operations",
      },
      {
        text: "finance-users",
        path: "/admin/finance/users",
      },
      {
        text: "finance-concepts",
        path: "/admin/finance/concepts",
      },
    ],
  },
  {
    text: "config",
    children: [
      {
        text: "users",
        path: "/admin/users",
      },
      {
        text: "layouts",
        path: "/admin/layouts",
      },
      {
        text: "config",
        path: "/admin/config",
      },
      {
        text: "routes",
        path: "/admin/routes",
      },
      {
        text: "social-networks",
        path: "/admin/social-networks",
      },
      {
        text: "tags",
        path: "/admin/tags",
      },
    ],
  },
];
