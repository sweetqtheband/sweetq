import axios from "./_db";
import { BaseList } from "./_list";
import type { Track } from "@/types/track";
import { FIELD_TYPES } from "../constants";
import { s3File } from "../utils";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  title: FIELD_TYPES.TEXT,
  slug: FIELD_TYPES.TEXT,
  date: FIELD_TYPES.DATE,
  cover: FIELD_TYPES.IMAGE_UPLOADER,
  video: FIELD_TYPES.VIDEO_UPLOADER,
  status: FIELD_TYPES.SELECT,
};

export const Options = {
  cover: { path: "/imgs/cover" },
  video: { path: "/video" },
  status: {
    options: [
      {
        id: "released",
        value: "tracks.status.released",
      },
      {
        id: "latest",
        value: "tracks.status.latest",
      },
      {
        id: "upcoming",
        value: "tracks.status.upcoming",
      },
    ],
  },
};

// Fields
const fields = {
  titles: {
    slug: "fields.slug",
    image: "fields.cover",
    reel: "fields.reel",
    title: "fields.title",
    date: "fields.date",
    cover: "fields.cover",
    video: "fields.video",
    status: "fields.status",
  },
  types: Types,
  options: Options,
};

// Parse all method
const parseAll = (data: Track[] = []) =>
  data.map((item: any) => {
    return {
      ...item,
      image: s3File(`${Tracks.fields.options.cover.path}/${item.cover}`),
      reel: s3File(`${Tracks.fields.options.video.path}/${item.video}`),
    };
  });

export const Tracks = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/tracks`,
    })
  ),
  fields,
  parseAll,
};
