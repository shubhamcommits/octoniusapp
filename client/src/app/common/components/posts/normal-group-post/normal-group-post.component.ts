import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, AfterViewInit} from '@angular/core';

import {GroupService} from "../../../../shared/services/group.service";
import { saveAs } from 'file-saver';
import {Subject} from "rxjs/Subject";
import {takeUntil} from "rxjs/operators";
import {PostService} from "../../../../shared/services/post.service";
import {FormGroup} from "@angular/forms";
import * as moment from "moment";
import {CommentSectionComponent} from "../../comments/comment-section/comment-section.component";
import {SnotifyService} from "ng-snotify";
import { SearchService } from '../../../../shared/services/search.service';
import { environment } from '../../../../../environments/environment';

declare var $;
@Component({
  selector: 'normal-group-post',
  templateUrl: './normal-group-post.component.html',
  styleUrls: ['./normal-group-post.component.scss']
})
export class NormalGroupPostComponent implements OnInit,AfterViewInit, OnDestroy {


  @ViewChild(CommentSectionComponent) commentSectionComponent;

  @Input() post: any;
  @Input() preview; // true if the post is in preview mode, else false
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Output('deletePost') removePost = new EventEmitter();
  BASE_URL = environment.BASE_URL;

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  // forms
  commentForm: FormGroup;

  // unsubscribe to avoid memory leaks
  ngUnsubscribe = new Subject();


  // Whether we display certain sections
  displayCommentEditor = false;
  displayEditPostSection = false;
  commentsDisplayed = false;

  // the title of post edit
  edit_title = '';

  // the content of edit editor
  edit_content = '';

  // COMMENT DATA
  // the total amount of comments that this post has
  commentCount = 0;
  // the comments we loaded from the server
  comments = [];
  // the comment object for when we're creating a comment
  comment = {
    content: '',
    _commented_by: '',
    _post_id: ''
  };
  content_mentions = [];

  profilePic: any;

  tags: any = new Array();
  tags_search_words: String = ''
  tags_search_result: any = new Array();

  // collapsibility
  // If true, "read more" text should be displayed and the post should be in preview mode
  // If false, "read less" text should be displayed and the post should be displayed entirely
  readMore: boolean;

  constructor(
    private groupService: GroupService,
    private postService: PostService,
    private snotifyService: SnotifyService,
    private searchService: SearchService) { }

  ngOnInit() {
    this.commentCount = this.post.comments.length;

    //saving the app from getting crashed because it might be undefined
    if(this.post['tags'] != undefined){
      this.tags = this.post.tags;
    }
    else{
      this.tags = [];
    }

    if (this.user['profile_pic'] == null) {
      this.profilePic = 'assets/images/user.png';
    } else {
      // console.log('Inside else');
      this.profilePic = `${environment.BASE_URL}/uploads/${this.user['profile_pic']}`;
     }

    this.readMore = this.preview;

  }

  ngAfterViewInit(): void {
    $('.image-gallery').lightGallery({
      share:false,
      counter:false
    });
 }

  applyZoom(htmlDOM): string{
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlDOM, "text/html");
    // image could be multiple so for each here to be used
    var imgTag:any = doc.getElementsByTagName('img');

    for(var _i=0; _i<imgTag.length; _i++){
      let img:any = doc.getElementsByTagName('img')[_i];
      let clonedImg:any=img.cloneNode(true);
      let acnhorThumbnail=document.createElement('a');
      acnhorThumbnail.href=clonedImg.src;
      let imgGallery = document.createElement("div");
      imgGallery.classList.add('image-gallery');
      acnhorThumbnail.appendChild(clonedImg);
      imgGallery.appendChild(acnhorThumbnail);
      img.replaceWith(imgGallery);
    }
  return doc.body.innerHTML;
}


  deletePost() {
    this.removePost.emit(this.post._id);
  }

  onAddNewComment() {

    // comment data
    const commentData = {
      content: this.comment.content,
      _commented_by: this.user_data.user_id,
      post_id: this.post._id,
      contentMentions: this.content_mentions
    };

    // why do we need these two lines?
    this.comment._post_id = this.post._id;
    this.comment._commented_by = this.user_data.user_id;

    // Handle comment mentions
    const scanned_content = commentData.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id'])) {
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
          }
        }
      }

      for (let i = 0; i < this.content_mentions.length; i++) {
        commentData.contentMentions[i] = this.content_mentions[i];
      }
    }

    this.postService.addNewComment(this.post._id, commentData)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any) => {

        // make frontend up to date with backend
        this.comments.push(res.comment);
        this.commentCount++;

        this.resetCommentsDisplay();

        this.playAudio();

        // data for socket
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group.group_name,
          userId: this.user_data.user_id,
          commentId: res['comment']._id,
          groupId: this.group._id, // Pass group id here!!!
          type: 'comment' // this is used to differentiate between posts and comment for emitting notification
        };

        this.socket.emit('newPost', data);
        this.commentForm.reset();
      }, (err) => {

        if (err.status) {
          this.snotifyService.error("Seems like, there's an error found" + err, "Error!");
        } else {
          this.snotifyService.error("Either server is down, or no Internet connection!", "Error!");
        }
      });
  }


  onDownloadFile(fileName) {
    this.groupService.downloadGroupFile(this.group._id, fileName)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((file_toDownload) => {
        saveAs(file_toDownload, fileName);
      }, (err) => {});
  }

  editPost() {

    // set the initial value of the editor
    this.edit_content = this.post.content;
    this.edit_title = this.post.title;

    // show the edit section
    this.displayEditPostSection = true;
  }


  onSaveEditPost() {
    // this is a normal post, so we don't need to assign user & date buttons on the editor

    // set the initial value of the editor
    this.edit_content = this.post.content;

    // show the edit section
    this.displayEditPostSection = true;
  }

  OnSaveEditPost() {

    // NOT NEEDED FOR NORMAL POSTS
    // // we create a new date object based on whether we added time
    // const date_due_to =
    //   this.post.type === 'event' ?
    //     new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day, this.model_time.hour, this.model_time.minute)
    //     : new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    const post = {
      'title': this.edit_title,
      'content': this.edit_content,
      '_content_mentions': this.content_mentions,
      'type': this.post.type,
      'tags': this.tags
      // 'assigned_to': this.selectedGroupUsers
    };

    console.log(post);

    // // for tasks we don't want to transform the time to UTC, for events we do want it
    // post['date_due_to'] = this.post.type === 'event' ? moment.utc(date_due_to).format() : moment(date_due_to).format();

    // // if we edit a task we want to inform about its status
    // if ( this.post.type === 'task') {
    //   post['status'] =  this.post.task.status;
    // }

    // handle mentions
    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        post._content_mentions = this.content_mentions;
      }

      // console.log('Content Mention', post._content_mentions);
      //  console.log('This post', postId);
    }

    if(this.tags.length>0){
      for(let i = 0 ; i < this.tags.length; i ++){
        post.tags = this.tags;
      }
    }

    // SERVER REQUEST
    this.postService.editPost(this.post._id, post)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);

        // we don't want to display the editor after editing
        this.displayEditPostSection = false;
        this.resetEditPostForm();

        // mirror the backend data to keep the user up-to-date
        this.post = res.post;

        // socket notifications
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group._id,
          type: 'post'
        };

        this.socket.emit('newPost', data);
        this.socket.emit('postEdited', data);
        this.content_mentions = [];
        this.tags = this.post.tags;
      }, (err) => {

        this.alert.class = 'danger';
        this.content_mentions = [];
        this.tags = this.post.tags;

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  togglePostCommentEditor() {
    this.commentSectionComponent.displayCommentEditor = !this.commentSectionComponent.displayCommentEditor;
  }

  playAudio() {
    this.postService.playAudio();
  }


  resetCommentsDisplay() {
    this.commentsDisplayed = true;
    //  we should probably add code to hide the editor too
  }


  resetEditPostForm() {
    this.edit_title = '';
    this.edit_content = '';
    this.content_mentions = [];
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addTags(event: any) {
    //keyCode= 13 represents enter key
    // in else case we are making use of mouse click
    if(event.keyCode == 13){
      const tag = document.getElementById('tags');
      this.tags.push(tag['value']);
      this.post.tags = this.tags;
      tag['value'] = '';
      console.log(this.tags);
    }

    if (event.which == '13') {
      event.preventDefault();
    }
  }

  removeTag(index) {
    this.tags.splice(index, 1);
    this.post.tags = this.tags;
  }

  tagListSearch(){
    //console.log("here1")
    if (this.tags_search_words !== '') {
      //console.log("here12")
      this.searchService.getTagsSearchResults(this.tags_search_words)
      .subscribe((res) => {

         if (res) {
          this.tags_search_result = res['results'];
        }
      }, (err)=>{
        console.log('Error while searching', err);
      });
    }else{
      //console.log("here13")
    }
  }
  clickedOnTag(index){
    var tagsFromList = this.tags_search_result[index]["tags"]
    this.tags.push(tagsFromList);;
    this.tags_search_words = '';
    console.log(this.tags);
  }

}
