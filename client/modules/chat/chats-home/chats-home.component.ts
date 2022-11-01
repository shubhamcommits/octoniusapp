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

  private subSink = new SubSink();

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private chatService: ChatService,
    private utilityService: UtilityService,
    private socketService: SocketService
    ) {}

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.subSink.add(this.socketService.unreadMessagesData.subscribe(data => {
      this.unreadMessages = data;
    }));

    this.initUnreadChats();
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
    const unreadMessages = await this.publicFunctions.getUnreadChats();
    this.socketService.updateUnreadMessages(unreadMessages);
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
