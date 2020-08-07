import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-utils',
  templateUrl: './post-utils.component.html',
  styleUrls: ['./post-utils.component.scss']
})
export class PostUtilsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
  ) { }

  // Post Object 
  @Input('post') post: any;

  // User Data Object
  @Input('userData') userData: any;

  @Input() mode: string = 'normal';

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter()

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  openEditPostModal(content: any) {
    return this.utilityService.openModal(content, {
      size: 'xl'
    })
  }

  /**
   * This function is responsible for copying the post link to the clipboard
   */
  copyToClipboard(post: any) {

    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    // Set the Value of element selection box to be the url of the post
    selBox.value = environment.clientUrl + '/#/dashboard/work/groups/' + post._group._id || post._group + '/post/' + post._id;

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
    this.delete.emit(this.post);
  }

  /**
   * This function is responsible for closing the modals
   */
  closeModal(){
    this.utilityService.closeAllModals()
  }

}
