import CryptoJS from "crypto-js";
export const encSvc = {
  //The set method is use for encrypt the value.
  encrypt(message:string) {
    return CryptoJS.SHA3(message).toString();
  },
};
