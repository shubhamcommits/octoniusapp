import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  storageKey = environment.storageKey;

  /**
   * This function encrypts the key value which is supposed to be stored
   * So that key value is not visible/exposed to the client side
   * @param key
   */
  encryptKey(key: any){
    return CryptoJS.AES.encrypt(key, this.storageKey.trim()).toString();
  }

  /**
   * This function encrypts the data which is associated with storageKey
   * Following CryptoJS Standard functions
   * @param data
   */
  encryptData(key, data: string) {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * This function decrypts the data which is associated with storageKey
   * Following CryptoJS Standard functions
   * Returns JSON Data
   * @param data
   */
  decryptData(key, data : string) {
    return JSON.parse(CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8));
  }

  /**
   * This function replaces the localstorage data to encrypted data, which is more secured
   * @param data - requires an object and the storageKey from the environment
   */
  setLocalData(key: any, data: string) {
    data = this.encryptData(key, data);

    return localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * This function removes the localstorage data which is associated with the key and exists in the encrypted form
   */
  removeLocalData(key: any) {
    return localStorage.removeItem(key);
  }

  /**
   * This function fetches the localstorage data which is associated with the key and exists in the encrypted form
   */
  getLocalData(key: any) {
    try {
      return this.decryptData(key, JSON.parse(localStorage.getItem(key)));
    } catch(err) {
      return {};
    }
  }

  /**
   * This function checks if a particular @key exists in the @localStorage or not
   * @param key
   */
  existData(key: any){
    return localStorage.getItem(key);
  }

  /**
   * This function clears all the local & session storage data
   */
  clear() {
    localStorage.clear();
    sessionStorage.clear();
  }
}
