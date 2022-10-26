import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-group-chats-home',
  templateUrl: './group-chats-home.component.html',
  styleUrls: ['./group-chats-home.component.scss']
})
export class GroupChatsHomeComponent implements OnInit {

  @Input() chats = [];
  @Input() userData: any;
  @Input() workspaceData: any;

  @Output() chatSelectedEvent = new EventEmitter();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
  ) {
    
  }

  async ngOnInit() {
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {

  }

  async openChat(chatId: string) {
    this.chatSelectedEvent.emit(chatId);
    // let modal;
    
    // modal = await this.modalController.create({
    //   component: ChatDetailsComponent,
    //   componentProps: {
    //     chatId: chatId
    //   },
    // });

    // modal.present();
  }
}
