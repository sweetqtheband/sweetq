import * as CryptoJS from 'crypto-js';

class EncryptionService {

  //The set method is use for encrypt the value.
  encrypt(key, value){    
    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key).toString();
  }


  //The get method is use for decrypt the value.
  decrypt(key, value){    
    return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
  }
}

export const encSvc = new EncryptionService();