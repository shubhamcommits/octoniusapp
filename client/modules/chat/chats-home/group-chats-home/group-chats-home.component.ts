import { Component, EventEmitter, Injector, Input, OnDestroy, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-chats-home',
  templateUrl: './group-chats-home.component.html',
  styleUrls: ['./group-chats-home.component.scss']
})
export class GroupChatsHomeComponent implements OnDestroy {

  @Input() chats = [];
  @Input() unreadMessages = [];
  @Input() userData: any;
  @Input() workspaceData: any;
  @Input() numUnreadMessages;

  @Output() chatSelectedEvent = new EventEmitter();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public utilityService: UtilityService
  ) {
    
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
  }

  getUnreadMessages(chatId: string) {
    return this.numUnreadMessages.get(chatId);
  }

  async openChat(chatId: string) {
    this.chatSelectedEvent.emit(chatId);
  }
}
