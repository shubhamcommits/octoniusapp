
import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from 'src/shared/services/chat-service/chat.service';

@Component({
  selector: 'app-video-chat',
  template: ''
})
export class VideoChatComponent implements OnInit {

  chatId;
  chatData;

  canEdit = false;

  userData;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private utilityService: UtilityService,
    private chatService: ChatService,
    private _Injector: Injector,
    private activatedRoute: ActivatedRoute,
    public router: Router
  ) { }

  async ngOnInit() {
    this.chatId = this.activatedRoute.snapshot.paramMap.get('chat');

    this.userData = await this.publicFunctions.getCurrentUser();
    
    const invite = !this.objectExists(this.userData);
    await this.chatService.getChatDetails(this.chatId, invite).then(res => {
      this.chatData = res['chat'];
    });

    if (this.objectExists(this.userData)) {
      const adminIndex = (this.chatData.members) ? this.chatData.members.findIndex(member => member?._user?._id == this.userData?._id && member?.is_admin) : -1;
      this.canEdit = adminIndex >= 0 && !this.objectExists(this.chatData?._group);
    }

    this.openVideoChatDialog();
  }

  openVideoChatDialog() {
    const dialogRef = this.utilityService.openVideoChatDialog(this.chatData, this.canEdit);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.close.subscribe((data) => {
        this.router.navigate(['']);
      });
      
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
