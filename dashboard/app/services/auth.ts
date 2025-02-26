import { Storage } from './storage';
import axios from 'axios';
import { HTTP_STATUS_CODES, STORAGE } from '../constants';
import { unquote } from '../utils';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { GET } from './_api';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/auth`,
});

/**
 * Auth service
 */
export const Auth = {
  _isAuth: false,
  user: null,
  token: '',

  /**
   * Returns headers
   */
  get headers() {
    return {
      headers: {
        Authorization: Auth.bearer,
      },
    };
  },

  /**
   * Returns bearer
   * @returns {String}
   */
  get bearer() {
    return `Bearer ${unquote(this.token)}`;
  },

  /**
   * Checks if user is authorized
   */
  async isAuth(
    params?: Readonly<{
      user: Record<string, any> | RequestCookie | string | null;
      token: RequestCookie | string | null;
      serverSide: boolean;
    }> | null
  ) {
    const { user, token, serverSide } = { ...params };

    if (!this._isAuth) {
      if (!serverSide || (serverSide && user && token)) {
        this.user = user || Storage.getValue('user', STORAGE.COOKIES);

        if (this.user) {
          this.token = token || Storage.getValue('auth-token', STORAGE.COOKIES);
          if (serverSide) {
            this._isAuth = serverSide;
          } else {
            try {
              const response = await GET(client, '', {}, this.headers.headers);
              this._isAuth = response.status === HTTP_STATUS_CODES.OK;
            } catch (err: any) {
              if (err.response.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
                this.logout();
              }
            }
          }
        } else {
          this.logout();
        }
      }
    }

    return this._isAuth;
  },

  /**
   * Login
   * @param {Object} params
   * @param {String} params.username
   * @param {String} params.password
   * @async
   */
  async login({
    username,
    password,
  }: Readonly<{ username: string; password: string }>) {
    // Handle logic here when using service

    try {
      const response = await client.post('login', {
        username,
        password,
      });

      if (response?.data?.token) {
        Auth._isAuth = true;
        Auth.user = response.data.user;
        Auth.token = response.data.token;

        Storage.setValue('user', Auth.user, STORAGE.COOKIES);
        Storage.setValue('auth-token', Auth.token, STORAGE.COOKIES);
      }

      return response;
    } catch (err) {
      Auth._isAuth = false;
      throw err;
    }
  },
  /**
   * Logout
   * @param {string} username
   * @async
   */
  async logout() {
    Auth._isAuth = false;
    Auth.user = null;
    Storage.remove('user', STORAGE.COOKIES);
    Storage.remove('auth-token', STORAGE.COOKIES);
    location.href = '/admin/login';
  },
};
