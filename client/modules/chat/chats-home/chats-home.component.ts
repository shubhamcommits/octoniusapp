import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-chats-home',
  templateUrl: 'chats-home.component.html',
  styleUrls: ['chats-home.component.scss']
})
export class ChatsHomeComponent implements OnInit, OnDestroy {

  userData;
  workspaceData;

  showChatsList = false;

  directChats = [];
  groupChats = [];

  openChat;

  unreadMessages: any = [];
  numUnreadDirectMessages = new Map<String, number>();
  numUnreadGroupMessages = new Map<String, number>();

  socket;

  private subSink = new SubSink();

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private chatService: ChatService,
    private utilityService: UtilityService,
    private socketService: SocketService
    ) {
      this.enableChatNotificationsSocket();
    }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.subSink.add(this.socketService.unreadMessagesData.subscribe(data => {
      this.unreadMessages = data;
    }));

    this.subSink.add(this.socketService.numUnreadDirectMessagesData.subscribe(data => {
      this.numUnreadDirectMessages = data;
    }));

    this.subSink.add(this.socketService.numUnreadGroupMessagesData.subscribe(data => {
      this.numUnreadGroupMessages = data;
    }));

    this.initChats();
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  showHideChats() {
    this.showChatsList = !this.showChatsList;

    if (this.showChatsList) {
      this.initChats();
    }
  }

  async initChats() {
    const unreadMessages = await this.publicFunctions.getUnreadChats();
    this.socketService.updateUnreadMessages(unreadMessages);

    await this.initDirectChats(unreadMessages);
    await this.initGroupChats(unreadMessages);
  }

  initDirectChats(unreadMessages: any) {
    this.chatService.getDirectChats().then(async res => {
      this.directChats = res['chats'];
      await this.mapUnreadMessagesInDirectChats(this.directChats, unreadMessages);
      this.sortDirectChats();
    }).catch(err => this.publicFunctions.sendError(err));
  }

  initGroupChats(unreadMessages: any) {
    this.chatService.getGroupChats().then(async res => {
      this.groupChats = res['chats'];
      await this.mapUnreadMessagesInGroupChats(this.groupChats, unreadMessages);
      this.sortGroupChats();
    }).catch(err => this.publicFunctions.sendError(err));
  }

  mapUnreadMessagesInDirectChats(directChats: any, unreadMessages: any) {

    // MAP DIRECT CHATS
    directChats.forEach((chat) => {
      let unreadMessagesCount = 0;

      unreadMessages.forEach(unreadMessage => {
        if (unreadMessage?._chat && ((unreadMessage?._chat?._id || unreadMessage?._chat) == chat?._id)) {
          unreadMessagesCount++;
        }
      });
      this.numUnreadDirectMessages.set(chat?._id, unreadMessagesCount);
    });

    this.socketService.updateNumTotalUnreadDirectMessages(this.numUnreadDirectMessages);
  }

  mapUnreadMessagesInGroupChats(groupChats: any, unreadMessages: any) {
    // MAP GROUP CHATS
    groupChats.forEach((chat) => {
      let unreadMessagesCount = 0;

      unreadMessages.forEach(unreadMessage => {
        if (unreadMessage?._chat && ((unreadMessage?._chat?._id || unreadMessage?._chat) == chat?._id)) {
          unreadMessagesCount++;
        }
      });
      this.numUnreadGroupMessages.set(chat?._id, unreadMessagesCount);
    });

    this.socketService.updateNumTotalUnreadGroupMessages(this.numUnreadGroupMessages);
  }

  /**
   * This function enables the notifications for the user
   */
  enableChatNotificationsSocket() {

    this.socket = this.socketService.serverInit();

    this.socket.onAny(async (eventName, ...args: any) => {
      if (eventName === 'newChatNotification') {
        const chatId = args[0].chatId;
        const directChatIndex = (this.directChats) ? this.directChats.findIndex(c => c._id == chatId) : -1;
        const groupChatIndex = (this.groupChats) ? this.groupChats.findIndex(c => c._id == chatId) : -1;
        if (directChatIndex < 0 || groupChatIndex < 0) {
          this.initChats();
        } else if (directChatIndex >= 0) {
          const numUnread = this.numUnreadDirectMessages.get(chatId);
          this.numUnreadDirectMessages.set(chatId, numUnread + 1);
        } else if (groupChatIndex >= 0) {
          const numUnread = this.numUnreadGroupMessages.get(chatId);
          this.numUnreadGroupMessages.set(chatId, numUnread + 1);
        }
      }
    });
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
  
  deleteChat(chatId: string) {
    const directChatIndex = (this.directChats) ? this.directChats.findIndex(c => c._id == chatId) : -1;

    if (directChatIndex >= 0) {
      this.directChats.splice(directChatIndex, 1);
    }
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
