import axios from 'axios';
import { BaseList } from './_list';
import type { Track } from '@/types/track';
import { BaseListItem } from '@/types/list';
import { FIELD_TYPES } from '../constants';

export const Tracks: BaseListItem = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/tracks`,
    })
  ),
  fields: {
    titles: {
      id: 'fields.id',
      image: 'fields.cover',
      reel: 'fields.reel',
      title: 'fields.title',
      date: 'fields.date',
      cover: 'fields.cover',
      video: 'fields.video',
      status: 'fields.status',
    },
    types: {
      id: FIELD_TYPES.HIDDEN,
      reel: FIELD_TYPES.VIDEO,
      title: FIELD_TYPES.TEXT,
      date: FIELD_TYPES.DATE,
      cover: FIELD_TYPES.IMAGE_UPLOADER,
      video: FIELD_TYPES.VIDEO_UPLOADER,
      status: FIELD_TYPES.SELECT,
    },
    options: {
      cover: { path: '/imgs/cover' },
      video: { path: '/video' },
      status: {
        options: [
          {
            id: 'released',
            value: 'tracks.status.released',
          },
          {
            id: 'latest',
            value: 'tracks.status.latest',
          },
          {
            id: 'upcoming',
            value: 'tracks.status.upcoming',
          },
        ],
      },
    },
  },
  parseAll: (data: Track[]) =>
    data.map((item: any) => {
      return {
        ...item,
        image: `${Tracks.fields.options.cover.path}/${item.cover}`,
        reel: `${Tracks.fields.options.video.path}/${item.video}`,
      };
    }),
};
