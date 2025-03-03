import axios from 'axios';
import { BaseList } from './_list';

// Messages service
export const InstagramMessages = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/instagram/messages`,
    })
  ),
};
