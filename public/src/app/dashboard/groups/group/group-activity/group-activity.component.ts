import * as moment from 'moment';
import * as io from 'socket.io-client';
import { Component, OnInit, ViewChild, Testability, ViewContainerRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { debounceTime } from 'rxjs/operators';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { saveAs } from 'file-saver';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { style, animate, trigger, transition } from '@angular/animations';
import { Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToService } from 'ng2-scroll-to-el';
import 'quill-mention';
import { environment } from '../../../../../environments/environment';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
declare var gapi: any;
declare var google: any;

@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss'],
  providers: [NgbPopoverConfig, NgbDropdownConfig]
})

export class GroupActivityComponent implements OnInit {

  /* It Stores all the Posts of a group into this array*/
  posts = new Array();
  comments = new Array();
  /* It Stores the Group data of a group*/
  group_id;
  group;
  group_name;
  group_socket_id;

  /*Initiating socket and related data*/
  socket = io(environment.BASE_URL);
  BASE_URL = environment.BASE_URL;
  show_new_posts_badge = 0;

  members = [];
  allMembersId = [];
  files = [];
  content_mentions = [];

  public editor;
  public editorTextLength;

  emojiThemes = [
    'apple',
    'google',
    'twitter',
    'emojione',
    'messenger',
    'facebook',
  ];
  emojiSet = 'google';
  emojiNative = false;

  isLoading$ = new BehaviorSubject(false);

  style = 'material';
  title = 'Snotify title!';
  body = 'Lorem ipsum dolor sit amet!';
  timeout = 3000;
  position: SnotifyPosition = SnotifyPosition.rightBottom;
  progressBar = true;
  closeClick = true;
  newTop = true;
  filterDuplicates = false;
  backdrop = -1;
  dockMax = 8;
  blockMax = 6;
  pauseHover = true;
  titleMaxLength = 15;
  bodyMaxLength = 80;

  user_data;
  user: User;
  profileImage;
  postForm: FormGroup;
  commentForm: FormGroup;
  post = {
    type: 'normal',
    content: ''
  };

  comment = {
    content: '',
    _commented_by: '',
    _post_id: ''
  };

  form: FormGroup;
  processing = false;
  post_type;
  time = { hour: 13, minute: 30 };
  model_date;
  date: { year: number, month: number };
  model_time = { hour: 13, minute: 30 };
  due_date = 'Due Date';
  due_to = '';
  due_time = 'Due Time';
  assignment = 'Unassigned';
  selected_date: Date;

  showComments = {
    id: '',
    normal: false,
    event: false,
    task: false
  };

  datePickedCount = 0;
  timePickedCount = 0;

  // alert variable
  staticAlertClosed = false;
  private _message = new Subject<string>();
  alert = {
    class: '',
    message: ''
  };

  // group user search variabels
  config = {
    displayKey: 'description', // if objects array passed which key to be displayed defaults to description,
    search: false // enables the search plugin to search in the list
  };
  groupUsersList: any = new Array();
  selectedGroupUsers = [];
  settings = {};

  // post's attahced files
  filesToUpload: Array<File> = [];

  googleDriveFiles=[];

  modules = {};

  isItMyWorkplace = false;


    // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //
    developerKey = 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I';

    clientId = "971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com";
    
    scope = [
      'https://www.googleapis.com/auth/drive'//insert scope here
    ].join(' ');
  
    pickerApiLoaded = false;
  
    oauthToken?: any;
    // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //


  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _userService: UserService,
    public groupDataService: GroupDataService, private router: Router, private groupService: GroupService,
    private modalService: NgbModal, private postService: PostService, private _sanitizer: DomSanitizer,
    private ngxService: NgxUiLoaderService, private snotifyService: SnotifyService, config: NgbDropdownConfig,
    private scrollService: ScrollToService) {

    config.placement = 'left';
    config.autoClose = false;
    //config.triggers = 'hover';
    this.group_id = this.groupDataService.groupId;
    console.log('group ID', this.group_id);
    this.user_data = JSON.parse(localStorage.getItem('user'));
    // console.log('user', this.user_data);
    this.group = this.groupDataService.group;
    console.log('GROUP', this.group);
  }

  onEditorBlured(quill) {
    console.log('editor blur!', quill);
  }

  onEditorFocused(quill) {
    console.log('editor focus!', quill);
  }

  onEditorCreated(quill) {
    this.editor = quill;
    //console.log('quill is ready! this is current quill instance object', quill);
    // quill.insertText(0,'hello', 'bold', true);
  }

  onContentChanged(quill) {
    // console.log('quill content is changed!', quill);
    this.editorTextLength = quill.text.length
    // console.log('length', this.editorTextLength);
  }
  transform(html: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  getConfig(): SnotifyToastConfig {
    this.snotifyService.setDefaults({
      global: {
        newOnTop: this.newTop,
        maxAtPosition: this.blockMax,
        maxOnScreen: this.dockMax
      }
    });
    return {
      bodyMaxLength: this.bodyMaxLength,
      titleMaxLength: this.titleMaxLength,
      backdrop: this.backdrop,
      position: this.position,
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    };
  }

  onSuccess() {
    this.snotifyService.success(this.body, this.title, this.getConfig());
  }


  async ngOnInit() {
    this.ngxService.start();

    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    // here we test if the section we entered is a group of my personal workplace
    this.isItMyWorkplace = this._activatedRoute.snapshot.queryParamMap.get('myworkplace') == 'true' || false;

    this.getUserProfile();
    this.inilizePostForm();
    this.inilizeCommentForm();

    //initial group initialization for normal groups
    // this pattern needs improvement because it
    this.group_id = this.groupDataService.groupId;
    console.log('group ID', this.group_id);
    this.group = this.groupDataService.group;
    console.log('this.group');

    // my-workplace depends on a private group and we need to fetch that group and edit
    // the group data before we proceed and get the group post
    if (this.isItMyWorkplace) {
      await this.getPrivateGroup();
    }

    this.loadGroupPosts();
    this.alertMessageSettings();
    this.initializeGroupMembersSearchForm();
    this.mentionmembers();
    this.socketio();
  }

  loadGroup() {
    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        //  console.log('Group: ', res);
        this.group_name = res['group'].group_name;
        this.group_socket_id = res['group']._id;


      }, (err) => {



      });

  }


  socketio() {


      const room = {
        workspace: this.user_data.workspace.workspace_name,
        group: this.group_name,
      }

      // join room to get notifications for this group
      this.socket.emit('joinGroup', room, (err) => {
        //   console.log(`Socket Joined`);
      });

      // Alert on screen when newPost is created
      this.socket.on('newPostOnGroup', (data) => {
        if (this.groupDataService.group._id == data.groupId) {
          this.show_new_posts_badge = 1;
          this.playAudio();
        }
      });

      this.socket.on('disconnect', () => {
        //	console.log(`Socket disconnected from group`);
      });

  }


  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
     console.log('files', this.filesToUpload);
    // console.log('input', fileInput);

    // this.product.photo = fileInput.target.files[0]['name'];
  }

  show_hide_working_bar() {

    const x = document.getElementById('show_hide');
    if (x.style.display === 'none') {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }

  }

  navigate_to_group(group_id) {
    //this.router.navigate(['../dashboard','group',group_id,'activity']);
    window.location.href = this.BASE_URL + '#/dashboard/group/' + group_id + '/activity';
    //  console.log('routed');
  }

   getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        console.log('log user', this.user);
        this.profileImage = res.user['profile_pic'];
        this.profileImage = this.BASE_URL + `/uploads/${this.profileImage}`;
      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.class = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }

  // group memebrs search setting when user add new event or taks type post
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

  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }

  inilizeCommentForm() {
    this.commentForm = new FormGroup({
      'commentContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }


  inilizePostForm() {
    this.postForm = new FormGroup({
      'postContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }

  onAddNewComment(post_id, index) {
    // console.log('post._id: ', post_id);

    const commentContent = {
      "content":this.comment.content,
     "_commented_by": this.user_data.user_id,
     "post_id": post_id,
     "contentMentions": this.content_mentions
    };
    //  console.log('Comment Content', commentContent);

    this.comment._post_id = post_id;
    this.comment._commented_by = this.user_data.user_id;
    var cardTaskPost = document.getElementById('card-task-post-comment-' + index);
    var cardNormalPost = document.getElementById('card-normal-post-comment-' + index);
    var cardEventPost = document.getElementById('card-event-post-comment-' + index);

    const scanned_content = commentContent.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
          for (var i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
        }
        else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        commentContent.contentMentions[i] = this.content_mentions[i];
      }
    }

    this.postService.addNewComment(post_id, commentContent)
      .subscribe((res) => {
        console.log('Add Comment Response', res);
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          commentId: res['comment']._id,
          groupId: this.groupDataService.group._id // Pass group id here!!!
        };
           // console.log(data);
        this.socket.emit('newPost', data);
        this.commentForm.reset();
        this.loadGroupPosts();
        this.scrollToTop('#card-normal-post-' + index);
        this.scrollToTop('#card-event-post-' + index);
        this.scrollToTop('#card-task-post-' + index);
        this.showComments.id = post_id;
        this.showComments.task = !this.showComments.task;
        this.showComments.normal = !this.showComments.normal;
        this.showComments.event = !this.showComments.event;
        // cardTaskPost.style.display = 'none';
        // cardNormalPost.style.display = 'none';

      }, (err) => {

        if (err.status) {
          swal("Error!", "Seems like, there's an error found " + err, "danger");

        } else {
          swal("Error!", "Either server is down, or no Internet connection!", "danger");
        }

      });
    if (cardNormalPost == null && cardEventPost == null) {
      cardTaskPost.style.display = 'none';
    }
    if (cardTaskPost == null && cardEventPost == null) {
      cardNormalPost.style.display = 'none';
    }
    if (cardNormalPost == null && cardTaskPost == null) {
      cardEventPost.style.display = 'none';
    }
  }

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

              this.alert.class = 'success';
              this._message.next(res['message']);
              this.resetNewPostForm();
              console.log('Normal post response: ', res);
              this.loadGroupPosts();

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



  OnAddNewPost() {
    // console.log('on addnew post');
    // console.log('on addnew post.type', this.post.type);


    switch (this.post.type) {
      case 'normal':
        // console.log('NOrmal post adding');

        this.addNewNormalPost();
        break;
      case 'event':
        // console.log('Event post adding');

        this.addNewEventPost();
        break;
      case 'task':
        // console.log('Task post adding');

        this.addNewTaskPost();
        break;
    }
    this.show_hide_working_bar();
  }



  linkify(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '">' + url + '</a>';
    });
  }


  // !--ADD NEW NORMAL POST--! //
  addNewNormalPost() {
    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    if (files !== null) {
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i], files[i]['name']);
      }
    }
    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group_id,
      _content_mentions: this.content_mentions
    };
    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
          for (var i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
        }
        else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        formData.append('_content_mentions', this.content_mentions[i]);
      }
    }

    const driveDivision = document.getElementById('google-drive-file');
    console.log(driveDivision.innerHTML);

    if(driveDivision.innerHTML == '' || driveDivision.innerHTML == null){
      formData.append('content', post.content);
    }

    else{
      formData.append('content', post.content+driveDivision.innerHTML);
    }
    
    
    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);


    this.processing = true;
    this.disblePostForm();
    this.postService.addNewNormalPost(formData)
      .subscribe((res) => {
         console.log('Post', res);
        this.processing = false;
        this.enablePostForm();
        this.postForm.reset();
        this.alert.class = 'success';
        this._message.next(res['message']);
        this.filesToUpload = null;
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];
        // start socket!
        // const socket = io();
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.groupDataService.group._id // Pass group id here!!!
        };
        //  console.log(data);
        this.socket.emit('newPost', data);
        this.loadGroupPosts();
        this.content_mentions = [];

      }, (err) => {
        this.processing = false;
        this.content_mentions = [];
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];
        this.alert.class = 'danger';
        this.enablePostForm();
        console.log('Error while creating a new post', err);

      });

  }

  addNewEventPost() {

    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    // console.log(files);
    const assignedUsers = new Array();

    if (files !== null) {
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i], files[i]['name']);
      }
    }

    for (let i = 0; i < this.selectedGroupUsers.length; i++) {
      // assignedUsers.push(this.selectedGroupUsers[i]._id);
      formData.append('event._assigned_to', this.selectedGroupUsers[i]._id);

    }


    // console.log('assignedUsers: ', assignedUsers);

    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group_id,
      event: {
        due_date: this.selected_date,
        due_time: this.due_time,
        due_to: moment(`${this.due_date} ${this.due_time}`).format(),
        _assigned_to: assignedUsers,
        _content_mentions: this.content_mentions
      },
      files: this.filesToUpload
    };

    const driveDivision = document.getElementById('google-drive-file');
    console.log(driveDivision.innerHTML);

    if(driveDivision.innerHTML == '' || driveDivision.innerHTML == null){
      formData.append('content', post.content);
    }

    else{
      formData.append('content', post.content+driveDivision.innerHTML);
    }
    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('event.due_to', post.event.due_to);

    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
          for (var i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
          //this.content_mentions = this.allMembersId;
        }
        else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }


      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        formData.append('_content_mentions', this.content_mentions[i]);
      }

      // console.log('Content Mention', post._content_mentions);
      //  console.log('This post', postId);
    }

    //formData.append('event.due_time', post.event.due_time);
    //formData.append('event._assigned_to', assignedUsers);



    this.processing = true;
    this.disblePostForm();
    this.postService.addNewEventPost(formData)
      .subscribe((res) => {
        this.processing = false;
        this.enablePostForm();
        this.postForm.reset();
        this.alert.class = 'success';
        this._message.next(res['message']);
        this.resetNewPostForm();
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];
        // console.log('Normal post response: ', res);
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group_id // Pass group id here!!!
        };
        //  console.log(data);
        this.socket.emit('newPost', data);
        this.loadGroupPosts();
        this.content_mentions = [];


      }, (err) => {
        this.content_mentions = [];
        this.processing = false;
        this.alert.class = 'danger';
        this.enablePostForm();
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];
        //  console.log(err);

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });

  }

  addNewTaskPost() {

    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    // console.log(files);
    if (files !== null) {
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i], files[i]['name']);
      }
    }


    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group_id,
      task: {
        due_date: this.selected_date,
        due_to: moment(`${this.selected_date}`).format('YYYY-MM-DD'),
        _assigned_to: this.selectedGroupUsers[0]._id,
        _content_mentions: this.content_mentions
      }
    };

    const driveDivision = document.getElementById('google-drive-file');
    console.log(driveDivision.innerHTML);

    if(driveDivision.innerHTML == '' || driveDivision.innerHTML == null){
      formData.append('content', post.content);
    }

    else{
      formData.append('content', post.content+driveDivision.innerHTML);
    }
    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('task.due_to', post.task.due_to);
    formData.append('task._assigned_to', post.task._assigned_to);
    formData.append('task.status', 'to do');

    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
          for (var i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
          //this.content_mentions = this.allMembersId;
        }
        else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }


      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        formData.append('_content_mentions', this.content_mentions[i]);
      }

      // console.log('Content Mention', post._content_mentions);
      //  console.log('This post', postId);
    }


    // console.log('post: ', post);

    this.processing = true;
    this.disblePostForm();
    this.postService.addNewTaskPost(formData)
      .subscribe((res) => {
        this.processing = false;
        this.enablePostForm();
        this.postForm.reset();
        this.alert.class = 'success';
        this._message.next(res['message']);
        this.resetNewPostForm();
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];
        console.log('Normal post response: ', res);
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group_id // Pass group id here!!!
        };
        //  console.log(data);
        this.socket.emit('newPost', data);
        this.loadGroupPosts();
        this.content_mentions = [];

      }, (err) => {
        this.content_mentions = [];
        this.processing = false;
        this.alert.class = 'danger';
        this.enablePostForm();
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });

  }

  onDownlaodFile(fileName, fileName_orignal) {

    const fileData = {
      'fileName': fileName
    };
    this._userService.downloadFile(fileData)
      .subscribe((file) => {

        //   console.log('Downloaded File', file);
        saveAs(file, fileName_orignal);

      }, (err) => {
        //  console.log('Downloaded File err', err);

      });
  }



  mark_complete_task_post() {

    const element = document.getElementById("id1");
    element.style.backgroundColor = "#4cae4c";
    element.style.color = "#fff";
    element.style.border = "none";
    element.style.outline = "none";
    element.classList.toggle("btn-success");

  }

  onDeletePost(postId) {


    // console.log('postId: ', postId);

    const post = {
      'postId': postId
    };

    //  console.log('post: ', post);



    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      dangerMode: true,
      buttons: ["Cancel", "Yes, delete it!"],

    })
      .then(willDelete => {
        if (willDelete) {
          this.postService.deletePost(postId)
            .subscribe((res) => {

              this.alert.class = 'success';
              this._message.next(res['message']);
              this.resetNewPostForm();
              // console.log('Normal post response: ', res);
              this.loadGroupPosts();

            }, (err) => {

              this.alert.class = 'danger';

              if (err.status) {
                this._message.next(err.error.message);
              } else {
                this._message.next('Error! either server is down or no internet connection');
              }

            });
          swal("Deleted!", "The following post has been deleted!", "success");
        }
      });
  }

  resetNewPostForm() {
    this.due_date = 'Due Date';
    this.due_time = 'Due Time';
    this.assignment = 'UnAssigned';
    this.filesToUpload = null;
  }

  // !-LOADS ALL COMMENTS IN A POST--! //
  loadComments(postId) {
    var commentData = new Array();

    this.postService.getComments(postId)
      .subscribe((res) => {
       // console.log(res['comments']);
        this.comments = res['comments'];
      }, (err) => {
        swal("Error!", "Error while retrieving the comments " + err, "danger");
      });
  }
  // !-LOADS ALL COMMENTS IN A POST--! //



  // !--FETCH DATA OF SINGLE COMMENT--! //
  getSingleComment(commentId){
    this.postService.getComment(commentId)
    .subscribe((res) => {
      console.log(res);
    }, (err) => {
      swal("Error!", "Error while fetching the comment " + err, "danger");
    });
  }
  // !--FETCH DATA OF SINGLE COMMENT--! //

  getPrivateGroup() {
    return new Promise((resolve, reject) => {
      const workspace_name = JSON.parse(localStorage.getItem('user')).workspace.workspace_name;

      this.groupService.getPrivateGroup(workspace_name)
        .subscribe((res) => {
          console.log('REEEEEEEEEEEES', res);
          this.group = res.privateGroup
          this.group_id = res.privateGroup._id;
          this.group_name = res.privateGroup.group_name;
          resolve();
        }, (err) => {
          reject(err);
        })
    })
  }



  // !--HIDE/SHOW THE NORMAL TYPE POST COMMENTS BOX--! //
  normalCommentBoxToggle(index) {
    const allEventCommentBox = document.getElementById('eventComments' + index);
    const allTaskCommentBox = document.getElementById('taskComments' + index);
    const allNormalCommentBox = document.getElementById('normalComments' + index);

    for(var i = 0; i < index+50; i++){
      if(i == index){
        if(allNormalCommentBox.style.display == 'block'){
          allNormalCommentBox.style.display = 'none';
        }
        else{
          allNormalCommentBox.style.display = 'block';
        }
      }
      else if(document.body.contains(document.getElementById('normalComments'+i)) && i!=index){
        document.getElementById('normalComments'+i).style.display = 'none';
      }
      else if(document.body.contains(document.getElementById('taskComments'+i))){
        document.getElementById('taskComments'+i).style.display = 'none';
      }
      else if(document.body.contains(document.getElementById('eventComments'+i))){
        document.getElementById('eventComments'+i).style.display = 'none';
      }
    }
  }
  // !--HIDE/SHOW THE NORMAL TYPE POST COMMENTS BOX--! //



  // !--HIDE/SHOW THE TASK TYPE POSTS COMMENTS BOX--! //
  taskCommentBoxToggle(index) {
    const allEventCommentBox = document.getElementById('eventComments' + index);
    const allTaskCommentBox = document.getElementById('taskComments' + index);
    const allNormalCommentBox = document.getElementById('normalComments' + index);

    for(var i = 0; i < index+50; i++){
      if(i == index){
        if(allTaskCommentBox.style.display == 'block'){
          allTaskCommentBox.style.display = 'none';
        }
        else{
          allTaskCommentBox.style.display = 'block';
        }
      }
      else if(document.body.contains(document.getElementById('taskComments'+i)) && i!=index){
        document.getElementById('taskComments'+i).style.display = 'none';
      }
      else if(document.body.contains(document.getElementById('normalComments'+i))){
        document.getElementById('normalComments'+i).style.display = 'none';
      }
      else if(document.body.contains(document.getElementById('eventComments'+i))){
        document.getElementById('eventComments'+i).style.display = 'none';
      }
    }
  }
  // !--HIDE/SHOW THE TASK TYPE POSTS COMMENTS BOX--! //



  // !--HIDE/SHOW THE EVENT TYPE POSTS COMMENTS BOX--! //
  eventCommentBoxToggle(index) {
    const allEventCommentBox = document.getElementById('eventComments' + index);
    const allTaskCommentBox = document.getElementById('taskComments' + index);
    const allNormalCommentBox = document.getElementById('normalComments' + index);

    for(var i = 0; i < index+50; i++){
      if(i == index){
        if(allEventCommentBox.style.display == 'block'){
          allEventCommentBox.style.display = 'none';
        }
        else{
          allEventCommentBox.style.display = 'block';
        }
      }
      else if(document.body.contains(document.getElementById('eventComments'+i)) && i!=index){
        document.getElementById('eventComments'+i).style.display = 'none';
      }
      else if(document.body.contains(document.getElementById('normalComments'+i))){
        document.getElementById('normalComments'+i).style.display = 'none';
      }
      else if(document.body.contains(document.getElementById('taskComments'+i))){
        document.getElementById('taskComments'+i).style.display = 'none';
      }
    }
  }
  // !--HIDE/SHOW THE EVENT TYPE POSTS COMMENTS BOX--! //



  // !--LOAD ALL THE GROUP POSTS ON INIT--! //
  loadGroupPosts() {
    // we count the attempts to avoid infinity attempts
    let count = 0;
    this.isLoading$.next(true);

    // we only want to make a server request when the group properties are defined
    if (this.group || count > 6) {
      // reset the count
      count = 0;
      this.postService.getGroupPosts(this.group_id)
        .subscribe((res) => {
          // console.log('Group posts:', res);
          this.posts = res['posts'];
          console.log('Group posts:', this.posts);
          this.isLoading$.next(false);
          this.show_new_posts_badge = 0;
        }, (err) => {
          swal("Error!", "Error while retrieving the posts " + err, "danger");
        });
    } else {
      // When this.group is undefined we try to define it every .5seconds until the values are ready
      setTimeout(() => {
        this.group = this.groupDataService.group;
        this.group_id = this.groupDataService.groupId;
        this.loadGroupPosts();
        count++
      }, 500)
    }
    }

  // !--LOAD ALL THE GROUP POSTS ON INIT--! //



  // !--LOAD ALL THE NEXT MOST RECENT GROUP POSTS--! //
  loadNextPosts(last_post_id) {
    this.isLoading$.next(true);

    this.postService.getNextPosts(this.group_id, last_post_id)
      .subscribe((res) => {
        //    console.log('Group posts:', res);
        this.posts = this.posts.concat(res['posts']);
        //  console.log('Group posts:', this.posts);
        this.isLoading$.next(false);
      }, (err) => {
        swal("Error!", "Error while retrieving the next recent posts " + err, "danger");
      });
  }
  // !--LOAD ALL THE NEXT MOST RECENT GROUP POSTS--! //



  // !--ON SCROLL FETCHES THE NEXT RECENT GROUP POSTS--! //
  onScroll() {
    this.isLoading$.next(true);
    this.ngxService.startBackground();

    this.postService.getGroupPosts(this.group_id)
      .subscribe((res) => {
        if (this.posts.length != 0) {
          console.log('Scroll Response', res);
          var last_post_id = this.posts[this.posts.length - 1]._id
          this.loadNextPosts(last_post_id);
          this.isLoading$.next(false);
          this.ngxService.stopBackground();
        }
      }, (err) => {
        swal("Error!", "Error while retrieving the next recent posts & Scrolling " + err, "danger");
      });
  }
  // !--ON SCROLL FETCHES THE NEXT RECENT GROUP POSTS--! //



  // !--SCROLL TO AN ELEMENT--! //
  scrollToTop(element) {
    this.scrollService.scrollTo(element)
    .subscribe((res) => {
      //   console.log('next');
      //   console.log(data);
    }, (err) => {
      //swal("Error!", "Error while scrolling to Element " + err, "danger");
    }, () => {
      //  console.log('complete');
    });
  }
  // !--SCROLL TO AN ELEMENT--! //


  toggled(event) {
    if (event) {
        console.log('is open');
    } else {
      console.log('is closed');

    }
  }

  icon_comment_change_color() {
    const x = document.getElementById('icon_comment');
    x.style.color = "#005fd5";
    const y = document.getElementById('icon_event');
    y.style.color = "#9b9b9b";
    const z = document.getElementById('icon_check_box');
    z.style.color = "#9b9b9b";

  }
  icon_comment_post_color(index) {
    const x = document.getElementById('icon_comment_post_' + index);

    if (x.style.color == "#005fd5") {
      x.style.color = "#9b9b9b";
    }

    else if (x.style.color == "#9b9b9b") {
      x.style.color = "#005fd5";
    }

  }

  icon_event_change_color() {
    const x = document.getElementById('icon_event');
    x.style.color = "#005fd5";
    const y = document.getElementById('icon_comment');
    y.style.color = "#9b9b9b";
    const z = document.getElementById('icon_check_box');
    z.style.color = "#9b9b9b";

  }

  icon_check_box_change_color() {
    const x = document.getElementById('icon_check_box');
    x.style.color = "#005fd5";
    const y = document.getElementById('icon_comment');
    y.style.color = "#9b9b9b";
    const z = document.getElementById('icon_event');
    z.style.color = "#9b9b9b";

  }

  icon_comment_post_change_color() {
    const x = document.getElementById('icon_comment_post');
    x.style.color = "#005fd5";
    if (x.style.color === "#005fd5") {

      x.style.color = "#9b9b9b";

    }
    else (x.style.color === "#9b9b9b")
    {
      x.style.color = "#005fd5";
    }

  }

  refreshPage() {
    location.reload();
  }

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

    var scanned_content = comment.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
          for (var i = 0; i < this.allMembersId.length; i++) {
            this.content_mentions.push(this.allMembersId[i]);
          }
          //this.content_mentions = this.allMembersId;
        }
        else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      // console.log('Content Mention', post._content_mentions);
      //  console.log('This post', postId);
    }

      //console.log('Content Mention', this.content_mentions);
      console.log('Comment:', commentId);
      console.log('Post Id', postId);
    this.postService.updateComment(commentId, comment)
    .subscribe((res) => {
      console.log('Comment Updated', res);
      this.loadComments(postId);
      this.content_mentions = [];
    }, (err) =>{
      this.content_mentions = [];
      console.log('Error while updating the comment', err);
      swal("Error!", "Error while updating the comment " + err, "danger");
    })

  }

  OnEditPost(index) {

    const x = document.getElementById(index);
    const editor = document.getElementById('edit-content-' + index);
    const y = document.getElementById("button_edit_post" + index);
    y.style.display = "block";
    editor.style.display = 'block';

  }

  OnSaveEditPost(index, post_id, content) {
    const editor = document.getElementById('edit-content-' + index);
    const post = {
      'content': document.getElementById(index).innerHTML,
      '_content_mentions': this.content_mentions
    };
    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      //  console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id'].toString());
      }

    }
    // console.log('Content Mention', this.content_mentions);
    //  console.log('post: ', post);
    this.postService.editPost(post_id, post)
      .subscribe((res) => {

        this.alert.class = 'success';
        this._message.next(res['message']);
        this.resetNewPostForm();
        // console.log('Normal post response: ', res);
        this.loadGroupPosts();
        this.content_mentions = [];
        this.scrollToTop('#card-normal-post-' + index);
        this.scrollToTop('#card-event-post-' + index);
        this.scrollToTop('#card-task-post-' + index);
        //  console.log("Post Updated, Successfully!")

      }, (err) => {

        this.alert.class = 'danger';
        this.content_mentions = [];

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
    const x = document.getElementById(index);
    const y = document.getElementById("button_edit_post" + index);
    x.style.borderStyle = "none";
    x.style.display = "block";
    editor.style.display = 'none';
    x.setAttribute('contenteditable', 'false');
    y.style.display = "none";
    x.blur();
  }

  onSelectPostType(type) {
    this.post.type = type;
    this.due_date = 'Due Date';
    this.due_time = 'Due Time';
    switch (this.post.type) {
      case 'event':
        this.icon_event_change_color();
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

        break;
      case 'task':
        this.icon_check_box_change_color();
        this.settings = {
          text: 'Select Group Members',
          classes: 'myclass custom-class',
          singleSelection: true,
          primaryKey: '_id',
          labelKey: 'full_name',
          noDataLabel: 'Search Members...',
          enableSearchFilter: true,
          searchBy: ['full_name', 'capital']
        };
        break;

      default:
        this.icon_comment_change_color();
        break;
    }
    // console.log('post type: ', this.post.type);

  }


  openTimePicker(content) {
    this.modalService.open(content, { centered: true });
    this.timePickedCount;
  }

  openDatePicker(content) {
    this.modalService.open(content, { centered: true });
    this.datePickedCount = 1;
  }

  openAssignPicker(content) {
    this.modalService.open(content, { centered: true });
  }

  onDateSelected() {
    const temp = this.model_date;
    this.due_date = temp.year.toString() + '-' + this.date.month.toString() + '-' + temp.day.toString();
    this.selected_date = new Date(this.date.year, (this.date.month - 1), temp.day, this.model_time.hour, this.model_time.minute);
    this.due_to = temp.year.toString() + '-' + this.date.month.toString() + '-' + temp.day.toString() + 'T' + this.model_time.hour + ':' + this.model_time.minute + ':' + '00' + this.selected_date.getTimezoneOffset();
  }


  enablePostForm() {
    this.postForm.enable();
  }

  disblePostForm() {
    this.postForm.disable();
  }

  onTimeSelected() {
    this.due_time = this.model_time.hour.toString() + ':' + this.model_time.minute.toString();
  }

  onSearch(evt: any) {
    // console.log(evt.target.value);
    this.groupUsersList = [];
    this.groupService.searchGroupUsers(this.group_id, evt.target.value)
      .subscribe((res) => {
        // console.log('workspace users: ', res);
        // console.log('Group Users: ', res);

        this.groupUsersList = res['users'];

      }, (err) => {

      });

  }

  onItemSelect(item: any) {
    // console.log(item);
    // console.log('selected items: ', this.selectedGroupUsers);
    if (this.selectedGroupUsers.length >= 1) {
      this.assignment = 'Assigned';
    }
  }
  OnItemDeSelect(item: any) {
    // console.log(item);
    // console.log(this.selectedGroupUsers);
    if (this.selectedGroupUsers.length < 1) {
      this.assignment = 'UnAssigned';
    }

  }
  onSelectAll(items: any) {
    // console.log(items);
    this.assignment = 'Assigned';
  }
  onDeSelectAll(items: any) {
    // console.log(items);
    this.assignment = 'UnAssigned';

  }


  OnMarkEventCompleted(index, post_id) {

    const button = document.getElementById("button_event_mark_completed_" + index);

    const post = {
      'status': 'done',
      'user_id': this.user_data.user_id
    };
    this.postService.complete(post_id, post)
      .subscribe((res) => {
        this.playAudio();
        this.alert.class = 'success';
        this._message.next(res['message']);
        //    console.log('Post Marked as Completed');

        button.style.background = "#005fd5";
        button.style.color = "#ffffff";
        button.innerHTML = "Completed";
        button.setAttribute('disabled', 'true');
        this.loadGroupPosts();
        this.onScroll();
        this.scrollToTop('#card-normal-post-' + index);
        this.scrollToTop('#card-event-post-' + index);
        this.scrollToTop('#card-task-post-' + index);

      }, (err) => {

        console.log('Error:', err);

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });

  }


  OnMarkTaskToDo(index, post_id) {
    const post = {
      'status': 'to do'
    };
    this.postService.complete(post_id, post)
      .subscribe((res) => {
        console.log('Post Marked as to do', res);
        this.playAudio();
        this.loadGroupPosts();
        this.onScroll();
        this.scrollToTop('#card-normal-post-' + index);
        this.scrollToTop('#card-event-post-' + index);
        this.scrollToTop('#card-task-post-' + index);
        swal("Good Job!", "The status of task has been updated sucessfully!", "success");


      }, (err) => {

        console.log('Error:', err);

      });

  }

  OnMarkTaskInProgress(index, post_id) {
    const post = {
      'status': 'in progress'
    };
    this.postService.complete(post_id, post)
      .subscribe((res) => {
        console.log('Post Marked as in Progress', res);
        this.playAudio();
        this.loadGroupPosts();
        this.onScroll();
        this.scrollToTop('#card-normal-post-' + index);
        this.scrollToTop('#card-event-post-' + index);
        this.scrollToTop('#card-task-post-' + index);
        swal("Good Job!", "The status of task has been updated sucessfully!", "success");
      }, (err) => {

        console.log('Error:', err);

      });

  }


  OnMarkTaskCompleted(index, post_id) {
    const button = document.getElementById("button_task_mark_completed_" + index);
    const post = {
      'status': 'done'
      // 'user_id': this.user_data.user_id
    };
    this.postService.complete(post_id, post)
      .subscribe((res) => {

        this.playAudio();

        this.alert.class = 'success';
        this._message.next(res['message']);
        console.log('Normal post response: ', res);

        console.log('Post Marked as Completed');
        this.loadGroupPosts();
        this.onScroll();
        this.scrollToTop('#card-normal-post-' + index);
        this.scrollToTop('#card-event-post-' + index);
        this.scrollToTop('#card-task-post-' + index);
        swal("Good Job!", "The status of task has been updated sucessfully!", "success");

      }, (err) => {

        console.log('Error:', err);

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  likepost(post) {

    this.postService.like(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);
        //   console.log('Post Liked!');
        this.loadGroupPosts();
        this.onScroll();

      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });

  }

  unlikepost(post) {

    this.postService.unlike(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);
        //   console.log('Post Unliked!');
        this.loadGroupPosts();
        this.onScroll();

      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });

  }



  OnClickLikePost(index, post_id, like_length, liked_by, user_id) {

    const like_icon = document.getElementById('icon_like_post_' + index);
    const post = {
      'post_id': post_id,
      'user_id': this.user_data.user_id
    };

    if (like_length == 0) {
      this.likepost(post);
      this.playAudio();
      this.scrollToTop('#card-normal-post-' + index);
      this.scrollToTop('#card-event-post-' + index);
      this.scrollToTop('#card-task-post-' + index);
      like_icon.style.color = "#005FD5";

    }

    else {
      var i;
      for (i = 0; i < like_length; i++) {

        if (liked_by[i]._id == this.user_data.user_id) {
          this.unlikepost(post);
          this.scrollToTop('#card-normal-post-' + index);
          this.scrollToTop('#card-event-post-' + index);
          this.scrollToTop('#card-task-post-' + index);
          like_icon.style.color = "#9b9b9b";
        }
        else {
          this.likepost(post);
          this.scrollToTop('#card-normal-post-' + index);
          this.scrollToTop('#card-event-post-' + index);
          this.scrollToTop('#card-task-post-' + index);
        }
      }

    }

  }


  loadGroupMembers() {

    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {

        for (var i = 0; i < res['group']._members.length; i++) {
          this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
        }
        for (var i = 0; i < res['group']._admins.length; i++) {
          this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
        }

        //   console.log('Members', this.members);

      }, (err) => {

      });
  }

  mentionmembers() {
    var hashValues = [];

    var Value = [];

    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        //  console.log('Group', res);
        Value.push({ id: '', value: 'all' });

        for (var i = 0; i < res['group']._members.length; i++) {
          this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
          this.allMembersId.push(res['group']._members[i]._id);
          Value.push({ id: res['group']._members[i]._id, value: res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name });
        }
        for (var i = 0; i < res['group']._admins.length; i++) {
          this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
          this.allMembersId.push(res['group']._admins[i]._id);
          Value.push({ id: res['group']._admins[i]._id, value: res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name });
        }
        // console.log('All members ID', this.allMembersId);

      }, (err) => {

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

        ['link', 'image', 'video']]
    }


    this.modules = {
      toolbar: toolbaroptions,
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

  playAudio() {
    let audio = new Audio();
    audio.src = "/assets/audio/intuition.ogg";
    audio.load();
    audio.play();
  }



  setTheme(set: string) {
    this.emojiNative = set === 'google';
    this.emojiSet = set;
  }
  handleClick($event) {
    console.log($event.emoji.native);
    this.editor.insertText(this.editorTextLength - 1, $event.emoji.native);
    //this.onEditorCreated($event);
  }

// !--GOOGLE PICKER IMPLEMENTATION--! //
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
      console.log('Auth')
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
    console.log('Picker', this.pickerApiLoaded);
  }

  handleAuthResult(authResult) {
    let src;
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        let view = new google.picker.View(google.picker.ViewId.DOCS);
        //view.setMimeTypes("image/png,image/jpeg,image/jpg,video/mp4, application/vnd.ms-excel ,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf, text/plain, application/msword, text/js, application/zip, application/rar, application/tar, text/html");
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
              console.log("Document selected is", doc,"and URL is ",src);
              this.googleDriveFiles = e[google.picker.Response.DOCUMENTS];
              
              const driveDivision = document.getElementById('google-drive-file');
              driveDivision.style.display= 'block';
              driveDivision.innerHTML = '<b>Drive File Upload: </b>'+'<a href=\''+src+'\' target=\'_blank\'>'+this.googleDriveFiles[0]['name']+'</a>';
            }
          }).
          build();
        picker.setVisible(true);
      }
    }
    
  }
// !--GOOGLE PICKER IMPLEMENTATION--! //

}
