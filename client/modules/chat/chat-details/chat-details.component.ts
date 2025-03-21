import { Component, OnInit, Injector, ViewChild, OnDestroy, ElementRef, Input, EventEmitter, Output, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.scss']
})
export class ChatDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() userData;
  @Input() workspaceData;
  @Input() chatData;
  @Input() isVideoCall = false;

  @ViewChild('chatContent', { static: false }) chatContent: ElementRef;

  @Output() chatClosedEvent = new EventEmitter();

  messages = [];
  lastMessageId = '';
  lastMessagesPostedOn;
  moreMessagesToLoad = true;
  isLoading = false;

  members = [];

  //messageContent;
  newMessage = '';

  canEdit = true;

  limitOfMessages = 10;

  numTotalUnreadMessages;
  numUnreadDirectMessages;
  numUnreadGroupMessages;

  // Subsink Object
  subSink = new SubSink();

  socket;

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
      private changeDetectorRef: ChangeDetectorRef,
      private injector: Injector,
      public utilityService: UtilityService,
      private chatService: ChatService,
      private datesService: DatesService,
      private websocketService: SocketService
      ) {}

  ngOnInit() {
    this.initChat();
  }

  /**
   * This function handles of sending the data to the user(of skills or members)
   * Uses Debounce time and subscribe to the itemValueChanged Observable
   */
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  async initChat() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.workspaceData) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.subSink.add(this.websocketService.numUnreadGroupMessagesData.subscribe(data => {
      this.numUnreadGroupMessages = data;
    }));

    this.subSink.add(this.websocketService.numUnreadDirectMessagesData.subscribe(data => {
      this.numUnreadDirectMessages = data;
    }));

    this.subSink.add(this.websocketService.numTotalUnreadMessagesData.subscribe(data => {
      this.numTotalUnreadMessages = data;
    }));

    if (!this.objectExists(this.chatData)) {
      this.chatData = {
        members: [
          {
            _user: this.userData,
            joined_on: DateTime.now(),
            is_admin: true
          }],
        messages: []
      };
    }

    if (this.chatData._id) {
      this.joinChatSocket();
      await this.loadMessages();
      this.markAsRead(this.chatData._id);
    }

    await this.initMembers();

    const adminIndex = (this.chatData.members) ? this.chatData.members.findIndex(member => member?._user?._id == this.userData?._id && member?.is_admin) : -1;
    this.canEdit = adminIndex >= 0 && !this.objectExists(this.chatData?._group);
  }

  async loadMessages() {
    await this.chatService.getMessages(this.chatData._id, this.limitOfMessages).then(async res => {
      await this.unshiftMessages(res['messages']);

      this.scrollToBottom();
      
      if (this.messages.length % this.limitOfMessages != 0) {
        this.moreMessagesToLoad = false;
      }

      this.lastMessageId = (this.messages && this.messages[0]) ? this.messages[0]._id : '';
      this.lastMessagesPostedOn = (this.messages && this.messages[0]) ? this.messages[0].posted_on : null;
    });
  }

  async initMembers() {
    if (!this.objectExists(this.chatData?._group)) {
      this.members = await this.chatData?.members;
      this.members = await this.members?.filter((member, index) => (this.members?.findIndex(m => m._user._id == member._user._id) == index));
    } else {
      this.members = await this.chatData?._group?._admins?.concat(this.chatData?._group?._members);
      this.members = await this.members?.filter((member, index) => (this.members?.findIndex(m => m._id == member._id) == index));
    }
  }

  onAssignedAdded(member: any) {
    if (this.chatData && !this.chatData.members) {
      this.chatData.members = [];
    }

    if (this.chatData && this.chatData?.id) {
      this.chatService.addMember(this.chatData._id, member._id).catch(error => {
        this.utilityService.errorNotification('The member could not be added, please try later!');
        return;
      });
    }

    this.chatData.members.push({
      _user: member,
      joined_on: DateTime.now(),
      is_admin: false
    });

    this.initMembers();
  }

  onAssignedRemoved(event: any) {
    const memberToRemoveId = event.assigneeId;

    if (this.chatData && this.chatData?.id) {
      this.chatService.removeMember(this.chatData._id, memberToRemoveId).catch(error => {
        this.utilityService.errorNotification('The member could not be removed, please try later!');
        return;
      });
    }

    const memberIndex = (this.chatData?.members) ? this.chatData?.members.findIndex(m => m._user._id == memberToRemoveId) : -1;

    if (memberIndex >= 0) {
      this.chatData?.members.splice(memberIndex, 1);
    }

    this.initMembers();
  }
  /*
  getQuillData(quillData: any) {
    this.messageContent = quillData;
  }
  */
  async sendMessage(messageContent: any) {

    if (messageContent && messageContent.message) {
      let _content_mentions = [];
      if(messageContent?.memberMentions) {
        _content_mentions = messageContent.memberMentions;
      }

      const newMessage = {
        _chat: this.chatData?._id,
        posted_on: DateTime.now(),
        _posted_by: this.userData?._id,
        content: messageContent.message, // JSON.stringify(this.messageContent.content),
        _content_mentions: _content_mentions,
        edited: false
      };

      if (!this.chatData?._id) {
        this.onCreateChat(this.chatData, newMessage);

        newMessage._chat = this.chatData?._id;
      } else {
        this.onMessageSent(newMessage);
      }
    }
  }

  /**
   * This function is responsible for calling add post service functions
   * @param chat
   * @param newMessage
   */
  onCreateChat(chat: any, newMessage: any) {

    this.chatService.createChat(JSON.stringify(chat))
      .then(async (res: any) => {
        if(res && res.chat) {
          this.chatData = res.chat;

          this.chatData.members.forEach(async (member, index) => {
            if (!member?._user?._id) {
              this.chatData.members[index]._user = await this.publicFunctions.getOtherUser(member?._user);
            }
          });
        }

        if (res && !res.newChat) {
          await this.loadMessages();
        }

        newMessage._chat = this.chatData?._id;

        this.joinChatSocket();

        this.onMessageSent(newMessage);
      })
      .catch((err) => {
        this.utilityService.errorNotification('Unable to send the message, please try again!');
      });
  }

  private onMessageSent(newMessage: any) {
    this.chatService.sendMessage(newMessage)
      .then(() => {
        this.pushMessage(newMessage);
        this.chatData.last_message_on = DateTime.now();
      })
      .catch((err) => {
        this.utilityService.errorNotification('Unable to send the message, please try again!');
      });
  }

  private unshiftMessages(messages: any) {
    messages.sort((m1, m2) => (this.datesService.isBefore(m1.posted_on, m2.posted_on)) ? 1 : -1)
      .forEach(m => this.messages.unshift(m));
  }

  private pushMessage(newMessage: any) {
    if (!newMessage._posted_by._id) {
      newMessage._posted_by = this.userData;
    }

    const index = (this.messages) ? this.messages.findIndex(m => m._id == newMessage._id) : -1;
    if (index < 0) {
      this.messages.push(newMessage);
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    // this.chatContent.nativeElement.scrollTo(0, 1);
    this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
  }

  loadMoreMessages($event) {

    const elem: HTMLElement = $event.srcElement;

    if (this.isLoading) {
      return;
    }

    if (this.moreMessagesToLoad && elem.scrollTop < 10) {
      this.isLoading = true;

      this.chatService.getMessages(this.chatData._id, this.limitOfMessages, this.lastMessageId, this.lastMessagesPostedOn).then(async res => {
        await this.unshiftMessages(res['messages']);

        if (this.messages.length % this.limitOfMessages != 0) {
          this.moreMessagesToLoad = false;
        }

        this.lastMessageId = this.messages[0]?._id;
        this.lastMessagesPostedOn = this.messages[0]?.posted_on;
        this.isLoading = false;
      });
    }
  }

  private joinChatSocket() {

    this.socket = this.websocketService.serverInit();

    this.socket.onAny((eventName, ...args: any) => {
      if (eventName === 'newChatNotification') {
        if (this.chatData?._id == args[0].chatId) {
          this.pushMessage(args[0].message);
          this.markAsRead(this.chatData?._id);
        }
      }
    });
  }

  markAsRead(chatId: string) {
    if (chatId) {
      this.chatService.markAsRead(chatId).then(res => {
        if (this.objectExists(this.chatData?._group)) {
          const numMessagesRead = this.numUnreadGroupMessages.get(chatId);
          this.numUnreadGroupMessages.set(chatId, 0);
          this.websocketService.updateNumTotalUnreadGroupMessages(this.numUnreadGroupMessages);
          this.websocketService.updateNumTotalUnreadMessages(this.numTotalUnreadMessages - numMessagesRead);
        } else {
          const numMessagesRead = this.numUnreadDirectMessages.get(chatId);
          this.numUnreadDirectMessages.set(chatId, 0);
          this.websocketService.updateNumTotalUnreadDirectMessages(this.numUnreadDirectMessages);
          this.websocketService.updateNumTotalUnreadMessages(this.numTotalUnreadMessages - numMessagesRead);
        }
      });
    }
  }

  openVideoChatDialog() {
    const dialogRef = this.utilityService.openVideoChatDialog(this.chatData, this.canEdit);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.close.subscribe((data) => {
        // this.closeModal();
        console.log("chat closed", data);
      });
      
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }

  formateDate(date) {
    return this.datesService.formateDate(date, "YYYY-MM-DD");
  }

  closeModal() {
    this.chatClosedEvent.emit({ chatData: this.chatData });
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
