import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PostService} from "../../../../shared/services/post.service";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'post-actions',
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent implements OnInit {

  @Input('post') post;
  @Input('commentsDisplayed') commentsDisplayed;
  // the total amount of comments that this post has
  @Input('commentCount') commentCount;
  @Input('user') user;

  @Output('toggleComments') toggleComments = new EventEmitter();
  @Output('sendComments') sendComments = new EventEmitter();
  @Output('togglePostCommentEditor') togglePostCommentEditor = new EventEmitter();
  @Output('editPost') editPost = new EventEmitter();
  @Output('deletePost') deletePost = new EventEmitter();

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  constructor(private postService: PostService) { }

  ngOnInit() {
  }

  likepost() {

    // TEMPORARY FIX UNTIL TOMORROW 7/2
    const post = {
      post_id: this.post._id
    }


    this.postService.like(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);

        // add our user to the people who liked this post
        this.post._liked_by.push(res['user']);
        this.playAudio();

      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }
      });
  }


  // !-LOADS ALL COMMENTS IN A POST--! //
  loadComments() {
    // if the comments are not displayed we load the comments from the server
    if (!this.commentsDisplayed) {
      this.postService.getComments(this.post._id)
        .subscribe((res) => {
          // send the comments you just fetched to your parent component (the post)
          this.sendComments.emit((res['comments'].reverse()));
          this.toggleComments.emit();
        }, (err) => {
          swal("Error!", "Error while retrieving the comments " + err, "danger");
        });
    } else {
      //  if comments are displayed we close the comments
      this.toggleComments.emit();
    }
  }

  OnClickLikePost() {
    // const like_icon = document.getElementById('icon_like_post_' + index);
    const post = {
      'post_id': this.post._id,
      'user_id': this.user._id,
      '_liked_by': this.post._liked_by
    };

    if (post._liked_by.length === 0) {
      this.likepost();
    } else {
      let userHasLikedPost = false;

      // we check whether the user is one of the likes we already have
      post._liked_by.forEach((like) => {
        if ( like._id === this.user._id ) {
          userHasLikedPost = true;
        }
      });

      // we like the post when the user is not between the users that liked the post
      // and we unlike the post when it is
      if (!userHasLikedPost) {
        this.likepost();
      } else {
        this.unlikepost();
      }
    }
  }

  playAudio() {
    this.postService.playAudio();
  }

  unlikepost () {
    const post = {
      post_id: this.post._id
    }

    this.postService.unlike(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);

        // find the index of the like
        const indexLike = this.post._liked_by.findIndex(user => user._id == this.user.userId);

        // remove the user
        this.post._liked_by.splice(indexLike, 1);
      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }
      });
  }

  userLikedPost() {
    const currentUserId = this.user._id;

    // we look for our user between the likes of the post
    const index = this.post._liked_by.findIndex((user) => user._id === currentUserId);

    // return true if our user was between the likes
    return index > -1;
  }

}
