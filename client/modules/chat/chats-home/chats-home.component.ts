import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-chats-home',
  templateUrl: 'chats-home.component.html',
  styleUrls: ['chats-home.component.scss']
})
export class ChatsHomeComponent implements OnInit {

  userData;
  workspaceData;

  showChatsList = false;

  directChats = [];
  groupChats = [];

  openChat;

  unreadMessages: any = [];
  numUnreadMessages

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private chatService: ChatService,
    private utilityService: UtilityService
    ) {}

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initUnreadChats();
  }

  showHideChats() {
    this.showChatsList = !this.showChatsList;

    if (this.showChatsList) {
      this.initChats();
    }
  }

  async initChats() {
    this.initDirectChats();
    this.initGroupChats();

    this.initUnreadChats();
  }

  initDirectChats() {
    this.chatService.getDirectChats().then(res => {
      this.directChats = res['chats'];
      this.sortDirectChats();
    }).catch(err => this.publicFunctions.sendError(err));
  }

  initGroupChats() {
    this.chatService.getGroupChats().then(res => {
      this.groupChats = res['chats'];
      this.sortGroupChats();
    }).catch(err => this.publicFunctions.sendError(err));
  }

  async initUnreadChats() {
    this.unreadMessages = await this.publicFunctions.getUnreadChats();
    this.numUnreadMessages = this.unreadMessages.length;

    await this.mapUnreadMessagesInChats(this.directChats, this.groupChats);
  }

  mapUnreadMessagesInChats(directChats: any, groupChats: any) {

    let mappedChats = [];
    directChats.forEach((chat) => {
      let unreadMessages = 0;

      this.unreadMessages.forEach(unreadMessage => {
        if (unreadMessage?._chat && ((unreadMessage?._chat?._id || unreadMessage?._chat) == chat?._id)) {
          unreadMessages++;
        }
      });

      chat.unreadMessages = unreadMessages;
      mappedChats.push(chat);
    });

    this.directChats = mappedChats;
    mappedChats = [];

    groupChats.forEach(chat => {
      let unreadMessages = 0;

      this.unreadMessages.forEach(unreadMessage => {
        if (unreadMessage?._chat && ((unreadMessage?._chat?._id || unreadMessage?._chat) == chat?._id)) {
          unreadMessages++;
        }
      });

      chat.unreadMessages = unreadMessages;
      mappedChats.push(chat);
    });
    this.groupChats = mappedChats;
  }

  async openChatDetails(chatId: any) {
    if (chatId) {
      await this.chatService.getChatDetails(chatId).then(res => {
        this.openChat = res['chat'];

        this.chatService.markAsRead(chatId);
      });
    } else {
      this.openChat = {
        members: [
          {
            _user: this.userData,
            joined_on: moment(),
            is_admin: true
          }],
        messages: []
      };
    }
  }

  closeChat(event: any) {

    this.initUnreadChats();
    
    let chat = event.chatData;

    if (chat?._id && !chat?._group) {
      const directChatIndex = (this.directChats) ? this.directChats.findIndex(c => c._id == chat._id) : -1;

      if (directChatIndex >= 0) {
        this.directChats.splice(directChatIndex, 1);
      }

      this.directChats.unshift(chat);

      this.sortDirectChats();
    }

    if (chat?._id && chat?._group) {
      const groupChatIndex = (this.groupChats) ? this.groupChats.findIndex(c => c._id == chat._id) : -1;

      if (groupChatIndex >= 0) {
        this.groupChats.splice(groupChatIndex, 1);
      }

      this.groupChats.unshift(chat);

      this.sortGroupChats();
    }
    
    this.openChat = null;
  }

  sortDirectChats() {
    this.directChats.sort((c1, c2) => (c1.last_message_on > c2.last_message_on) ? 1 : -1);
  }

  sortGroupChats() {
    this.groupChats.sort((c1, c2) => (c1.last_message_on > c2.last_message_on) ? 1 : -1);
  }
  
  deleteChat() {
    this.initDirectChats();
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
