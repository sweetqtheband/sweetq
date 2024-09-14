/**
 * Local store service to interact with localStorage
 */

export const localStore = {
	/**
   * Stores an item
   * @param {string} key Key to store
   * @param {any} value Value to store
   * @returns {any}
   */
	setValue(key:string, value:any) {
		return localStorage.setItem(key, value);
	},

	/**
   * Retrieve an item
   * @param {string} key Stored key
   * @param {import("../utils/constants").Storages} storage Storage type
   * @returns {any}
   */
	getValue(key:string) {
		return localStorage.getItem(key);
	},

	/**
   * Remove a key
   * @param {string} key Stored key
   * @param {import("../utils/constants").Storages} storage  Storage Type
   * @void
   */
	remove(key:string) {
		return localStorage.removeItem(key);
	},
};
