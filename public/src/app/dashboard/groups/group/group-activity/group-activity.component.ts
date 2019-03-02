import * as moment from 'moment';
import * as io from 'socket.io-client';
import {Component, OnInit, ViewChildren} from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { saveAs } from 'file-saver';
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
import {Group} from "../../../../shared/models/group.model";
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
import {months} from "../../../../common/data";

import * as Quill from 'quill';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { GoogleCloudService } from '../../../../shared/services/google-cloud.service';


@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss'],
  providers: [NgbPopoverConfig, NgbDropdownConfig]
})

export class GroupActivityComponent implements OnInit {

  /* It Stores all the Posts of a group into this array*/
  posts = [];
  comments = [];
  /* It Stores the Group data of a group*/
  group_id;
  group: Group;
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
  commentCount: number;

  form: FormGroup;
  processing = false;
  post_type;
  time = { hour: 13, minute: 30 };
  model_date;
  date: { year: number, month: number };
  model_time = { hour: 13, minute: 30 };
  due_date = 'Due Date';
  due_to = '';
  due_time = {hour: 13, minutes: 30};
  assignment = 'Unassigned';
  selected_date: Date;
  months = months;

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
  groupUsersList: any = [];
  selectedGroupUsers = [];
  settings = {};

  // post's attahced files
  filesToUpload: Array<File> = [];

  googleDriveFiles = [];

  modules;
  modulesLoaded = false;

  isItMyWorkplace = false;
  @ViewChildren('taskStatusList') taskStatusList;

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;
  completedTaskCount = 0;

  todoPercent = 0;
  inprogressPercent = 0;
  completedPercent = 0;
  completedTasks: any = new Array();
  pendingTasks: any = new Array();


  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //
  /*developerKey = 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I';

  clientId = "971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com";

  scope = [
    'https://www.googleapis.com/auth/drive'//insert scope here
  ].join(' ');

  pickerApiLoaded = false;

  oauthToken?: any;*/
  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //


  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _userService: UserService,
              public groupDataService: GroupDataService, private router: Router, private groupService: GroupService,
              private modalService: NgbModal, private postService: PostService, private _sanitizer: DomSanitizer,
              private ngxService: NgxUiLoaderService, private snotifyService: SnotifyService, config: NgbDropdownConfig,
              private scrollService: ScrollToService, private quillInitializeService: QuillAutoLinkService, 
              private googleService: GoogleCloudService) {

    config.placement = 'left';
    config.autoClose = false;
    //config.triggers = 'hover';
    this.group_id = this.groupDataService.groupId;
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  async ngOnInit() {
    this.ngxService.start();

    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    // here we test if the section we entered is a group of my personal workplace
    this.isItMyWorkplace = this._activatedRoute.snapshot.queryParamMap.get('myworkplace') == 'true' || false;

    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};

    this.getUserProfile();

    // initial group initialization for normal groups

    this.group = this.groupDataService.group;
    this.group_id = this.groupDataService.groupId;
    this.group_name = this.group ? this.group.group_name : null;

    // my-workplace depends on a private group and we need to fetch that group and edit
    // the group data before we proceed and get the group post
    if (this.isItMyWorkplace) {
      await this.getPrivateGroup();
    } else {
      // group needs to be defined
      await this.getGroup();
    }

    //it refreshes the access token as soon as we visit any group
      //this.googleService.refreshGoogleToken();
      //this.refreshGoogleToken();
      //this.getGoogleCalendarEvents();
      //this.getCalendar();

      //we have set a time interval of 30mins so as to refresh the access_token in the group
      setInterval(()=>{
        this.googleService.refreshGoogleToken();
        //this.refreshGoogleToken()
      }, 1800000);

    this.loadGroupPosts();
    await this.getPendingTasks();
    await this.getCompletedTasks();
    this.alertMessageSettings();
    this.initializeGroupMembersSearchForm();
    this.mentionmembers();
    this.socketio();
  }

  addNewPostToPosts(post) {
    this.posts.unshift(post);
  }

  onDeletePost(postId) {

    console.log('entered onDeletPost', postId);

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

              //  mirror front-end to back-end
              //  find index of post
              const indexDeletedPost = this.posts.findIndex((post) => post._id == postId);
              this.posts.splice(indexDeletedPost, 1);
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


  onEditorCreated(quill) {
    this.editor = quill;
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


getGroup () {
    return new Promise((resolve, reject) => {
      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
          // console.log('response in group component:', res);
          this.group = res['group'];
          resolve();
        }, (err) => {
              reject();
        });
    });

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
    let count = 0;

    // We add this so that the groupname is definitely available when we make the connection to the socket.
    if (this.group || count > 6) {
      count = 0;
      const room = {
        workspace: this.user_data.workspace.workspace_name,
        group: this.group_name,
      };


      // join room to get notifications for this group
      this.socket.emit('joinGroup', room, (err) => {
        console.log(`Socket Joined`);
      });

      // Alert on screen when newPost is created
      this.socket.on('newPostOnGroup', (data) => {
        if (this.group_id == data.groupId) {
          this.show_new_posts_badge = 1;
          this.playAudio();
        }
      });

      this.socket.on('disconnect', () => {
        //	console.log(`Socket disconnected from group`);
      });

    } else {
      setTimeout(() => {this.socketio(); count++}, 500);
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


  linkify(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '">' + url + '</a>';
    });
  }


  // !--FETCH DATA OF SINGLE COMMENT--! //
  getSingleComment(commentId){
    this.postService.getComment(commentId)
      .subscribe((res) => {

      }, (err) => {
        swal("Error!", "Error while fetching the comment " + err, "danger");
      });
  }
  // !--FETCH DATA OF SINGLE COMMENT--! //

  getPrivateGroup() {
    return new Promise((resolve, reject) => {

      this.groupService.getPrivateGroup()
        .subscribe((res) => {


          this.group = res['privateGroup'];
          this.group_id = res['privateGroup']['_id'];
          this.group_name = res['privateGroup']['group_name'];
          // this.loadGroupPosts();
          resolve();
        }, (err) => {
          reject(err);
        })
    })
  }


  // !--LOAD ALL THE GROUP POSTS ON INIT--! //
  loadGroupPosts() {
    // we count the attempts to avoid infinitive attempts
    let count = 0;
    this.isLoading$.next(true);

    // we only want to make a server request when the group properties are defined
    if (this.group || count > 6) {
      // reset the count
      count = 0;
      this.postService.getGroupPosts(this.group._id)
        .subscribe((res) => {
          this.posts = res['posts'];
          this.isLoading$.next(false);
          this.show_new_posts_badge = 0;
        }, (err) => {
          swal("Error!", "Error while retrieving the posts " + err, "danger");
        });
    } else {
      // When this.group is undefined we try to define it every .5seconds until the values are ready
      // this needs to go because it causes bugs when we switch between groups
      setTimeout(() => {
        this.group = this.groupDataService.group;
        this.group_id = this.groupDataService.groupId;
        this.group_name = this.group ? this.group.group_name : null;
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
        this.isLoading$.next(false);
      }, (err) => {
        swal("Error!", "Error while retrieving the next recent posts " + err, "danger");
      });
  }
  // !--LOAD ALL THE NEXT MOST RECENT GROUP POSTS--! //



  // !--ON SCROLL FETCHES THE NEXT RECENT GROUP POSTS--! //
  onScroll() {
    if ( this.posts.length != 0 ) {
      this.isLoading$.next(true);
      this.ngxService.startBackground();

      this.postService.getGroupPosts(this.group_id)
        .subscribe((res) => {
          if (this.posts.length != 0) {

            const last_post_id = this.posts[this.posts.length - 1]._id
            this.loadNextPosts(last_post_id);
            this.isLoading$.next(false);
            this.ngxService.stopBackground();
          }
        }, (err) => {
          swal("Error!", "Error while retrieving the next recent posts & Scrolling " + err, "danger");
        });
    }

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
      // is open
    } else {
      console.log('is closed');

    }
  }

  refreshPage() {
    location.reload();
  }

  onSearch(evt: any) {
    this.groupUsersList = [];
    this.groupService.searchGroupUsers(this.group_id, evt.target.value)
      .subscribe((res) => {
        this.groupUsersList = res['users'];

      }, (err) => {

      });

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

   // var client_id = this.clientId;
    //var scope = this.scope;

    var Value = [];

    var driveValue = [];

    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
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


      }, (err) => {

      });

    this.groupService.getGroupFiles(this.group_id)
      .subscribe((res) => {
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

        // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean'],                                        // remove formatting button

        ['link', 'image', 'video'],
        ['emoji']],
      handlers: {
        'emoji': function () {
          console.log('clicked');
        },
        'image': function () {
          //Creates an element which accepts image file as the input
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.click();

          // Listen upload local image and save to server
          input.onchange = () => {
            const file = input.files[0];
            const range = this.quill.getSelection();
            var text = '\nImage is being uploaded, please wait...';
            var length = this.quill.getLength();
            var currentIndex = this.quill.getSelection().index;
            this.quill.insertText(range.index, text, 'bold', true);

            // file type is only image.
            if (/^image\//.test(file.type)) {
              //here we are calling the upload Image API, which saves the image to server
              const fd = new FormData();
              fd.append('attachments', file);

              //Calling Custom XML HTTP REQUEST
              const xhr = new XMLHttpRequest();

              xhr.open('POST', environment.BASE_API_URL+'/posts/upload', true);
              xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));

              xhr.onload = () => {
                if (xhr.status === 200) {
                  // this is callback data: url
                  const url = JSON.parse(xhr.responseText).file[0].modified_name;

                  //Here we insert the image and replace the BASE64 with our custom URL, which is been saved to the server
                  //ex - img src = "http://localhost:3000/uploads/image-name.jpg"
                  const range = this.quill.getSelection();
                  this.quill.insertEmbed(range.index, 'image', environment.BASE_URL+'/uploads/'+url);
                  //console.log(this.quill.getLength(), text.length, range.index);

                  //here we delete the uploading text from the editor
                  this.quill.deleteText(currentIndex, text.length);

                }
              };
              xhr.send(fd);
            } else {
              console.warn('You could only upload images.');
            }
          };

        }
      }
    };



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
          } else if(mentionChar === "#") {
            //sending the request to g-drive to give the redered results on event emit

            if(localStorage.getItem('google-cloud-token') != null){
              const getDriveFiles: any = new XMLHttpRequest();
  
              getDriveFiles.open('GET', 'https://www.googleapis.com/drive/v2/files?q=fullText contains '+'"'+searchTerm+'"'+'&maxResults=10&access_token='+JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token, true);
              getDriveFiles.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token);
        
              getDriveFiles.onload = () => {
                if (getDriveFiles.status === 200) {
                  console.log(JSON.parse(getDriveFiles.responseText));
                  for(var i = 0; i < JSON.parse(getDriveFiles.responseText).items.length; i++ ){
                    if( JSON.parse(getDriveFiles.responseText).items.length>0){
                      hashValues.push({
                        //the id has been put manually, it is in no relation to the g-drive files, if you have any better solution to propose, then do make the changes
                        // it is accepting only ObjectId type data
                        // g-drive is giving a different ID type, please suggest the solution
                        id: '5b9649d1f5acc923a497d1da',
                        value: '<a style="color:inherit;" target="_blank" href="'+JSON.parse(getDriveFiles.responseText).items[i].embedLink + '"' + '>'+ JSON.parse(getDriveFiles.responseText).items[i].title + '</a>'
                      });
                    }
                  }
                }
              };
              getDriveFiles.send();
            }
            

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
        }
      },
    };

    this.modulesLoaded = true;

  }

  playAudio() {
    this.postService.playAudio();
  }

  setTheme(set: string) {
    this.emojiNative = set === 'google';
    this.emojiSet = set;
  }
  handleClick($event) {
    this.editor.insertText(this.editorTextLength - 1, $event.emoji.native);
  }

  async getPendingTasks() {
    const getcurrentweek = moment(Date.now()).format('w');
    const taskDueToWeek;
    console.log(getcurrentweek);
    this.pendingToDoTaskCount = 0;
    this.pendingInProgressTaskCount = 0;
    this.isLoading$.next(true);
    this.groupService.getGroupTasks(this.group_id)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      console.log(this.pendingTasks);
      for(var i = 0; i < this.pendingTasks.length; i++){
        if(this.pendingTasks[i]['task']['status'] == 'to do'){
          taskDueToWeek = moment(this.pendingTasks[i]['task']['due_to']).format('w');
          console.log('Task week number', taskDueToWeek);
          if(taskDueToWeek === getcurrentweek){
            this.pendingToDoTaskCount++;
          }
          
        }
       if(this.pendingTasks[i]['task']['status'] == 'in progress'){
          taskDueToWeek = moment(this.pendingTasks[i]['task']['due_to']).format('w');
          console.log('Task week number', taskDueToWeek);
          if(taskDueToWeek === getcurrentweek){
            this.pendingInProgressTaskCount++;
          }
          
        }
      }
      console.log('To-do Tasks', this.pendingToDoTaskCount);
      console.log('In-Progress Tasks', this.pendingInProgressTaskCount);
      this.isLoading$.next(false);
    },
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err);
      this.isLoading$.next(false);
    });
  }

  async getCompletedTasks() {
    const getcurrentweek = moment(Date.now()).format('w');
    const taskDueToWeek;
    this.completedTaskCount = 0;
    this.isLoading$.next(true);
    this.groupService.getCompletedGroupTasks(this.group_id)
    .subscribe((res) => {
      this.completedTasks = res['posts'];
      console.log(this.completedTasks);
      for(var i = 0 ; i < this.completedTasks.length; i++){
        if(this.completedTasks[i]['task']['status'] == 'done'){
          taskDueToWeek = moment(this.completedTasks[i]['task']['due_to']).format('w');
          if(taskDueToWeek === getcurrentweek){
            this.completedTaskCount++;
          }
        }

      }
      this.isLoading$.next(false);
      this.todoPercent = Math.round(this.pendingToDoTaskCount/(this.pendingInProgressTaskCount+this.pendingToDoTaskCount+this.completedTaskCount)*100);
      this.inprogressPercent = Math.round(this.pendingInProgressTaskCount/(this.pendingInProgressTaskCount+this.pendingToDoTaskCount+this.completedTaskCount)*100);
      this.completedPercent = Math.round(this.completedTaskCount/(this.pendingInProgressTaskCount+this.pendingToDoTaskCount+this.completedTaskCount)*100);

    },
    (err) => {
      console.log('Error Fetching the Completed Tasks Posts', err);
      this.isLoading$.next(false);
    });

  }



}
