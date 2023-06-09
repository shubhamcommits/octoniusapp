import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material Module
import { MaterialModule } from 'src/app/common/material-module/material-module.module';
import { ChatsHomeComponent } from './chats-home/chats-home.component';
import { DirectChatsHomeComponent } from './chats-home/direct-chats-home/direct-chats-home.component';
import { GroupChatsHomeComponent } from './chats-home/group-chats-home/group-chats-home.component';
import { ChatAvatarComponent } from './components/chat-avatar/chat-avatar.component';
import { ChatInputComponent } from './components/chat-input/chat-input.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { ChatNotificationIconComponent } from './components/chat-notification-icon/chat-notification-icon.component';
import { ChatTitleComponent } from './components/chat-title/chat-title.component';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ChatDetailsComponent } from './chat-details/chat-details.component';
import { FormsModule } from '@angular/forms';
import { VideoCallDialog } from './components/video-call-dialog/video-call-dialog.component';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import { RemoteVideoComponent } from './components/remote-video/remote-video.component';

@NgModule({
  declarations: [
    ChatsHomeComponent,
    DirectChatsHomeComponent,
    GroupChatsHomeComponent,
    ChatDetailsComponent,
    ChatAvatarComponent,
    ChatInputComponent,
    ChatMessageComponent,
    ChatNotificationIconComponent,
    ChatTitleComponent,
    VideoChatComponent,
    VideoCallDialog,
    RemoteVideoComponent
  ],
  imports: [
    ChatRoutingModule,
    CommonModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    // RouterModule
  ],
  exports: [
    ChatsHomeComponent,
    DirectChatsHomeComponent,
    GroupChatsHomeComponent,
    ChatDetailsComponent,
    ChatAvatarComponent,
    ChatInputComponent,
    ChatMessageComponent,
    ChatNotificationIconComponent,
    ChatTitleComponent,
    VideoChatComponent,
    VideoCallDialog,
    RemoteVideoComponent
  ],
  providers: [ ]
})
export class ChatModule { }
