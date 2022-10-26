import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // dummyDirectChats = [
  //   { _id: 'DC0001', members: [{ _user: {_id: "5d77384385c30b001b33145a", active: true, profile_pic: "1591265999752_cosmin ciobanu.jpg", role: "admin", created_date: "2019-09-09T16:16:26.000Z", first_name: "Cosmin", last_name: "Ciobanu", email: "cosmin@octonius.com" }, joined_on: "2020-08-06T16:22:08.000Z", is_admin: false}, { _user: {_id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }, joined_on: "2019-09-09T16:16:26.000Z", is_admin: true }], archived: false, messages: [{ posted_on: "2022-10-13T16:03:11.168Z", _posted_by: { _id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }, content: { contents: { ops: [{insert: "1st message\n"}]}, html: "<p>1st message</p>", text: "1st message\n", mention: { users: [], files: []}}}, { posted_on: "2022-10-13T16:03:11.168Z", _posted_by: { _id: "5d77384385c30b001b33145a", active: true, profile_pic: "1591265999752_cosmin ciobanu.jpg", role: "admin", created_date: "2019-09-09T16:16:26.000Z", first_name: "Cosmin", last_name: "Ciobanu", email: "cosmin@octonius.com" }, content: { contents: { ops: [{insert: "2nd message\n"}]}, html: "<p>2nd message</p>", text: "2nd message\n", mention: { users: [], files: []}}}]},
  //   { _id: 'DC0002', members: [{ _user: {_id: "5d77384385c30b001b33145a", active: true, profile_pic: "1591265999752_cosmin ciobanu.jpg", role: "admin", created_date: "2019-09-09T16:16:26.000Z", first_name: "Cosmin", last_name: "Ciobanu", email: "cosmin@octonius.com" }, joined_on: "2020-08-06T16:22:08.000Z", is_admin: false}, { _user: {_id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }, joined_on: "2019-09-09T16:16:26.000Z", is_admin: true }, { _user: {_id: "5f87048a16702b0064954280", active: true, profile_pic: "1602688023052_0.jpeg", role: "admin", created_date: "2020-10-14T06:26:46.000Z", first_name: "Anda", last_name: "Hajdinjak", email: "anda@octonius.com" }, joined_on: "2019-09-09T16:16:26.000Z", is_admin: true }], archived: false, messages: [{ posted_on: "2022-10-13T16:03:11.168Z", _posted_by: { _id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }, content: { contents: { ops: [{insert: "1st message\n"}]}, html: "<p>1st message</p>", text: "1st message\n", mention: { users: [], files: []}}}, { posted_on: "2022-10-13T16:03:11.168Z", _posted_by: { _id: "5d77384385c30b001b33145a", active: true, profile_pic: "1591265999752_cosmin ciobanu.jpg", role: "admin", created_date: "2019-09-09T16:16:26.000Z", first_name: "Cosmin", last_name: "Ciobanu", email: "cosmin@octonius.com" }, content: { contents: { ops: [{insert: "2nd message\n"}]}, html: "<p>2nd message</p>", text: "2nd message\n", mention: { users: [], files: []}}}, { posted_on: "2022-10-13T16:03:11.168Z", _posted_by: { _id: "5f87048a16702b0064954280", active: true, profile_pic: "1602688023052_0.jpeg", role: "admin", created_date: "2020-10-14T06:26:46.000Z", first_name: "Anda", last_name: "Hajdinjak", email: "anda@octonius.com" }, content: { contents: { ops: [{insert: "3rd message\n"}]}, html: "<p>3rd message</p>", text: "3rd message\n", mention: { users: [], files: []}}}]},
  //   { _id: 'DC0003', members: [{ _user: {_id: "5f87048a16702b0064954280", active: true, profile_pic: "1602688023052_0.jpeg", role: "admin", created_date: "2020-10-14T06:26:46.000Z", first_name: "Anda", last_name: "Hajdinjak", email: "anda@octonius.com" }, joined_on: "2019-09-09T16:16:26.000Z", is_admin: true }, { _user: {_id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }, joined_on: "2019-09-09T16:16:26.000Z", is_admin: true }], archived: false, messages: []}
  // ];

  // dummyGroupChats = [
  //   { _id: 'GC0001', members: [], _group: { _id: "5e66264fd5aff30043f48067", group_avatar: "1591274165481undraw_mind_map_cwng.png", _members: [{ _id: "5d77384385c30b001b33145a", active: true, profile_pic: "1591265999752_cosmin ciobanu.jpg", role: "admin", created_date: "2019-09-09T16:16:26.000Z", first_name: "Cosmin", last_name: "Ciobanu", email: "cosmin@octonius.com" }], _admins: [{ _id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }], description: "channel for bug reporting and other ideas", group_name: "🐞Bugs and ideas" }, archived: false, messages: [] },
  //   { _id: 'GC0002', members: [], _group: { _id: "5d775b7b85c30b001b3314bd", group_avatar: "1596197609397Octonius logo.png", _members: [], _admins: [{ _id: "5f87048a16702b0064954280", active: true, profile_pic: "1602688023052_0.jpeg", role: "admin", created_date: "2020-10-14T06:26:46.000Z", first_name: "Anda", last_name: "Hajdinjak", email: "anda@octonius.com" }, { _id: "5d77384385c30b001b33145a", active: true, profile_pic: "1591265999752_cosmin ciobanu.jpg", role: "admin", created_date: "2019-09-09T16:16:26.000Z", first_name: "Cosmin", last_name: "Ciobanu", email: "cosmin@octonius.com" }, { _id: "5f2d00bcadc9b8004b4dc481", active: true, profile_pic: "5d77384385c30b001b331459_5f2d00bcadc9b8004b4dc481_1649869523020_yo.jpg", role: "owner", created_date: "2020-08-06T16:22:08.000Z", first_name: "Juan", last_name: "Alvarez", email: "juan@octonius.com" }], description: "2020 sales related group - sales  tasks, meetings etc", group_name: "SALES" }, archived: false, messages: [] }
  // ];

  // BaseUrl of the Post MicroService
  baseURL = environment.CHATS_BASE_API_URL;
  //baseURL = environment.POST_BASE_API_URL + '/chat';

  constructor(private _http: HttpClient) {
  }

  /**
   * This function is responsible for creating a chat
   */
  createChat(chat: any) {
    // if (!environment.production) {
    //   let chatData = JSON.parse(formData.get('chat'));
    //   chatData._id = '0001';
    //   chatData.archived = false;
    //   return new Promise((resolve, reject) => {
    //       resolve({
    //         message: 'Chat Created!',
    //         chat: chatData
    //       });
    //     });
    // } else {
      // Call the HTTP Request
      return this._http.post(this.baseURL + '/', { chat }).toPromise();
    // }
  }

  /**
   * This function is responsible for archiving a chat
   */
  archiveChat(chatId: string) {
    // if (!environment.production) {
    //   let chat = this.dummyDirectChats[0];
    //   chat.archived = true;
    //   return new Promise((resolve, reject) => {
    //       resolve({
    //         message: 'Chat Archived!',
    //         chat: chat
    //       });
    //     });
    // } else {
      // Call the HTTP Request
      return this._http.put(this.baseURL + `/${chatId}/archive-chat`, {}).toPromise();
    // }
  }

  /**
   * This function fetches the list of no archived direct chats
   * @param { userId } query
   */
  getDirectChats() {
    // if (!environment.production) {
    //   return new Promise(async (resolve, reject) => {
    //       resolve({
    //         message: 'Direct Chats Retreived!',
    //         chats: this.dummyDirectChats
    //       });
    //     });
    // } else {
      return this._http.get(this.baseURL + `/direct-chats`, {}).toPromise();
    // }
  }

  /**
   * This function fetches the list of no archived group chats
   * @param userId
   */
  getGroupChats() {
    // if (!environment.production) {
    //   return new Promise(async (resolve, reject) => {
    //       resolve({
    //         message: 'Group Chats Retreived!',
    //         chats: this.dummyGroupChats
    //       });
    //     });
    // } else {
      return this._http.get(this.baseURL + `/group-chats`, {}).toPromise();
    // }
  }

  getChatDetails(chatId: string) {
    // if (!environment.production) {
    //   let chatIndex = this.dummyDirectChats.findIndex(chat => chat._id == chatId);
    //   let chat;
    //   if (chatIndex < 0) {
    //     chatIndex = this.dummyGroupChats.findIndex(chat => chat._id == chatId);
    //     chat = this.dummyGroupChats[chatIndex];
    //   } else {
    //     chat = this.dummyDirectChats[chatIndex];
    //   }

    //   return new Promise(async (resolve, reject) => {
    //       resolve({
    //         message: 'Chat Retreived!',
    //         chat: chat
    //       });
    //     });
    // } else {
      // Call the HTTP Request
      return this._http.get(this.baseURL + `/${chatId}`).toPromise();
    // }
  }

  /**
   * This function removes a member from a chat
   * @param chatId
   * @param memberId
   */
  removeMember(chatId: string, memberId: string) {
    // if (!environment.production) {
    //   return new Promise(async (resolve, reject) => {
    //       resolve({
    //         message: 'Member Removed!',
    //         chat: this.dummyDirectChats[0]
    //       });
    //     });
    // } else {
      // Call the HTTP Request
      return this._http.put(this.baseURL + `/${chatId}/remove-member`, {
          memberId: memberId
        }).toPromise();
    // }
  }

  /**
   * This function adds a member from a chat
   * @param chatId
   * @param memberId
   */
  addMember(chatId: string, memberId: string) {
    // if (!environment.production) {
    //   return new Promise(async (resolve, reject) => {
    //       resolve({
    //         message: 'Member Added!',
    //         chat: this.dummyDirectChats[0]
    //       });
    //     });
    // } else {
      // Call the HTTP Request
      return this._http.put(this.baseURL + `/${chatId}/add-member`, {
          memberId: memberId
        }).toPromise();
    // }
  }

  /**
   * This function sends a new message to a chat
   * @param chatId
   * @param newMessage
   */
  sendMessage(newMessage: any) {
    // if (!environment.production) {
    //   return new Promise(async (resolve, reject) => {
    //       resolve({
    //         message: 'Message Sent!'
    //       });
    //     });
    // } else {
      return this._http.put(this.baseURL + `/send-message`,
        { newMessage }).toPromise();
    // }
  }

  /**
   * This function fetches the list of posts present in a group
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
}
