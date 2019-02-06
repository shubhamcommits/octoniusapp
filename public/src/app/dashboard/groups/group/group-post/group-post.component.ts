import {Component, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import { PostService } from '../../../../shared/services/post.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { environment } from '../../../../../environments/environment';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

declare var gapi: any;
declare var google: any;
import * as io from 'socket.io-client';

import * as Quill from 'quill';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss'],
  providers: [NgbPopoverConfig, NgbDropdownConfig]
})
export class GroupPostComponent implements OnInit {

  user_data;

  user: any;
  profileImage: any;

  post;
  postId;

  socket = io(environment.BASE_URL);
  group_name;

  showComments = {
    id: '',
    normal: false,
    event: false,
    task: false
  };
  comment = {
    content: '',
    _commented_by: '',
    post_id: '',
    _content_mentions: []
  };
  commentForm;
  commentCount: number;

  group_id;

  BASE_URL = environment.BASE_URL;

  comments = [];

  allMembersId = [];

  members = [];

  files = [];

  content_mentions = [];

  selectedGroupUsers = [];

  groupUsersList: any =[];

  settings = {};

  getPostLikedBy: any = new Array();

  model_date;
  model_time = { hour: 13, minute: 30 };
  assignment = 'Unassigned';

  datePickedCount = 0;
  timePickedCount = 0;

  modules = {};

  @ViewChild('commentEditor') commentEditor;


  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //
  developerKey = 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I';

  clientId = "971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com";

  scope = [
    'https://www.googleapis.com/auth/drive'//insert scope here
  ].join(' ');

  pickerApiLoaded = false;

  oauthToken?: any;
  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //


  constructor(private ngxService: NgxUiLoaderService, private postService: PostService,
    private groupService: GroupService, private _activatedRoute: ActivatedRoute, private _userService: UserService,
    public groupDataService: GroupDataService ,private quillInitializeService: QuillAutoLinkService, private modalService: NgbModal
    , private _router: Router) {
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.group_id = this._activatedRoute.snapshot['_urlSegment']['segments'][2].path;


    //this.ngOnInit();
   }

  ngOnInit() {
    this._router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
  };

  this._router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
          this._router.navigated = false;
          window.scrollTo(0, 0);
      }
  });
  this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.getUserProfile();
    this.getPost(this.postId);
    this.mentionmembers();
    this.inilizeCommentForm();
    this.initializeGroupMembersSearchForm();

   // console.log('Post ID', this.postId);
   // console.log('Group ID', this.group_id);
  }

  getPost(postId) {
    this.postService.getPost(postId)
        .subscribe((res) => {
          console.log('Post', res['post']);
          this.post = res['post'];
          // we set the original comment count
          this.commentCount = res['post'].comments.length;
          this.comments = res['post'].comments;


        }, (err)=>{
          swal("Error!", "Error received while fetching the post " + err, "danger");
        });

  }

  loadGroup() {
    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        //  console.log('Group: ', res);
        this.group_name = res['group'].group_name;


      }, (err) => {



      });

  }

  initializeGroupMembersSearchForm() {
    this.settings = {
      text: 'Select Group Members',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: 'myclass custom-class',
      primaryKey: '_id',
      labelKey: 'full_name',
      noDataLabel: 'Search Members...',
      enableSearchFilter: true,
      searchBy: ['full_name', 'capital']
    };
  }

  inilizeCommentForm() {
    this.commentForm = new FormGroup({
      'commentContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }

  OnEditPost(post){
    if (this.post.type === 'task' || this.post.type === 'event') {
      const editor_div = document.getElementById('button_edit_post');
      const editor = document.getElementById('edit-content');
      editor_div.style.display = 'block';
      editor.style.display = 'block';
      this.assignment = "Unassigned";
    }
  }

  OnSaveEditPost(postId, postContent, postType){

    const post = {
      'content': this.post.content,
      '_content_mentions': this.content_mentions,
      'type': postType,
      'assigned_to': this.selectedGroupUsers
    };

    const date_due_to = postType === 'event'
      ? new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day, this.model_time.hour, this.model_time.minute)
      : new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    if(this.post.type === 'task' || this.post.type === 'event'){
      const editor_div = document.getElementById('button_edit_post');
      const editor = document.getElementById('edit-content');
      editor_div.style.display = 'none';
      editor.style.display = 'none';
    }

        // for tasks we don't want to transform the time to UTC, for events we do want it
        post['date_due_to'] = postType === 'event' ? moment.utc(date_due_to).format() : moment(date_due_to).format();

        // if we edit a task we want to inform about its status
        if ( postType === 'task') {
          const edittedPost = this.post;
          post['status'] =  edittedPost.task.status;
        }

    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
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


        this.postService.editPost(postId, post)
        .subscribe((res) => {

          this.post = res['post'];

          // socket notifications
          const data = {
            // it should get automatically, something like workspace: this.workspace_name
            workspace: this.user_data.workspace.workspace_name,
            // it should get automatically, something like group: this.group_name
            group: this.group_name,
            userId: this.user_data.user_id,
            postId: res['post']._id,
            groupId: this.group_id,
            type: 'post'
          };

          this.socket.emit('newPost', data);
          this.content_mentions = [];
          this.assignment = 'UnAssigned';
          //this.ngOnInit();

        }, (err) => {


        });
  }

  onSearch(evt: any) {
    this.groupUsersList = [];
    this.groupService.searchGroupUsers(this.group_id, evt.target.value)
      .subscribe((res) => {
        //console.log(evt.target.value);
        this.groupUsersList = res['users'];

      }, (err) => {

      });

  }

  onItemSelect(item: any) {
    if (this.selectedGroupUsers.length >= 1) {
      this.assignment = 'Assigned';
    }
  }
  OnItemDeSelect(item: any) {
    if (this.selectedGroupUsers.length < 1) {
      this.assignment = 'UnAssigned';
    }

  }
  onSelectAll(items: any) {
    this.assignment = 'Assigned';
  }
  onDeSelectAll(items: any) {
    this.assignment = 'UnAssigned';

  }

  openTimePicker(content) {
    this.modalService.open(content, { centered: true });
    this.timePickedCount;
  }

  openDatePicker(content) {
    this.modalService.open(content, { centered: true });
    this.datePickedCount = 1;
  }

  openAssignPicker(content, post) {
    this.modalService.open(content, { centered: true });

    if (post && post.type === 'task') {
      this.selectedGroupUsers = [post.task._assigned_to];
    } else if (post && post.type === 'event') {
      this.selectedGroupUsers = post.event._assigned_to.map((item, i) => {
        return item;
      });
    }
  }

  onAddNewComment(post_id) {
   const comment = {
     "content": this.comment.content,
     "_commented_by": this.user_data.user_id,
     "post_id": post_id,
     "contentMentions": this.content_mentions
   };

   const formData = new FormData();
   formData.append('content', comment.content);
   formData.append('_commented_by', comment._commented_by);
   formData.append('post_id', comment.post_id);
   const scanned_content = comment.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          for (let i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (let i = 0; i < this.content_mentions.length; i++) {
        comment.contentMentions[i] = this.content_mentions[i];
        formData.append('contentMentions', this.content_mentions[i]);
      }
    }



   this.postService.addNewComment(post_id, formData)
   .subscribe((res) => {

     const data = {
      // it should get automatically, something like workspace: this.workspace_name
      workspace: this.user_data.workspace.workspace_name,
      // it should get automatically, something like group: this.group_name
      group: this.group_name,
      userId: this.user_data.user_id,
      commentId: res['comment']._id,
      groupId: this.groupDataService.group._id,
       type: 'comment' // this is used to differentiate between posts and comment for emitting notification
    };

    this.socket.emit('newPost', data);
     this.commentCount++;

      this.comments.push(res['comment']);
     // this.loadComments(post_id);
   }, (err)=>{
    swal("Error!", "Error received adding comment to the post " + err, "danger");
   });

   this.comment.content = '';
   this.comment.post_id = '';
   this.comment._content_mentions = [];
   this.comment._commented_by = '';

   this.showComments.id = this.post._id;
   this.showComments.event = !this.showComments.event;
   this.showComments.task = !this.showComments.task;
   this.showComments.normal = !this.showComments.normal;
  }

  OnMarkEventCompleted() {

    const button = document.getElementById("button_event_mark_completed");

    const post = {
      'post_id': this.postId,
      'user_id': this.user_data.user_id
    };
    this.postService.complete(this.postId, post)
    .subscribe((res) => {
      this.playAudio();

      button.style.background="#005fd5";
      button.style.color="#ffffff";
      button.innerHTML="Completed";
      button.setAttribute('disabled', 'true');
      this.getPost(this.postId);

    }, (err) => {

      swal("Error!", "Error received while completing the Event post " + err, "danger");

    });

  }

  OnMarkTaskToDo(post_id){
    const post = {
      'status': 'to do'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      this.playAudio();
      this.getPost(this.postId);
      swal("Good Job!", "The status of task has been updated sucessfully!", "success");


    }, (err) => {
      swal("Error!", "Error received while updating the task as to-do " + err, "danger");

    });

  }

  OnMarkTaskInProgress(post_id){
    const post = {
      'status': 'in progress'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      this.playAudio();
      this.getPost(this.postId);
      swal("Good Job!", "The status of task has been updated sucessfully!", "success");
    }, (err) => {
      swal("Error!", "Error received while updating the task as marked in progress " + err, "danger");
    });

  }


    OnMarkTaskCompleted(post_id){
      const post = {
        'status': 'done'
       // 'user_id': this.user_data.user_id
      };
      this.postService.complete(post_id,post)
      .subscribe((res) => {

        this.playAudio();

        this.getPost(this.postId);

        swal("Good Job!", "The status of task has been updated sucessfully!", "success");

      }, (err) => {

        console.log('Error:', err);
        swal("Error!", "Error received while completing the task post " + err, "danger");

      });
    }



  // !-PLAY THE AUDIO--! //
  playAudio(){
    let audio = new Audio();
    audio.src = "/assets/audio/intuition.ogg";
    audio.load();
    audio.play();
  }
  // !-PLAY THE AUDIO--! //



  // !-LIKE A POST--! //
  likepost() {

    if
    (this.post._liked_by.length == 0){
      const post = {
        'post_id': this.postId,
        'user_id': this.user_data.user_id
      };

      this.postService.like(post)
      .subscribe((res) => {
     //   console.log('Post Liked!');
        this.post._liked_by.push(res['user']);
        this.playAudio();
      }, (err) => {
        swal("Error!", "Error received while liking the Post " + err, "danger");
      });
    }

    else{
      if(this.userLikedPost()){
        this.unlikepost();
      }
      else
      {
        const post =
        {
          'post_id': this.postId,
          'user_id': this.user_data.user_id
        };

        this.postService.like(post)
        .subscribe((res) => {
            this.post._liked_by.push(res['user']);
       //    this.getPost(this.postId);
        }, (err) => {
          swal("Error!", "Error received while liking the Post " + err, "danger");
        });
      }
    }
  }
  // !-LIKE A POST--! //



  // !-UNLIKE A POST--! //
  unlikepost(){
    const post = {
      'post_id': this.postId,
      'user_id': this.user_data.user_id
    };

    this.postService.unlike(post)
    .subscribe((res) => {
  //    remove the like from the list
  const indexLike = this.post._liked_by.findIndex((like) => like == this.user_data.user_id);
  this.post._liked_by.splice(indexLike, 1);
   //    this.getPost(this.postId);
    }, (err) => {
      swal("Error!", "Error received while Unliking the Post " + err, "danger");
    });
  }
  // !-UNLIKE A POST--! //



    // !-LOADS ALL COMMENTS IN A POST--! //
    loadComments(postId) {

      let commentData = [];

      this.postService.getComments(postId)
        .subscribe((res) => {
          this.comments = res['comments'];
          // show latest posts at the end
          this.comments.reverse();
          window.scrollTo(0, document.body.scrollHeight);

        }, (err) => {
          swal("Error!", "Error while retrieving the comments " + err, "danger");
        });
    }
    // !-LOADS ALL COMMENTS IN A POST--! //

    // LOAD PREVIOUS COMMENTS

  loadPreviousComments() {
    const earliestComment = this.comments[0]._id;
    this.postService.getNextComments(this.post._id, earliestComment)
      .subscribe((res) => {
        this.comments = [...res['comments'].reverse(), ...this.comments];
      });
  }


    // !--FETCH DATA OF SINGLE COMMENT--! //
    getSingleComment(commentId){
      this.postService.getComment(commentId)
      .subscribe((res) => {
       // console.log(res);
      }, (err) => {
        swal("Error!", "Error while fetching the comment " + err, "danger");
      });
    }
    // !--FETCH DATA OF SINGLE COMMENT--! //



    // !--HIDE/SHOW THE NORMAL TYPE POST COMMENTS BOX--! //
    normalCommentBoxToggle() {
      const normalCommentBox = document.getElementById('normalComments');

      if (normalCommentBox.style.display === 'block') {
        console.log('should enter here');
        this.showComments.id = '';
        this.showComments.normal = false;
        normalCommentBox.style.display = 'none';
      }
      else {
        normalCommentBox.style.display = 'block';
      }
    }
    // !--HIDE/SHOW THE NORMAL TYPE POST COMMENTS BOX--! //



    // !--HIDE/SHOW THE TASK TYPE POSTS COMMENTS BOX--! //
    taskCommentBoxToggle() {
      const taskCommentBox = document.getElementById('taskComments');

      if (taskCommentBox.style.display === 'block') {
        taskCommentBox.style.display = 'none';
        this.showComments.id = '';
        this.showComments.task = false;
      } else {
        taskCommentBox.style.display = 'block';
      }
    }
    // !--HIDE/SHOW THE TASK TYPE POSTS COMMENTS BOX--! //



    // !--HIDE/SHOW THE EVENT TYPE POSTS COMMENTS BOX--! //
    eventCommentBoxToggle() {
      const eventCommentBox = document.getElementById('eventComments');

      if(eventCommentBox.style.display == 'block'){
        eventCommentBox.style.display = 'none';
        this.showComments.id = '';
        this.showComments.event = false;
      }
      else {
        eventCommentBox.style.display = 'block';
      }

    }
    // !--HIDE/SHOW THE EVENT TYPE POSTS COMMENTS BOX--! //


    // !--TOGGLE THE EVENT FOR ANY ENTINTY--! //
    toggled(event) {
      if (event) {
       //   console.log('is open');
      } else {
      //  console.log('is closed');
      }
    }
    // !--TOGGLE THE EVENT FOR ANY ENTINTY--! //


    // !--EDIT A COMMENT--! //
    OnEditComment(index){
      const editor = document.getElementById('edit-comment-'+index);
      const button = document.getElementById('button_edit_comment'+index);
      editor.style.display = 'block';
      button.style.display = 'block';
    }

    OnSaveEditComment(index, commentId, postId){
      const editor = document.getElementById('edit-comment-'+index);
      const comment ={
        content: document.getElementById('commentContent-'+index).innerHTML,
        contentMentions: this.content_mentions
      };

      let scanned_content = comment.content;
      let el = document.createElement('html');
      el.innerHTML = scanned_content;

      if (el.getElementsByClassName('mention').length > 0) {

        // console.log('Element',  el.getElementsByClassName( 'mention' ));
        for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
          if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
            for (let i = 0; i < this.allMembersId.length; i++) {
              this.content_mentions.push(this.allMembersId[i]);
            }
            //this.content_mentions = this.allMembersId;
          }
          else {
            if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
              this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
          }
        }

      }
      //  console.log('Comment:', commentId);
      //  console.log('Post Id', postId);
      this.postService.updateComment(commentId, comment)
      .subscribe((res) => {
        // this.loadComments(postId);
        const indexEditedComment = this.comments.findIndex((comment) => comment._id == res['comment']._id);
        this.comments[indexEditedComment] = res['comment'];
        this.content_mentions = [];
      }, (err) => {
        this.content_mentions = [];
      //  console.log('Error while updating the comment', err);
        swal("Error!", "Error while updating the comment " + err, "danger");
      })

    }
    // !--EDIT A COMMENT--! //

    OnDeleteComment(commentId) {
      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        dangerMode: true,
        buttons: ["Cancel", "Yes, delete it!"],

      })
        .then(willDelete => {
          if (willDelete) {
            this.postService.deleteComment(commentId)
              .subscribe((res) => {
                const indexDeletedComment = this.comments.findIndex((comment) => commentId == comment._id);
                this.comments.splice(indexDeletedComment, 1);
                this.commentCount--;
                // this.getPost(res['commentRemoved']['_post']);
                // this.loadComments(res['commentRemoved']['_post']);
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



    mentionmembers() {
      let hashValues = [];

      let Value = [];

      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
          //  console.log('Group', res);
          Value.push({ id: '', value: 'all' });

          for (let i = 0; i < res['group']._members.length; i++) {
            this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
            this.allMembersId.push(res['group']._members[i]._id);
            Value.push({ id: res['group']._members[i]._id, value: res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name });
          }
          for (var i = 0; i < res['group']._admins.length; i++) {
            this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
            this.allMembersId.push(res['group']._admins[i]._id);
            Value.push({ id: res['group']._admins[i]._id, value: res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name });
          }
         //  console.log('All members ID', this.allMembersId);

        }, (err) => {

          swal("Error!", "Error received while fetching the members " + err, "danger");
        });

      this.groupService.getGroupFiles(this.group_id)
        .subscribe((res) => {
          //  console.log('Group Files:', res['posts']);
          this.files = res['posts'];
          for (var i = 0; i < res['posts'].length; i++) {
            if (res['posts'][i].files.length > 0) {
              hashValues.push({ id: res['posts'][i].files[0]._id, value: '<a style="color:inherit;" target="_blank" href="' + this.BASE_URL + '/uploads/' + res['posts'][i].files[0].modified_name + '"' + '>' + res['posts'][i].files[0].orignal_name + '</a>' })
            }

          }
        }, (err) => {

         // swal("Error!", "Error received while fetching the group files " + err, "danger");
        });

      const toolbaroptions = {
        container: [
          ['bold', 'italic', 'underline', 'strike'],     // toggled buttons
          ['blockquote', 'code-block'],

          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction

          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],

          ['clean'],                                         // remove formatting button

          ['link', 'image', 'video'],
          ['emoji']],
          handlers: {
              'emoji': function () {
                console.log('clicked');
              }
          }
      }


      this.modules = {
        toolbar: toolbaroptions,
        "emoji-toolbar": true,
        "emoji-shortname": true,
        autoLink: true,
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ["@", "#"],
          source: function (searchTerm, renderList, mentionChar) {
            let values;

            if (mentionChar === "@") {
              values = Value;
            } else {
              values = hashValues;
            }

            if (searchTerm.length === 0) {
              renderList(values, searchTerm);
            } else {
              const matches = [];
              for (var i = 0; i < values.length; i++)
                if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i]);
              renderList(matches, searchTerm);
            }
          },
        },
      }

    }


  loadGoogleDrive() {
    gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) });
    gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
  }

  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        'client_id': this.clientId,
        'scope': this.scope,
        'immediate': false
      },
      this.handleAuthResult);
      // console.log('Auth')
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
    // console.log('Picker', this.pickerApiLoaded);
  }

  handleAuthResult(authResult) {
    let src;
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        let view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("image/png,image/jpeg,image/jpg,video/mp4");
        let pickerBuilder = new google.picker.PickerBuilder();
        let picker = pickerBuilder.
          enableFeature(google.picker.Feature.NAV_HIDDEN).
          setOAuthToken(authResult.access_token).
          addView(view).
          addView(new google.picker.DocsUploadView()).
          setCallback(function (e) {
            if (e[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
              let doc = e[google.picker.Response.DOCUMENTS][0];
              src = doc[google.picker.Document.URL];
              // console.log("Document selected is", doc,"and URL is ",src)
            }
          }).
          build();
        picker.setVisible(true);
      }
    }
  }


  onClickLikeComment(comment) {

    if (comment._liked_by.length === 0) {
      this.likeComment(comment);
    } else {
      let userHasLikedComment = false;

      comment._liked_by.forEach((like) => {
        if (like._id == this.user_data.user_id) {
          userHasLikedComment = true;
        }
      });

      // we like the comment when the user is not one of the users that liked the comment
      // and we unlike the post when it is
      if (!userHasLikedComment) {
        this.likeComment(comment);
      } else {
        this.unlikeComment(comment);
      }
    }
  }

  likeComment(comment) {
    this.postService.likeComment(comment)
      .subscribe((res) => {
        const indexComment = this.comments.findIndex((comment) => comment._id == res['comment']._id);

        // backup for older comments without _liked_by property
        if (this.comments[indexComment]._liked_by) {
          this.comments[indexComment]._liked_by.push(res['user']);
        } else {
          this.comments[indexComment]._liked_by = [res['user']];
        }
      });
  }

  unlikeComment(comment) {
    this.postService.unlikeComment(comment)
      .subscribe((res) => {
        // we need to look for commentIndex again, because it could have changed when user loaded older comments
        const indexComment = this.comments.findIndex((comment) => comment._id == res['comment']._id);
        const indexUser = this.comments[indexComment]._liked_by.findIndex((user) => user._id == this.user_data.user_id);
        // remove the user from the list of users who liked this comment
        this.comments[indexComment]._liked_by.splice(indexUser, 1);
      });
  }

  userLikedComment(postIndex, commentIndex) {
    // we need this backup for when the comments hasn't been liked yet
    if ( this.comments[commentIndex]._liked_by ) {
      const index = this.comments[commentIndex]._liked_by.findIndex((user) => user._id === this.user_data.user_id);
      return index > -1;
    } else {
      return false;
    }
  }

  userLikedPost() {
    const currentUserId = this.user_data.user_id;

    const match = this.post._liked_by.filter((user) => {
      return user._id === currentUserId;
    });

    return match.length > 0;
  }

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.profileImage = res.user['profile_pic'];
        this.profileImage = this.BASE_URL + `/uploads/${this.profileImage}`;
      }, (err) => {
        console.log('Error fetched while getting user', err);
      });
  }

  getUser(){

  }

}
