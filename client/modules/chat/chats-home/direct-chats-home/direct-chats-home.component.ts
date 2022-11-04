import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { ChatService } from 'src/shared/services/chat-service/chat.service';

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
  @Input() numUnreadMessages;

  @Output() chatSelectedEvent = new EventEmitter();
  @Output() chatDeletedEvent = new EventEmitter();

  constructor(
    private chatService: ChatService,
  ) {
    
  }

  ngOnChanges() {
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

  deleteChat(chatId: string) {
    this.chatService.archiveChat(chatId).then(res => {
      this.chatDeletedEvent.emit(chatId);
    });
  }
}
