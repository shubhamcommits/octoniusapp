import { Component, OnInit, Input, Output, EventEmitter, Injector, Inject, LOCALE_ID } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-utils',
  templateUrl: './post-utils.component.html',
  styleUrls: ['./post-utils.component.scss']
})
export class PostUtilsComponent implements OnInit {

  // Post Object
  @Input('post') post: any;

  // User Data Object
  @Input('userData') userData: any;

  @Input() mode: string = 'normal';

  @Input() groupData: any;

  @Input() isIdeaModuleAvailable;
  @Input() canEdit = true;

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter();
  @Output() closeModalEvent = new EventEmitter();
  @Output() pinEvent = new EventEmitter();

  groupId = '';

  canDelete = false;

  // Array of user groups
  public userGroups: any = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    public utilityService: UtilityService,
    private injector: Injector,
    private _router: Router,
    private postService: PostService
  ) { }

  async ngOnInit() {

    // Fetch the current workspace data
    const workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.groupId = (this.post._group._id) ? this.post._group._id : this.post._group;

    this.canDelete = await this.utilityService.canUserDoTaskAction(this.post, this.groupData, this.userData, 'delete');

    // Fetches the user groups from the server
    await this.publicFunctions.getAllUserGroups(workspaceData['_id'], this.userData?._id)
      .then(async (groups: any) => {
        await groups.forEach(group => {
          if (group._id != this.groupId) {
            this.userGroups.push(group);
          }
        });
        this.userGroups.sort((g1, g2) => (g1.group_name > g2.group_name) ? 1 : -1);
      })
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@postUtils.unableToConnectToServer:Unable to connect to the server, please try again later!`));
      });
  }

  ngAfterViewInit() {
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(): void {
    const canOpen = !this.groupData?.enabled_rights || this.post?.canView || this.post?.canEdit;
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(this.post._id, this.groupData._id, this.isIdeaModuleAvailable, canOpen);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.closeModalEvent.emit(data);
      });
      const pinEventSubs = dialogRef.componentInstance.pinEvent.subscribe((data) => {
        this.pinEvent.emit(data);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        pinEventSubs.unsubscribe();
      });
    }
  }

  /**
   * This function is responsible for copying the post link to the clipboard
   */
  copyToClipboard() {

    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    const group = (this.groupData._id) ? this.groupData._id : this.groupData;

    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    // Set the Value of element selection box to be the url of the post
    if (this.post.type === 'task') {
      selBox.value = url + '/dashboard/work/groups/tasks?group=' + group + '&myWorkplace=false&postId=' + this.post._id;
    } else {
      selBox.value = url + '/dashboard/work/groups/activity?group=' + group + '&myWorkplace=false&postId=' + this.post._id;
    }
    // Append the element to the DOM
    document.body.appendChild(selBox);

    // Set the focus and Child
    selBox.focus();
    selBox.select();

    // Execute Copy Command
    document.execCommand('copy');

    // Once Copied remove the child from the dom
    document.body.removeChild(selBox);

    // Show Confirmed notification
    this.utilityService.simpleNotification($localize`:@@postUtils.copiedClipboard:Copied to Clipboard!`);
  }

  async pinToTop(pin: boolean) {
    this.postService.pinToTop(this.post._id, pin).then((res) => {
      this.pinEvent.emit(pin);
    }).catch((error) => {
      this.utilityService.errorNotification($localize`:@@postUtils.errorWhilePinPost:Error while pin/unpin the post!`);
    });
  }

  /**
   * This function emits the delete post to the parent components
   */
  deletePost() {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@postUtils.areYouSure:Are you sure?`, $localize`:@@postUtils.byDoingTaskWillBeDeleted:By doing this the task will be deleted!`)
      .then((res) => {
        if (res.value) {
          this.delete.emit(this.post);
        }
      });
  }

  /**
   * This function is responsible for closing the modals
   */
  closeModal(){
    this.utilityService.closeAllModals()
  }

  async copyToGroup(group: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@postUtils.areYouSure:Are you sure?`, $localize`:@@postUtils.byDoingCardWillBeCopied:By doing this the card will be copied to the selected group!`)
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification($localize`:@@postUtils.pleaseWaitWeCopyTask:Please wait while we copy the task...`, new Promise((resolve, reject) => {
            this.postService.transferToGroup(this.post._id, group, '', this.groupId, this.userData._id, true).then((res) => {
              this.onTransferPost({post: res['post'], isCopy: true});
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@postUtils.cardCopied:👍 Card copied!`));
            })
            .catch((error) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@postUtils.errorWhileCopyingPost:Error while copying the post!`));
            });
          }));
        }
      });
  }

  async moveToGroup(group: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@postUtils.areYouSure:Are you sure?`, $localize`:@@postUtils.byDoingCardWillBeMoved:By doing this the card will be moved to the selected group!`)
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification($localize`:@@postUtils.pleaseWaitWeMoveTask:Please wait while we move the card...`, new Promise((resolve, reject) => {
            this.postService.transferToGroup(this.post._id, group._id, '', this.groupId, this.userData._id, false)
              .then((res) => {
                this.onTransferPost({post: res['post'], isCopy: false, groupId: group});
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@postUtils.cardMoved:👍 Card moved!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@postUtils.errorWhileMovingPost:Error while moving the post!`));
              });
          }));
        }
      });
  }

  onTransferPost(data) {

    const post = data.post;
    const isCopy = data.isCopy;

    if (!isCopy) {
      // redirect the user to the post
      const groupId = data.groupId;
      // Set the Value of element selection box to be the url of the post
      if (post.type === 'task') {
        this._router.navigate(['/dashboard', 'work', 'groups', 'tasks'], { queryParams: { group: groupId, myWorkplace: false, postId: post._id } });
      } else {
        this._router.navigate(['/dashboard', 'work', 'groups', 'activity'], { queryParams: { group: groupId, myWorkplace: false, postId: post._id } });
      }
    }
  }

  isGroupManager() {
    return (this.groupData && this.groupData._admins) ? (this.groupData?._admins.findIndex((admin: any) => (admin._id || admin) == this.userData?._id) >= 0) : false;
  }

  /**
   * This function is responsible for opening a dialog to edit permissions
   */
  openPermissionModal(): void {
    const dialogRef = this.utilityService.openPermissionModal(this.post, this.groupData, this.userData, 'post');

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {

      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }
}
