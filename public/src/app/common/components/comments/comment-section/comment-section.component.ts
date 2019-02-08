import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {InputValidators} from "../../../validators/input.validator";
import {PostService} from "../../../../shared/services/post.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'comments-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnDestroy {

  @Input() post;
  @Input() commentsDisplayed;
  // two way bind the editor
  @Input() modules;
  @Input() user;
  @Input() allMembersId;
  @Input() user_data;
  @Input() socket;
  @Input() group;
  @Input() comments = [];
  // comment count is the total amount of comments that this post has
  @Input() commentCount;
  // when we add or delete a comment we want to change the total amount of comments this post has
  @Output() commentCountChange = new EventEmitter();

  commentForm: FormGroup;

  // Quill editor
  editor;
  editorTextLength;
  displayCommentEditor = false;

  // mentions
  content_mentions = [];

  // create new comment
  comment_content = '';
  comment_post_id;
  comment_commented_by;

  // unsubscribe to avoid memory leaks
  ngUnsubscribe = new Subject();

  constructor(private postService: PostService) { }

  ngOnInit() {
    this.initializeCommentForm();
  }

  deleteComment(commentId) {
    const index = this.comments.findIndex((comment) => commentId == comment._id);
    this.comments.splice(index, 1);

  // subtract one from the total amount of comments this post has
    this.commentCountChange.emit(this.commentCount - 1);
  }

  initializeCommentForm() {
    this.commentForm = new FormGroup({
      'commentContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }

  loadPreviousComments() {
    // the most recent comment that we display
    const firstComment = this.comments[0]._id;

    this.postService.getNextComments(this.post._id, firstComment)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        // add the new comments to the front of the already displayed comments
        this.comments = [...res['comments'].reverse(), ...this.comments];
      });
  }


  onAddNewComment() {
    // console.log('post._id: ', post_id);

    // comment data
    const commentContent = {
      content: this.comment_content,
      _commented_by: this.user._id,
      post_id: this.post._id,
      contentMentions: this.content_mentions
    };

    // not sure where we need this, but I'll leave it for now
    this.comment_post_id = this.post._id;
    this.comment_commented_by = this.user._id;
    // const cardTaskPost = document.getElementById('card-task-post-comment-' + index);
    // const cardNormalPost = document.getElementById('card-normal-post-comment-' + index);
    // const cardEventPost = document.getElementById('card-event-post-comment-' + index);

    // handle mentions
    const scanned_content = commentContent.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          for (let i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
          this.content_mentions = [...this.content_mentions,...this.allMembersId];
        }
        else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      // this functions works, but is inefficient, change it
      for (let i = 0; i < this.content_mentions.length; i++) {
        commentContent.contentMentions[i] = this.content_mentions[i];
      }
    }

    this.postService.addNewComment(this.post._id, commentContent)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any) => {

        // WE MIGHT RECONSIDER THE DISPLAY STATUS
        // make frontend up to date with backend
        // const indexPost = this.posts.findIndex(_post => _post._id === post_id);
        // this.posts[indexPost].comments.push(res.comment);
        // this.posts[indexPost].commentCount++;

        // reset the comment section
        this.commentsDisplayed = false;
        this.comments = [];

        this.playAudio();

        // data for socket
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group. group_name,
          userId: this.user_data.user_id,
          commentId: res['comment']._id,
          groupId: this.group._id, // Pass group id here!!!
          type: 'comment' // this is used to differentiate between posts and comment for emitting notification
        };

        this.socket.emit('newPost', data);
        this.commentForm.reset();
        this.commentCountChange.emit(this.commentCount + 1);
        this.displayCommentEditor = false;
      }, (err) => {

        if (err.status) {
          swal("Error!", "Seems like, there's an error found " + err, "danger");

        } else {
          swal("Error!", "Either server is down, or no Internet connection!", "danger");
        }

      });
  }

  onContentChanged(quill) {
    this.editorTextLength = quill.text.length;
  }

  onEditorCreated(quill) {
    this.editor = quill;
  }

  playAudio() {
    this.postService.playAudio();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
