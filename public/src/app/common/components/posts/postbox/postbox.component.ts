import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";


declare var gapi: any;
declare var google: any;

import * as Quill from 'quill';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, first, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs/Subject";
import * as moment from "moment";
import {InputValidators} from "../../../validators/input.validator";
import {GroupService} from "../../../../shared/services/group.service";
import {PostService} from "../../../../shared/services/post.service";
import { AuthService } from '../../../../shared/services/auth.service';
import { GoogleCloudService } from '../../../../shared/services/google-cloud.service';
(window as any).Quill = Quill;

@Component({
  selector: 'postbox',
  templateUrl: './postbox.component.html',
  styleUrls: ['./postbox.component.scss']
})
export class PostboxComponent implements OnInit, OnDestroy {
  // data we receive from parent component
  @Input('user') user;
  @Input('isItMyWorkplace') isItMyWorkplace;
  @Input('modules') modules;
  @Input('group') group;
  @Input('socket') socket;
  // the IDs of all the members of the group
  @Input('allMembersId') allMembersId;
  @Input('user_data') user_data;
  @Input('modulesLoaded') modulesLoaded;

  @Output('newPost') newPost = new EventEmitter();

  // unsubscribe at end component lifecycle
  ngUnsubscribe = new Subject();

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  // whether we display the postbox in the template or not
  postboxDisplayed = false;

  postForm: FormGroup;

  // form data
  model_date;
  model_time;
  assignment = 'UnAssigned';
  post = {
    type: 'normal',
    content: ''
  };
  selectedGroupUsers = [];

  // mentions
  content_mentions = [];

  // files
  filesToUpload = [];

  // Quill editor
  editor;
  editorTextLength;

  // multi select assign
  groupUsersList = [];
  settings;

  processing = false;

  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //
  developerKey = 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I';

  clientId = '971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com';

  scope = [
    'https://www.googleapis.com/auth/drive'//insert scope here
  ].join(' ');

  pickerApiLoaded = false;

  oauthToken?: any;

  googleDriveFiles = [];
  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //

  //GOOGLE CALENDAR
  timeZone: any;

  //Tags to the post
  tags: any = new Array();

  constructor(
    private modalService: NgbModal,
    private groupService: GroupService,
    private postService: PostService, 
    private authService: AuthService,
    private googleService: GoogleCloudService) { }

  async ngOnInit() {
    this.inilizePostForm();
    //  redo this later
    this.alertMessageSettings();
      //this.getGoogleCalendarEvents();
      this.googleService.refreshGoogleToken()
      .then( async () => {
        await this.googleService.getGoogleCalendarEvents();
      });

      

  }

  addNewEventPost() {
    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    const assignedUsers = [];

    const googleCalendarAttendees = new Array();

    if (files !== null) {
      // add the files to the formData
      if (files !== null) {
        for (let i = 0 ; i < files.length ; i++) {
          formData.append('attachments', files[i], files[i]['name']);
        }
      }
    }

    // if it is my workplace section I want to assign the event to only the current user
    // if it's not I use all the members of the group that the user has selected
    if (!this.isItMyWorkplace) {
      this.selectedGroupUsers.forEach((selectedUser) => {
        formData.append('event._assigned_to', selectedUser._id);
        googleCalendarAttendees.push({email: selectedUser.email});
      });
    } else {
      formData.append('event._assigned_to', this.user_data.user_id);
    }

    // create date object for this event
    const date = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day, this.model_time.hour, this.model_time.minute);

    // post data
    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group._id,
      event: {
        due_date: moment(date).format('YYYY-MM-DD'),
        due_time: moment(date).format('HH:mm:ss.SSS'),
        due_to: moment.utc(date).format(),
        // problem: assignedUsers will always be empty
        _assigned_to: assignedUsers,
        _content_mentions: this.content_mentions
      },
      files: this.filesToUpload
    };

    // Handling Google drive documents
    const driveDivision = document.getElementById('google-drive-file');

    if ( driveDivision.innerHTML === '' || driveDivision.innerHTML === null ) {
      formData.append('content', post.content);
    } else {
      formData.append('content', post.content + driveDivision.innerHTML);
    }

    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('event.due_to', post.event.due_to);

    // Handling mentions ( perhaps turn this into separate method since we're repeating ourselves )
    const scanned_content = post.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      for ( let i = 0; i < el.getElementsByClassName('mention').length; i++ ) {
        if ( el.getElementsByClassName('mention')[i]['dataset']['value'] === "all" ) {
          // Merge the two arrays
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id'])) {
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
          }
        }
      }

      for (let i = 0; i < this.content_mentions.length; i++) {
        formData.append('_content_mentions', this.content_mentions[i]);
      }
    }

        //here we add the tags
        if(this.tags.length>0){
          for (let i = 0; i < this.tags.length; i++) {
            formData.append('tags', this.tags[i]);
          }
        }
        
    

    this.processing = true;
    this.disablePostForm();

    // SERVER REQUEST
    this.postService.addNewEventPost(formData)
      .subscribe(async (res) => {
        this.resetAndEnablePostForm(res, driveDivision);
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group._id, // Pass group id here!!!
          type: 'post'
        };

        //this.insertEvent(date, post.type, post.content, googleCalendarAttendees);

        this.socket.emit('newPost', data);

        // previously we reloaded the posts, but now we send it back to the parent component
        // where we can add it to the other posts that were already loaded
        this.newPost.emit(res['post']);

        //adding events to google calendar
        // refer the google apis to check the implementation
        if(localStorage.getItem('google-cloud') != null && localStorage.getItem('google-cloud-token') != null){

          const googleEvent ={
            start: {
              dateTime: moment(date).format('YYYY-MM-DDTHH:mm:ssZ'),
              timeZone: this.timeZone
            },
            end:{
              dateTime:moment(date).format('YYYY-MM-DDTHH:mm:ssZ'),
              timeZone: this.timeZone
            },
            summary: 'Event | Octonius',
            description: post.content,
            attendees: googleCalendarAttendees
          }

          this.googleService.addToGoogleCalendar(googleEvent)
          .then(async (res)=>{
            console.log('Google Calendar Event Added');
            await this.googleService.getGoogleCalendarEvents();
          }, (err)=>{
            console.log('Error while adding event to google calendar', err);
          });
        }

        this.content_mentions = [];
        this.tags = [];
      }, (err) => {
        this.content_mentions = [];
        this.tags = [];
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

  // !--ADD NEW NORMAL POST--! //
  addNewNormalPost() {
    const formData: any = new FormData();

    const files: Array<File> = this.filesToUpload;

    // add the files to the formData
    if (files !== null) {
      for (let i = 0 ; i < files.length ; i++) {
        formData.append('attachments', files[i], files[i]['name']);
      }
    }

    // post data
    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user._id,
      _group: this.group._id,
      _content_mentions: this.content_mentions
    };

    // handle mentions ( this should probably be a separate function because we repeat it in three different functions
    const scanned_content = post.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      for ( let i = 0; i < el.getElementsByClassName('mention').length; i++ ) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          // Merge the two arrays
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          // if this user ID isn't present yet in the content_mentions array, then we add it
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id'])) {
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
          }
        }
      }

      // This code could probably be simplified, review later
      for (let i = 0; i < this.content_mentions.length; i++) {
        formData.append('_content_mentions', this.content_mentions[i]);
      }
    }

    // handle Google Drive uploads
    const driveDivision = document.getElementById('google-drive-file');

    if ( driveDivision.innerHTML === '' || driveDivision.innerHTML == null ) {
      formData.append('content', post.content);
    } else {
      formData.append('content', post.content + driveDivision.innerHTML);
    }

    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);

    //here we add the tags
    if(this.tags.length>0){
      for (let i = 0; i < this.tags.length; i++) {
        formData.append('tags', this.tags[i]);
      }
    }
    

    // When we submit the post we want to disable the confirm button and disable to avoid multiple HTTP requests & changes to forum
    this.processing = true;
    this.disablePostForm();

    // SERVER REQUEST
    this.postService.addNewNormalPost(formData)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        // reset the form after successfully adding a post
        this.resetAndEnablePostForm(res, driveDivision);

        // After successfully adding a new post we want to give live updates with sockets

        const data = {
          workspace: this.user_data.workspace.workspace_name,
          group: this.group.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group._id,  // Pass group id here!!!
          type: 'post' // used to differentiate between post and comment notifications
        };

        this.socket.emit('newPost', data);

        // previously we reloaded the posts, but now we send it back to the parent component
        // where we can add it to the other posts that were already loaded
        this.newPost.emit(res['post']);

        // reset the content mentions (perhaps earlier?)
        this.content_mentions = [];

        //reset the tags
        this.tags = [];

      }, (err) => {
        this.processing = false;
        this.content_mentions = [];
        this.tags = [];
        driveDivision.innerHTML = '';
        driveDivision.style.display = 'none';
        this.googleDriveFiles = [];
        this.alert.class = 'danger';
        this.enablePostForm();
      });
  }

  addNewTaskPost() {
    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    const googleCalendarAttendees = new Array();

    if (files !== null) {
      // add the files to the formData
      if (files !== null) {
        for (let i = 0 ; i < files.length ; i++) {
          formData.append('attachments', files[i], files[i]['name']);
        }
      }
    }

    // create due date
    const date = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group._id,
      task: {
        due_date: moment(date).format('YYYY-MM-DD hh:mm:ss.SSS'),
        due_to: moment(date).format('YYYY-MM-DD'),
        // there are two scenarios:
        // 1. personal workspace task post: doesn't need assigned members so selectGroupUsers will be undefined
        // 2. group task post: needs one assigned member so selectgorupusers will be defined
        // 1. assign_to becomes the current user ID in the personal workspace
        // 2. assign_to becomes the id of the selected group user in groups
        _assigned_to: this.selectedGroupUsers[0] ? this.selectedGroupUsers[0]._id : JSON.parse(localStorage.getItem('user')).user_id,
        _content_mentions: this.content_mentions
      }
    };

    // Handle Google Drive files
    const driveDivision = document.getElementById('google-drive-file');

    if (driveDivision.innerHTML === '' || driveDivision.innerHTML == null) {
      formData.append('content', post.content);
    } else {
      formData.append('content', post.content + driveDivision.innerHTML);
    }

    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('task.due_to', post.task.due_to);

    // if the user is using his personal workspace I want to automatically assign the task to him/her
    // If the user is posting a task in a group I want to assign it to the member he/she chose.
    formData.append('task._assigned_to', post.task._assigned_to);
    formData.append('task.status', 'to do');


    // handle mentions (turn this into a separate function because it is repeated over three functions)
    const scanned_content = post.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          // Merge the two arrays
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id'])) {
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
          }
        }
      }

      this.content_mentions.forEach((mention) => {
        formData.append('_content_mentions', mention);
      });
    }

    //here we add the tags
    if(this.tags.length>0){
      for (let i = 0; i < this.tags.length; i++) {
        formData.append('tags', this.tags[i]);
      }
    }


    this.processing = true;
    this.disablePostForm();

    //Adding attendees for the google calendar
    this.selectedGroupUsers.forEach((selectedUser) => {
      googleCalendarAttendees.push({email: selectedUser.email});
    });

    // SERVER REQUEST
    this.postService.addNewTaskPost(formData)
      .subscribe(async (res) => {
        this.resetAndEnablePostForm(res, driveDivision);

        const data = {
          workspace: this.user_data.workspace.workspace_name,
          group: this.group.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group._id,
          type: 'post'
        };

        // give live update to other users that a new post has been posted
        this.socket.emit('newPost', data);

        // send this post to parent component to display it with the other loaded posts
        this.newPost.emit(res['post']);

        const googletask= {
            start: {
              date: moment(Date.now()).format('YYYY-MM-DD'),
              timeZone: this.timeZone
            },
            end:{
              date:moment(date).format('YYYY-MM-DD'),
              timeZone: this.timeZone
            },
            summary: 'Task | Octonius',
            description: post.content,
            attendees: googleCalendarAttendees
        }

        //Adding Tasks notifications to google calendar as a form of google-event
        if(localStorage.getItem('google-cloud') != null && localStorage.getItem('google-cloud-token') != null){
          this.googleService.addToGoogleCalendar(googletask)
          .then(async (res)=>{
            console.log('Google Calendar Task Added');
            await this.googleService.getGoogleCalendarEvents();
          },(err)=>{
            console.log('Error while adding task to google calendar', err);
          });
        }

        this.content_mentions = [];
        this.tags = [];

      }, (err) => {
        this.content_mentions = [];
        this.tags = [];
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

  // we should make a separate component for these messages or handle them in service
  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }

  disablePostForm() {
    this.postForm.disable();
  }

  enablePostForm() {
    this.postForm.enable();
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  // create the form that handles the post content
  inilizePostForm() {
    this.postForm = new FormGroup({
      'postContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'tag': new FormControl(null)
    });
  }

  OnAddNewPost() {
    // we activate three different functions, but in the future we should probably look to turn this into one.
    switch (this.post.type) {
      case 'normal':
        this.addNewNormalPost();
        break;
      case 'event':
        this.addNewEventPost();
        break;
      case 'task':
        this.addNewTaskPost();
        break;
    }
    // this.show_hide_working_bar();
    this.postboxDisplayed = false;
  }

  onContentChanged(quill) {
    this.editorTextLength = quill.text.length;
  }

  onEditorCreated(quill) {
    this.editor = quill;
  }

  onSelectPostType(type) {
    // reset post data
    this.post.type = type;
    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    this.model_time = {hour: 13, minute: 30};
    this.selectedGroupUsers = [];
    this.assignment = 'UnAssigned';

    // I should probably handle the settings in the modal component itself
    switch (this.post.type) {
      case 'event':

        // I think this function will become obsolete once we implement ngStyle
        // this.icon_event_change_color();

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
        break;
    }
  }

  openAssignPicker() {
    // open the assign users modal
    this.postService.openAssignUsers.next(
      {
        options: {centered: true},
        selectedGroupUsers: this.selectedGroupUsers,
        group: this.group,
        settings: this.settings
      });

    // when the user completed adding users then we receive the result here
    this.postService.usersAssigned.subscribe((data: any) => {
      this.selectedGroupUsers = data.selectedGroupUsers || [];
      this.assignment = data.assignment || 'UnAssigned';
    });
  }

  resetNewPostForm() {
    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    this.model_time = {hour: 13, minute: 30};
    this.assignment = 'UnAssigned';
    this.selectedGroupUsers = [];
    this.filesToUpload = [];
  }

  resetAndEnablePostForm(res, driveDivision) {
    this.processing = false;
    this.enablePostForm();
    this.post.content = '';
    this.selectedGroupUsers = [];
    this.alert.class = 'success';
    this.assignment = 'UnAssigned';
    this._message.next(res['message']);
    this.filesToUpload = [];
    driveDivision.innerHTML = '';
    driveDivision.style.display = 'none';
    this.googleDriveFiles = [];
    this.postForm.reset();
  }

  setDate(pickedDate) {
    this.model_date = pickedDate;
  }

  setTime(pickedTime) {
    this.model_time = pickedTime;
  }

  // Show / hide the postbox
  togglePostbox() {
    this.postboxDisplayed = !this.postboxDisplayed;
  }

  usersSelected(users) {
    this.selectedGroupUsers = users;
    this.assignment = users.length < 1 ? "UnAssigned" : "Assigned";
  }

  // !--GOOGLE PICKER IMPLEMENTATION--! //
  loadGoogleDrive() {
    // if token already exist it just opens the picker else, it authenticates then follow the usual flow
    // auth -> get access_token -> opens the picker to choose the files
    if(localStorage.getItem('google-cloud-token')!= null){
      gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
      this.handleAuthResult(JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data)
    }
    else{
      gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) });
      gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
    }

  }

  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        'client_id': this.clientId,
        'scope': this.scope,
        'immediate': false,
        'approval_prompt':'force',
      },
      this.handleAuthResult);
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
  }

  handleAuthResult(authResult) {
    let src;
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        let view = new google.picker.View(google.picker.ViewId.DOCS);
        //view.setMimeTypes("image/png,image/jpeg,image/jpg,video/mp4, application/vnd.ms-excel ,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf, text/plain, application/msword, text/js, application/zip, application/rar, application/tar, text/html");
        let pickerBuilder = new google.picker.PickerBuilder();
        let picker = pickerBuilder.
        //enableFeature(google.picker.Feature.NAV_HIDDEN).
        setOAuthToken(authResult.access_token).
        //setOrigin(window.location.protocol + '//' + window.location.host).
        addView(view).
        addView(new google.picker.DocsUploadView()).
        setCallback(function (e) {
          if (e[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            let doc = e[google.picker.Response.DOCUMENTS][0];
            src = doc[google.picker.Document.URL];

            this.googleDriveFiles = e[google.picker.Response.DOCUMENTS];

            const driveDivision = document.getElementById('google-drive-file');
            driveDivision.style.display = 'block';
            driveDivision.innerHTML = '<b>Drive File Upload: </b>' + '<a href=\''+ src + '\' target=\'_blank\'>' + this.googleDriveFiles[0]['name'] + '</a>';
          }
        }).
        build();
        picker.setVisible(true);
      }
    }
  }
// !--GOOGLE PICKER IMPLEMENTATION--! //

  addTags() {
    const tag = document.getElementById('tags');
    this.tags.push(tag['value']);
    tag['value'] = '';
    console.log(this.tags);
  }

  removeTag(index) {
    this.tags.pop(index);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

