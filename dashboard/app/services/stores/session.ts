/**
 * Session store service to interact with sessionStorage
 */

export const sessionStore = {
	setValue(key:string, value:any) {
		return sessionStorage.setItem(key, JSON.stringify(value));
	},

	getValue(key:string) {
		return sessionStorage.getItem(key);
	},

	remove(key:string) {
		return sessionStorage.removeItem(key);
	},
};
