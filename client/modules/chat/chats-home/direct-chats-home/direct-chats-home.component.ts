import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ChatService } from 'src/shared/services/chat-service/chat.service';

@Component({
  selector: 'app-direct-chats-home',
  templateUrl: './direct-chats-home.component.html',
  styleUrls: ['./direct-chats-home.component.scss']
})
export class DirectChatsHomeComponent implements OnInit, OnChanges {

  @Input() chats = [];
  @Input() userData: any;
  @Input() workspaceData: any;

  @Output() chatSelectedEvent = new EventEmitter();
  @Output() chatDeletedEvent = new EventEmitter();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private chatService: ChatService
  ) {
    
  }

  async ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {

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
