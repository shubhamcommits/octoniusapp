import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // BaseUrl of the Post MicroService
  baseURL = environment.CHATS_BASE_API_URL;
  baseNotificationsURL = environment.NOTIFICATIONS_BASE_API_URL;
  
  constructor(private _http: HttpClient) {
  }

  /**
   * This function is responsible for creating a chat
   */
  createChat(chat: any) {
    return this._http.post(this.baseURL + '/', { chat }).toPromise();
  }

  /**
   * This function is responsible for archiving a chat
   */
  archiveChat(chatId: string) {
    return this._http.put(this.baseURL + `/${chatId}/archive-chat`, {}).toPromise();
  }

  /**
   * This function fetches the list of no archived direct chats
   * @param { userId } query
   */
  getDirectChats() {
    return this._http.get(this.baseURL + `/direct-chats`, {}).toPromise();
  }

  /**
   * This function fetches the list of no archived group chats
   */
  getGroupChats() {
    return this._http.get(this.baseURL + `/group-chats`, {}).toPromise();
  }

  getChatDetails(chatId: string) {
    return this._http.get(this.baseURL + `/${chatId}`).toPromise();
  }

  /**
   * This function removes a member from a chat
   * @param chatId
   * @param memberId
   */
  removeMember(chatId: string, memberId: string) {
    return this._http.put(this.baseURL + `/${chatId}/remove-member`, {
        memberId: memberId
      }).toPromise();
  }

  /**
   * This function adds a member from a chat
   * @param chatId
   * @param memberId
   */
  addMember(chatId: string, memberId: string) {
    return this._http.put(this.baseURL + `/${chatId}/add-member`, {
        memberId: memberId
      }).toPromise();
  }

  /**
   * This function sends a new message to a chat
   * @param chatId
   * @param newMessage
   */
  sendMessage(newMessage: any) {
    return this._http.put(this.baseURL + `/send-message`,
      { newMessage }).toPromise();
  }

  /**
   * This function fetches the list of messages present in a chat
   * @param chatId
   * @param lastMessageId - optional
   */
  getMessages(chatId: string, limitOfMessages: any, lastMessageId?: string, lastMessagesPostedOn?: any) {

    // Create the request variable
    let request: any;

    if ((!lastMessageId || lastMessageId === undefined || lastMessageId === null)
        && (!lastMessagesPostedOn || lastMessagesPostedOn === undefined || lastMessagesPostedOn === null)) {
      request = this._http.get(this.baseURL + `/${chatId}/mesages`, {
        params: { limit: limitOfMessages }
      }).toPromise()
    } else {
      request = this._http.get(this.baseURL + `/${chatId}/next-mesages`, {
        params: {
          limit: limitOfMessages,
          lastMessagesPostedOn: lastMessagesPostedOn,
          lastMessageId: lastMessageId
        }
      }).toPromise()
    }

    return request;
  }

  /**
   * This function fetches the list of unread messages
   * @returns 
   */
  getUnreadChats() {
    return this._http.get(this.baseNotificationsURL + `/unread-chats`, {}).toPromise();
  }

  markAsRead(chatId: string) {
    return this._http.post(this.baseNotificationsURL + `/${chatId}/mark-read`, {}).toPromise();
  }

  /**
   * This function encrypts the data which is associated with key
   * Following CryptoJS Standard functions
   * @param data
   */
  encryptData(key, data: string) {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * This function decrypts the data which is associated with key
   * Following CryptoJS Standard functions
   * Returns JSON Data
   * @param data
   */
  decryptData(key, data : string) {
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
  }
}
