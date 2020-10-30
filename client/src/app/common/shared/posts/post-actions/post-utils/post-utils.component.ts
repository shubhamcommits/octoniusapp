import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-utils',
  templateUrl: './post-utils.component.html',
  styleUrls: ['./post-utils.component.scss']
})
export class PostUtilsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
    private _router: Router,
    private postService: PostService
  ) { }

  // Post Object
  @Input('post') post: any;

  // User Data Object
  @Input('userData') userData: any;

  @Input() mode: string = 'normal';

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter();

  @Output() closeModalEvent = new EventEmitter();

  // Array of user groups
  public userGroups: any = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch the current workspace data
    const workspaceData = await this.publicFunctions.getCurrentWorkspace();

    const groupId = (this.post._group._id) ? this.post._group._id : this.post._group;

    // Fetches the user groups from the server
    await this.publicFunctions.getUserGroups(workspaceData['_id'], this.userData._id)
      .then(async (groups: any) => {
        await groups.forEach(group => {
          if (group._id != groupId) {
            this.userGroups.push(group);
          }
        });
        this.userGroups.sort((g1, g2) => (g1.group_name > g2.group_name) ? 1 : -1);
      })
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
      });
  }

  ngAfterViewInit() {
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(): void {
    const group = (this.post._group._id) ? this.post._group._id : this.post._group;
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(this.post, this.userData, group);

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.closeModalEvent.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
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

    const group = (this.post._group._id) ? this.post._group._id : this.post._group;

    // Set the Value of element selection box to be the url of the post
    if (this.post.type === 'task') {
      //selBox.value = environment.clientUrl + '/#/dashboard/work/groups/post/' + this.post._id + '?group=' + group;
      selBox.value = environment.clientUrl + '/#/dashboard/work/groups/tasks?group=' + group + '&myWorkplace=false&postId=' + this.post._id;
    } else {
      selBox.value = environment.clientUrl + '/#/dashboard/work/groups/activity?group=' + group + '&myWorkplace=false&postId=' + this.post._id;
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
    this.utilityService.simpleNotification(`Copied to Clipboard!`, '', {
      timeout: 500,
      showProgressBar: false,
      backdrop: 0.5
    })
  }

  /**
   * This function emits the delete post to the parent components
   */
  deletePost() {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will be deleted!')
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
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the card will be copied to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait while we copy the card...', new Promise((resolve, reject) => {
            let post = this.post;
            delete post.bars;
            delete post.records;
            delete post.comments;
            delete post.comments_count;
            post._group = group._id;
            post.created_date = moment().local().startOf('day').format('YYYY-MM-DD');

            this.postService.transferToGroup(post, true).then((res) => {
              this.onTransferPost({post: res['post'], isCopy: true, groupId: group._id});
              resolve(this.utilityService.resolveAsyncPromise(`👍 Card copied!`));
            });
          }));
        }
      });
  }

  async moveToGroup(group: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the card will be moved to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait while we move the card...', new Promise((resolve, reject) => {
            let post = this.post;
            delete post.bars;
            delete post.comments;
            delete post.comments_count;
            post._group = group._id;

            this.postService.transferToGroup(post, false).then((res) => {
              this.onTransferPost({post: res['post'], isCopy: false, groupId: group._id});
              resolve(this.utilityService.resolveAsyncPromise(`👍 Card moved!`));
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
}
