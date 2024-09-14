import config from "../config";
import { cookiesStore } from "./stores/cookies";
import { localStore } from "./stores/local";
import { sessionStore } from "./stores/session";

/**
 * Storage service.
 * Common interface to handle different storage methods all in one
 */
export const Storage: Record<string, any> = {
  default: config.storages.default,

  storages: {
    session: sessionStore,
    local: localStore,
    cookies: cookiesStore,
  },

  /**
   * Stores an item based on selected storage
   * @param {string} key Key to store
   * @param {any} value Value to store
   * @param {import("../utils/constants").Storages} storage Storage type
   */
  setValue(key: string, value: any, storage = Storage.default) {
    Storage.storages[storage].setValue(key, JSON.stringify(value));
  },

  /**
   * Retrieves an item based on selected storage
   * @param {string} key Stored key
   * @param {import("../utils/constants").Storages} storage Storage type
   */
  getValue(key: string, storage = Storage.default) {
    return Storage.storages[storage].getValue(key);
  },

  /**
   * Remove key from storage
   * @param {string} key Stored key
   * @param {import("../utils/constants").Storages} storage  Storage Type
   * @returns
   */
  remove(key: string, storage = Storage.default) {
    return Storage.storages[storage].remove(key);
  },
};
