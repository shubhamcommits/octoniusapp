import { Component, OnChanges, Input, Injector, OnDestroy } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { NotificationService } from 'src/shared/services/notification-service/notification.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';


@Component({
  selector: 'app-chat-notification-icon',
  templateUrl: './chat-notification-icon.component.html',
  styleUrls: ['./chat-notification-icon.component.scss']
})
export class ChatNotificationIconComponent implements OnChanges, OnDestroy {

  // User Data Variable
  @Input() userData: any;

  socket;

  unreadMessages: any = [];
  numUnreadMessages = 0;

  private subSink = new SubSink();

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    public utilityService: UtilityService,
    private notificationService: NotificationService,
    private socketService: SocketService) { }

  async ngOnChanges() {
    this.subSink.add(this.socketService.unreadMessagesData.subscribe(data => {
      this.unreadMessages = data;
    }));

    this.subSink.add(this.socketService.numTotalUnreadMessagesData.subscribe(data => {
      this.numUnreadMessages = data;
    }));

    this.unreadMessages = await this.publicFunctions.getUnreadChats();
    this.socketService.updateNumTotalUnreadMessages(this.unreadMessages.length);

    if (!this.checkDataExist(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.enableChatNotificationsSocket();
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  /**
   * This function enables the notifications feed for the user
   */
  enableChatNotificationsSocket() {

    this.socket = this.socketService.serverInit();

    this.socket.onAny((eventName, ...args: any) => {
      if (eventName === 'newChatNotification') {
        const notificationText = $localize`:@@directChatsHomoe.sentYouMessage:sent you a message`
        let notifyData: Array<any> = [];
        notifyData.push({
          'title': $localize`:@@directChatsHomoe.newMessage:New Message`,
          'alertContent': `${args[0].message?._posted_by?.first_name || 'Deleted'} ${args[0].message?._posted_by?.last_name || 'User'} ${notificationText}.`,
        });
        this.notificationService.generateNotification(notifyData);

        const messageIndex = (this.unreadMessages) ? this.unreadMessages.findIndex(m => m._id == args[0].message._id) : -1
        if (messageIndex < 0) {
          this.unreadMessages.push(args[0].message);
          this.socketService.updateUnreadMessages(this.unreadMessages);
        }
        
        this.socketService.updateNumTotalUnreadMessages(this.unreadMessages.length);
      }
    });
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
