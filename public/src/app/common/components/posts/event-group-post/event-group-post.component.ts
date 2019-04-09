import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from "rxjs/Subject";
import * as moment from "moment";
import {takeUntil} from "rxjs/operators";
import {PostService} from "../../../../shared/services/post.service";
import { saveAs } from 'file-saver';
import {GroupService} from "../../../../shared/services/group.service";
import {CommentSectionComponent} from "../../comments/comment-section/comment-section.component";
declare var $;

@Component({
  selector: 'event-group-post',
  templateUrl: './event-group-post.component.html',
  styleUrls: ['./event-group-post.component.scss']
})

export class EventGroupPostComponent implements OnInit, OnDestroy {
  @ViewChild(CommentSectionComponent) commentSectionComponent;

  @Input() post;
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Input('isItMyWorkplace') isItMyWorkplace;

  @Output('deletePost') removePost = new EventEmitter();

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  // whether we display certain sections of template
  commentsDisplayed = false;
  displayCommentEditor = false;
  displayEditPostSection = false;

  // the total amount of comments that this post has
  commentCount = 0;

  // collection of loaded comments
  comments = [];

  // edit post
  edit_title = '';
  edit_content = '';
  selectedGroupUsers = [];
  assignment = 'Unassigned';
  model_date;
  model_time;

  // editor
  editor;

  // mentions
  content_mentions = [];

  ngUnsubscribe = new Subject();

  tags: any = new Array();

  constructor(private postService: PostService, private groupService: GroupService) { }

  ngOnInit() {
    this.commentCount = this.post.comments.length;

        //saving the app from getting crashed because it might be undefined
        if(this.post['tags'] != undefined){
          this.tags = this.post.tags;
        }
        else{
          this.tags = [];
        }
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
    // var imgCount = doc.getElementsByTagName('img').length;
    var img:any = doc.getElementsByTagName('img')[0];

  if(img){ //if any image exists
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

  editPost() {
    // set the values for the modal so that they display the current values of the post
    const dateObj = moment(this.post.event.due_to).local();
    this.model_date = {year: dateObj.year(), month: dateObj.month(), day: dateObj.date()};
    this.model_time = {hour: dateObj.hour(), minute: dateObj.minutes()};
    this.selectedGroupUsers = this.post.event._assigned_to;
    this.assignment = 'Assigned';

    // set the initial value of the editor
    this.edit_title = this.post.title;
    this.edit_content = this.post.content;

    // show the edit section
    this.displayEditPostSection = true;
  }

  // this function can become a shared one on a service;
  OnSaveEditPost() {

    // we create a new date object
    const date_due_to = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day, this.model_time.hour, this.model_time.minute);

    const post = {
      'title': this.edit_title,
      'content': this.edit_content,
      '_content_mentions': this.content_mentions,
      'type': this.post.type,
      'assigned_to': this.selectedGroupUsers,
      'date_due_to': moment(date_due_to).format(),
      'tags': this.tags
    };

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

  onDownloadFile(fileName) {
    this.groupService.downloadGroupFile(this.group._id, fileName)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((file_toDownload) => {
        saveAs(file_toDownload, fileName);
      }, (err) => {});
  }

  openAssignPicker() {
    // open the assign users modal
    this.postService.openAssignUsers.next(
      {
        options: {centered: true},
        selectedGroupUsers: this.selectedGroupUsers,
        group: this.group,
        // these are the setting for picking a user, later we might want to add this in
        // the modal component itself and link it to post.type
        settings: {
          text: 'Select Group Members',
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          classes: 'myclass custom-class',
          primaryKey: '_id',
          labelKey: 'full_name',
          noDataLabel: 'Search Members...',
          enableSearchFilter: true,
          searchBy: ['full_name', 'capital']
        }
      });

    // when the user completed adding users then we receive the result here
    this.postService.usersAssigned.subscribe((data: any) => {
      this.selectedGroupUsers = data.selectedGroupUsers || [];
      this.assignment = data.assignment || 'Unassigned';
    });
  }

  openTimePicker() {
    // trigger the timepicker modal to open
    this.postService.openTimePicker.next({
      options: {centered: true},
      model_time: this.model_time
    });

    //   when the time is picked we receive the result here.
    this.postService.timePicked
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe( model_time => {
        this.model_time = model_time;
      });
  }


  resetEditPostForm() {
    this.model_date = null;
    this.model_time = null;
    this.edit_title = '';
    this.edit_content = '';
    this.content_mentions = [];
    this.selectedGroupUsers = [];
  }

  setDate(pickedDate) {
    this.model_date = pickedDate;
  }

  setComments(comments) {
    this.comments = comments;
  }

  setTime(pickedTime) {
    this.model_time = pickedTime;
  }

  toggleComments() {
    this.commentsDisplayed = !this.commentsDisplayed;

    if (!this.commentsDisplayed) {
      this.comments = [];
    }
  }

  togglePostCommentEditor() {
    this.commentSectionComponent.displayCommentEditor = !this.commentSectionComponent.displayCommentEditor;
  }

  usersSelected(users) {
    this.selectedGroupUsers = users;
    this.assignment = users.length < 1 ? "Unassigned" : "Assigned";
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
    console.log(this.tags);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
