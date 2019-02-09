import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {PostService} from "../../../../shared/services/post.service";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {
  @ViewChild('commentEditList') commentEditList;

  @Input('comment') comment;
  @Input('allMembersId') allMembersId;
  @Input('user') user;

  @Output('sendDeletedComment') sendDeletedComment = new EventEmitter();

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  comment_content = '';

  content_mentions = [];

  editor;

  // whether we display the comment edit editor or not
  displayCommentEditor = false;



  constructor(private postService: PostService) { }

  ngOnInit() {

  }

  likeComment(comment) {
    this.postService.likeComment(comment)
      .subscribe((res) => {
        // add the current user to the people who liked the comment
        this.comment._liked_by.push(res['user']);
      });
  }

  onClickLikeComment() {

    if (this.comment._liked_by.length === 0) {
      this.likeComment(this.comment);
    } else {
      let userHasLikedComment = false;

      this.comment._liked_by.forEach((like) => {
        // we check whether the user already is present in the array of users who liked the comment
        if (like._id == this.user._id) {
          userHasLikedComment = true;
        }
      });

      // we like the comment when the user is not between the users that liked the comment.
      // and we unlike the post when it is
      if (!userHasLikedComment) {
        this.likeComment(this.comment);
      } else {
        this.unlikeComment(this.comment);
      }
    }
  }

  OnEditComment() {
    // set comment content before editing it
    this.comment_content = this.comment.content;
    // for some reason this list does not close automatically when we click so we do it this way
    this.commentEditList.nativeElement.style.display = 'none';

    this.displayCommentEditor = true;
  }

  OnSaveEditComment() {

    const commentData = {
      content: this.comment_content,
      contentMentions: this.content_mentions
    };

    const scanned_content = commentData.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }
      for (let i = 0; i < this.content_mentions.length; i++) {
        commentData.contentMentions = this.content_mentions;
      }
    }

    this.postService.updateComment(this.comment._id, commentData)
      .subscribe((res) => {
        this.comment = res['comment'];
        this.content_mentions = [];
        this.displayCommentEditor = false;
      }, (err) => {
        this.content_mentions = [];
        this.displayCommentEditor = false;
        console.log('Error while updating the comment', err);
        swal("Error!", "Error while updating the comment " + err, "danger");
      });
  }

  onEditorCreated(quill) {
    this.editor = quill;
  }

  OnDeleteComment() {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      dangerMode: true,
      buttons: ["Cancel", "Yes, delete it!"],

    })
      .then(willDelete => {
        if (willDelete) {
          this.postService.deleteComment(this.comment._id)
            .subscribe((res: any) => {
              this.alert.class = 'success';
              this._message.next(res['message']);
              // this.resetNewPostForm();

              // make frontend up to date with backend
              // try this.comment = null;
              this.sendDeletedComment.emit(this.comment._id);
            }, (err) => {

              if (err.status) {
                swal("Error!", "Seems like, there's an error found " + err, "danger");

              } else {
                swal("Error!", "Either server is down, or no Internet connection!", "danger");
              }

            });
          swal("Deleted!", "The following post has been deleted!", "success");
        }
      });
  }

  toggleCommentEditList() {
    this.commentEditList.nativeElement.style.display =
      this.commentEditList.nativeElement.style.display === 'block' ? 'none' : 'block';
  }

  unlikeComment(comment) {
    this.postService.unlikeComment(comment)
      .subscribe((res) => {
        // find the index of the user in the array of users who liked the comment
        const indexUser = this.comment._liked_by.findIndex((user) => user._id == this.user._id);
        // remove the user from the list of users who liked this comment
        this.comment._liked_by.splice(indexUser, 1);
      });
  }



  userLikedComment() {
    const index = this.comment._liked_by.findIndex((like) => like._id == this.user._id);
    return index > -1;
  }
}

