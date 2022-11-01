import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-direct-chats-home',
  templateUrl: './direct-chats-home.component.html',
  styleUrls: ['./direct-chats-home.component.scss']
})
export class DirectChatsHomeComponent implements OnChanges, OnDestroy {

  @Input() chats = [];
  @Input() unreadMessages = [];
  @Input() userData: any;
  @Input() workspaceData: any;

  @Output() chatSelectedEvent = new EventEmitter();
  @Output() chatDeletedEvent = new EventEmitter();

  numUnreadMessages = new Map<String, number>();

  socket;

  private subSink = new SubSink();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private chatService: ChatService,
    private socketService: SocketService,
  ) {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initDirectChats();
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  initDirectChats() {

    this.subSink.add(this.socketService.unreadMessagesData.subscribe(data => {
      this.unreadMessages = data;
    }));

    this.subSink.add(this.socketService.numUnreadDirectMessagesData.subscribe(data => {
      this.numUnreadMessages = data;
    }));

    this.enableChatNotificationsSocket();
  
    this.mapUnreadMessagesInChats(this.chats, this.unreadMessages);
  }

  mapUnreadMessagesInChats(directChats: any, unreadMessages: any) {

    let directChatsUnreadMessages = new Map<string, number>();
    directChats.forEach((chat) => {
      let unreadMessagesCount = 0;

      unreadMessages.forEach(unreadMessage => {
        if (unreadMessage?._chat && ((unreadMessage?._chat?._id || unreadMessage?._chat) == chat?._id)) {
          unreadMessagesCount++;
        }
      });
      directChatsUnreadMessages.set(chat?._id, unreadMessagesCount);
    });

    this.socketService.updateNumTotalUnreadDirectMessages(directChatsUnreadMessages);
  }

  /**
   * This function enables the notifications for the user
   */
  enableChatNotificationsSocket() {

    this.socket = this.socketService.serverInit();

    this.socket.onAny(async (eventName, ...args: any) => {
      if (eventName === 'newChatNotification') {

        const chatIndex = (this.chats) ? this.chats.findIndex(c => c._id == args[0].chatId) : -1;
        if (chatIndex < 0) {
          await this.chatService.getChatDetails(args[0].chatId).then((res: any) => {
            if (res && res.chat && !res.chat._group) {
              this.chats.unshift(res['chat']);
              this.numUnreadMessages.set(res?.chat?._id, 1);
            }
          });
        }
        
        const messageIndex = (this.unreadMessages) ? this.unreadMessages.findIndex(m => m._id == args[0].message._id) : -1
        if (messageIndex < 0) {
          this.unreadMessages.push(args[0].message);
          this.socketService.updateUnreadMessages(this.unreadMessages);
          this.mapUnreadMessagesInChats(this.chats, this.unreadMessages);
        }

        this.updateUnreadMessagesInChats(this.unreadMessages, this.numUnreadMessages, args[0].chatId, false)
      }

      if (eventName === 'messageRead') {
        this.updateUnreadMessagesInChats(this.unreadMessages, this.numUnreadMessages, args[0].chatId, true)
      }
    });
  }

  updateUnreadMessagesInChats(unreadMessages: any, numUnreadMessages: any, chatId: string, markAsRead?: boolean) {
    if (markAsRead) {
      unreadMessages.forEach(unreadMessage => {
        if (unreadMessage?._chat && ((unreadMessage?._chat?._id || unreadMessage?._chat) == chatId)) {
          unreadMessage.read = true;
        }
      });

      this.socketService.updateUnreadMessages(unreadMessages);

      numUnreadMessages.set(chatId, 0);
    } else {
      this.mapUnreadMessagesInChats(this.chats, this.unreadMessages);
    }

    this.socketService.updateNumTotalUnreadDirectMessages(numUnreadMessages);
  }

  getUnreadMessages(chatId: string) {
    return this.numUnreadMessages.get(chatId);
  }

  async openChat(chatId: string) {
    this.chatSelectedEvent.emit(chatId);
  }

  deleteChat(chatId: string) {
    this.chatService.archiveChat(chatId).then(res => {
      this.chatDeletedEvent.emit();
    });
  }
}
