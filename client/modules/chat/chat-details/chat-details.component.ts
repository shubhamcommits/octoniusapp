import { Component, OnInit, Injector, ViewChild, OnDestroy, ElementRef, Input, EventEmitter, Output, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.scss']
})
export class ChatDetailsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() userData;
  @Input() workspaceData;
  @Input() chatData;

  // @ViewChild('chatContent') chatContent: IonContent;
  // @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
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

  // Subsink Object
  subSink = new SubSink();

  socket;

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
      private changeDetectorRef: ChangeDetectorRef,
      private injector: Injector,
      private utilityService: UtilityService,
      private chatService: ChatService,
      private websocketService: SocketService
      ) {

    // this.joinChatSocket();
    // this.subSink.add(this.enableNewMessageNotificationsSocket());
  }

  ngOnInit() {
    this.initChat();
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.initChat();
  }

  async initChat() {
    // this.userData = this.navParams.get('userData');
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    // this.workspaceData = this.navParams.get('workspaceData');
    if (!this.workspaceData) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    if (!this.utilityService.objectExists(this.chatData)) {
      this.chatData = {
        members: [
          {
            _user: this.userData,
            joined_on: moment(),
            is_admin: true
          }],
        messages: []
      };
    }

    if (this.chatData._id) {
      await this.loadMessages();
    }

    await this.initMembers();

    const adminIndex = (this.chatData.members) ? this.chatData.members.findIndex(member => member?._user?._id == this.userData?._id && member?.is_admin) : -1;
    this.canEdit = adminIndex >= 0 && !this.utilityService.objectExists(this.chatData?._group);
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
    this.leaveChatSocket();
    this.subSink.unsubscribe();
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
    if (!this.utilityService.objectExists(this.chatData?._group)) {
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
      joined_on: moment(),
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
      if(messageContent?.memberMentions){
        _content_mentions = messageContent.memberMentions;
      }

      const newMessage = {
        _chat: this.chatData?._id,
        posted_on: moment(),
        _posted_by: this.userData?._id,
        content: messageContent.message, // JSON.stringify(this.messageContent.contents),
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
      .then(() => this.pushMessage(newMessage))
      .catch((err) => {
        this.utilityService.errorNotification('Unable to send the message, please try again!');
      });
  }

  private unshiftMessages(messages: any) {
    messages.sort((m1, m2) => (moment.utc(m1.posted_on).isBefore(m2.posted_on)) ? 1 : -1)
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

        // this.infiniteScroll.complete();

        if (this.messages.length % this.limitOfMessages != 0) {
          this.moreMessagesToLoad = false;
        }

        this.lastMessageId = this.messages[0]?._id;
        this.lastMessagesPostedOn = this.messages[0]?.posted_on;
        this.isLoading = false;
      });
    }

    // this.infiniteScroll.complete();
  }

  // onScroll($event) {

  //   if (this.pages === 5) { return; }

  //   const elem: HTMLElement = $event.srcElement;

  //   if (elem.scrollTop < 1) { elem.scrollTo(0, 1); }

  //   if (elem.scrollTop < 50) {
  //     this.isLoading = true;
  //     this.addChats(50).then(() => {
  //       this.isLoading = false;
  //     });
  //   }
  // }

  private joinChatSocket() {

    if (!this.socket){
      this.socket = this.websocketService.serverInit();
    }

    this.socket.on('connect', () => {
console.log('join-chat');
      // Connected, let's sign-up for to receive messages for this room
      this.socket.emit('join-chat', this.chatData?._id);
    });

    this.socket.on('connectToRoom', (data)=>{
      console.log('connected to room', data);
    });

    this.socket.on('newMessage', (data) => {
console.log('newMessage:', data);
      this.pushMessage(data);
    });

    this.socket.onAny((eventName, ...args) => {
     console.log('socket fired on any', eventName);
    });
  }

  private leaveChatSocket() {
console.log("leave-chat");
    if (this.socket) {
      this.socket.emit('leave-chat', this.chatData?._id);
    }
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }

  closeModal() {
    this.chatClosedEvent.emit({ chatData: this.chatData });
  }
}
