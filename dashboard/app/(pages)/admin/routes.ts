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
        text: "tags",
        path: "/admin/tags",
      },
    ],
  },
];
