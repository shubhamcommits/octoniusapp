import { Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentSectionComponent } from '../../../../../common/components/comments/comment-section/comment-section.component';
import { PostService } from '../../../../../shared/services/post.service';

@Component({
  selector: 'app-group-kanban-task-view',
  templateUrl: './group-kanban-task-view.component.html',
  styleUrls: ['./group-kanban-task-view.component.scss']
})
export class GroupKanbanTaskViewComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public postService: PostService) { }

  @Input('task') task: any;
  @Input('columns') columns: any;
  @Input('allMembersId') allMembersId: any;
  @Input('groupData') groupData: any;
  @Input('socket') socket: any;
  @Output() closeModal = new EventEmitter();
  @ViewChild(CommentSectionComponent, { static: true }) commentSectionComponent;

  user = JSON.parse(localStorage.getItem('user_data'));
  user_data = JSON.parse(localStorage.getItem('user'));

  // whether we display certain sections of template
  commentsDisplayed = false;
  displayCommentEditor = false;
  displayEditPostSection = false;

  // the total amount of comments that this post has
  commentCount = 0;

  // collection of loaded comments
  comments = [];

  ngOnInit() {
  }

  sendCloseModalMessage() {
    this.closeModal.emit("close");
  }

  async changeStatus(post, status){
    const object = {
      status: status
    }
    return new Promise((resolve)=>{
      this.postService.complete(post._id, object)
      .subscribe((res)=>{
        post.task.status = status;
        resolve();
      })
    })
  }

  setComments(comments) {
    this.comments = comments;
  }

  toggleComments() {
    this.commentsDisplayed = !this.commentsDisplayed;

    if (!this.commentsDisplayed) {
      this.comments = [];
    }
  }

  editPost() {
    // show the edit section
    this.displayEditPostSection = true;
  }

  deletePost() {
  }

  togglePostCommentEditor() {
    this.commentSectionComponent.displayCommentEditor = !this.commentSectionComponent.displayCommentEditor;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // this.modalService.dismissAll();
  }

}
