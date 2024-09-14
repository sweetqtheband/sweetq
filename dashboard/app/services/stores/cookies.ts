import config from "@/app/config";

/**
 * Cookies store
 */
export const cookiesStore = {
	/**
   * Stores an item
   * @param {string} key Key to store
   * @param {any} value Value to store
   * @param {number} days Expiracy days
   */
	setValue(key:string, value:any, days = config.storages.cookies.expireDays) {
		const expirationDate = new Date();
		expirationDate.setTime(
			expirationDate.getTime() + days * 24 * 60 * 60 * 1000,
		);
		const expires = "expires=" + expirationDate.toUTCString();
		document.cookie = `${key}=${value};${expires};path=/`;
	},
	/**
   * Retrieve an item
   * @param {string} key Stored key
   * @param {import("../utils/constants").Storages} storage Storage type
   */
	getValue(key:string) {
		const cookieName = `${key}=`;
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			let trimmedCookie = cookie.trim();
			if (trimmedCookie.startsWith(cookieName)) {
				return trimmedCookie.substring(cookieName.length);
			}
		}
		return "";
	},
	/**
   * Remove a key
   * @param {string} key Stored key
   * @param {import("../utils/constants").Storages} storage  Storage Type
   * @void
   */
	remove(key:string) {
		document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
	},
};
