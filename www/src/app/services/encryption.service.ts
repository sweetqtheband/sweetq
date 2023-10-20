import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class EncryptionService {
  constructor() { }
  //The set method is use for encrypt the value.
  encrypt(key:any, value:any){    
    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key).toString();
  }


  //The get method is use for decrypt the value.
  decrypt(key:any, value:any){    
    return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
  }
}