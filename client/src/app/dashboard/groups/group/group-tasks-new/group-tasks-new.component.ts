import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { ColumnService } from '../../../../shared/services/column.service';
import { Column } from '../../../../shared/models/column.model';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import moment from 'moment';
import  io from 'socket.io-client';
import Swal from 'sweetalert2';
import {Subject} from "rxjs/Rx";
import {SearchService} from "../../../../shared/services/search.service";


import 'quill-mention';

import * as Quill from 'quill';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
declare var gapi: any;
declare var google: any;
import { saveAs } from 'file-saver';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragExit, CdkDragEnter, CdkDragStart } from '@angular/cdk/drag-drop';
import { isThisMonth, isThisQuarter } from 'date-fns';

@Component({
  selector: 'app-group-tasks-new',
  templateUrl: './group-tasks-new.component.html',
  styleUrls: ['./group-tasks-new.component.scss']
})
export class GroupTasksNewComponent implements OnInit {

  user_data;
  lastPostId;
  group_members;
  group: any;
  group_name;
  group_admins;
  groupId;
  isLoading$ = new BehaviorSubject(false);

  BASE_URL = environment.BASE_URL;
  socket = io(environment.BASE_URL);

  post = {
    type: 'task',
    title: '',
    content: ''
  };

  googleDriveFiles = [];

  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //
  developerKey = 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I';

  clientId = "971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com";

  scope = [
    'https://www.googleapis.com/auth/drive' //insert scope here
  ].join(' ');

  pickerApiLoaded = false;

  oauthToken?: any;
  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //

  constructor(private groupDataService: GroupDataService,
     private ngxService: NgxUiLoaderService,
     private _activatedRoute: ActivatedRoute,
     private userService: UserService,
     private groupService: GroupService,
     private postService: PostService,
     private searchService: SearchService,
     private columnService: ColumnService,
     private modalService: NgbModal,
     private quillInitializeService: QuillAutoLinkService,
     private _userService: UserService,
     private _router: Router) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  public editor;
  public editorTextLength;

  modules;
  modulesLoaded = false;

  pendingTasks = [];
  completedTasks = [];

  loadCount = 1;

  datePickedCount = 0;
  timePickedCount = 0;

  selectedGroupUsers: any = [];
  groupUsersList: any = [];
  settings = {};
  model_date;

  members = [];
  allMembersId = [];
  files = [];
  content_mentions = [];

  assignment = 'Unassigned';

  newTaskModalRef;

  user;

  filesToUpload = [];

  alert = {
    class: '',
    message: ''
  };

  edit_post_title = '';
  edit_post_content = null;

  editTaskModalRef;

  postBeingEditted;

  private _message = new Subject<string>();

  tags: any = new Array();
  tags_search_words: String = ''
  tags_search_result: any = new Array();

  newColumnModalRef;
  editColumnModalRef;
  allColumns;
  columnName;
  editColumnNameOld;
  editColumnNameNew;
  taskCount = [];
  taskList = [];
  taskIds = [];

  bgColor = [
    '#fd7714',
    '#0bc6a0',
    '#4a90e2',
    '#d46a6a',
    '#b45a81',
    '#674f91',
    '#4e638e',
    '#489074',
    '#4b956f',
    '#a7c763',
    '#d4cb6a',
    '#d49b6a',
    '#d4746a'
  ];

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.groupId = this.groupDataService.groupId;
    // this.group = this.groupDataService.group;
    // this.group_name = this.group ? this.group.group_name : null;
    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    //console.log('Data', this.groupDataService)
   // console.log('Id', this.groupId);
    this.getUserProfile();
    this.initColumns();
    this.getAllColumns();
    this.initTasks();
    this.getTasks();
    this.loadGroup();
    this.mentionmembers();
    this.initializeGroupMembersSearchForm();
  }

  // Socket io 

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
        if (this.groupId == data.groupId) {
        }
      });

      this.socket.on('disconnect', () => {
        //	console.log(`Socket disconnected from group`);
      });

    } else {
      setTimeout(() => {this.socketio(); count++}, 500);
    }

  }

  // Load group details

  loadGroup() {
    this.groupService.getGroup(this.groupId)
      .subscribe((res) => {
        this.group = res['group'];
        this.group_name = this.group.group_name;
        this.group_members = res['group']._members;
      // console.log(this.group_members);
        this.group_admins = res['group']._admins;
      //  console.log(this.group_admins);
      }, (err) => {
      });
  }

  /////// TASKS ///////

  // Get Tasks

  initTasks(){
    this.groupService.getGroupTasks(this.groupId)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      for(var i=0; i<this.allColumns.length; i++){
        var currentTasks = new Array();
        for(var j=0; j<this.pendingTasks.length; j++){
          if(this.pendingTasks[j]['task']['status'] == this.allColumns[i]['title']){
            currentTasks.push(this.pendingTasks[j]);
          }
        }
        this.taskList.push({
          title: this.allColumns[i]['title'],
          id: this.allColumns[i]['_id'],
          tasks: currentTasks
        });
        this.taskIds.push(this.allColumns[i]['_id']);
      }
    });
    console.log(this.taskIds);
  }

  getTasks() {
    this.isLoading$.next(true);
    this.groupService.getGroupTasks(this.groupId)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      for(var i=0; i<this.allColumns.length; i++){
        this.taskCount[this.allColumns[i]['title']] = 0;
      }
      for(var i=0; i<this.pendingTasks.length; i++){
        this.taskCount[this.pendingTasks[i]['task']['status']]++;
      }
      for(var i=0; i<this.allColumns.length; i++){
        this.updateColumnNumber(this.allColumns[i]['title'],this.taskCount[this.allColumns[i]['title']]);
      }
      for(var i=0; i<this.taskList.length; i++){
        this.taskList[i]['tasks'] = [];
      }
      for(var i=0; i<this.pendingTasks.length; i++){
        for(var j=0; j<this.taskList.length; j++){
          if(this.pendingTasks[i]['task']['status'] == this.taskList[j]['title']){
              this.taskList[j]['tasks'].push(this.pendingTasks[i]);
          }
        }
      }
      console.log(this.taskList);
      this.getAllColumns();
      this.isLoading$.next(false);
    },
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err);
      this.isLoading$.next(false);
    });
  }

  getTaskTimeSpent(taskPost) {
    if(taskPost.task.hasOwnProperty('started_at') && taskPost.task.hasOwnProperty('completed_at')){
      const start = moment(taskPost.task.started_at);
      const end = moment(taskPost.task.completed_at);
      const duration = moment.duration(end.diff(start)).asDays();
      return duration <= 1 ? 1 : Math.round(duration)
    }

  }

  // Change task Assignee

  changeTaskAssignee(postId, AssigneeId){
    const assigneeId ={
      'assigneeId':AssigneeId
    }
    this.groupService.changeTaskAssignee(postId, assigneeId)
    .subscribe((res) => {
      console.log('Post ID', postId);
      console.log('Assignee ID', assigneeId);
      console.log('Task Assignee', res);
      this.getTasks();
      this.socket.emit('getNotifications', this.user_data.user_id);
    }, (err) => {
      console.log('Error changing the Task Assignee', err);
    });
  }

  // Delete Tasks

  deleteTask(post) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((confirmed) => {
      if (confirmed) {
        this.postService.deletePost(post._id)
          .subscribe((res) => {
           const indexTask = this.completedTasks.findIndex(task => task._id == post._id)
            if (post.task.status === 'done') {
              this.completedTasks.splice(indexTask, 1);
            } else {
              this.pendingTasks.splice(indexTask, 1);
            }
            this.getTasks();
          });
      }
    });
  }

  // Add new tasks 

  addNewTaskPost() {
    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;

    if (files !== null) {
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i], files[i]['name']);
      }
    }

    // create due date
    const date = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    const post = {
      title: this.post.title,
      content: this.post.content,
      type: 'task',
      _posted_by: this.user_data.user_id,
      _group: this.groupId,
      task: {
        due_date: moment(date).format('YYYY-MM-DD hh:mm:ss.SSS'),
        due_to: moment(date).format('YYYY-MM-DD'),
        _assigned_to: this.selectedGroupUsers[0]._id,
        _content_mentions: this.content_mentions
      }
    };

    // Handle google drive files
    const driveDivision = document.getElementById('google-drive-file');

    if (driveDivision.innerHTML === '' || driveDivision.innerHTML == null) {
      formData.append('content', post.content);
    } else {
      formData.append('content', post.content + driveDivision.innerHTML);
    }

    formData.append('title', post.title);
    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('task.due_to', post.task.due_to);

    // if the user is using his personal workspace I want to automatically assign the task to him/her
    // If the user is posting a task in a group I want to assign it to the member he/she chose.
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
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        formData.append('_content_mentions', this.content_mentions[i]);
      }
    }


        //here we add the tags
        if(this.tags.length>0){
          for (let i = 0; i < this.tags.length; i++) {
            formData.append('tags', this.tags[i]);
          }
        }

    // console.log('post: ', post);
    this.postService.addNewTaskPost(formData)
      .subscribe((res) => {
        // what we need to do is add this fresh task to the tasks we already fetched
        this.pendingTasks.push(res['post']);

        this.resetNewPostForm()

        // close the modal
        this.newTaskModalRef.close();

        // this is the data we enter in the socket so that people who are in groups
        // activity page will get an update
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.groupId,
          type: 'post'// Pass group id here!!!
        };

        this.getTasks();

        this.socket.emit('newPost', data);
        this.tags = [];

      }, (err) => {
        console.log('Error received while adding the taks', err)
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

  resetNewPostForm() {
    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    this.assignment = 'Unassigned';
    this.selectedGroupUsers = [];
    this.post.title = '';
    this.post.content = '';
    this.edit_post_title = '';
    this.edit_post_content = '';
    this.filesToUpload = [];
  }

  mentionmembers() {
    let hashValues = [];

  let Value = [];

  this.groupService.getGroup(this.groupId)
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

  this.groupService.getGroupFiles(this.groupId)
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

        console.log('searchterm', searchTerm);

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
          console.log('matches', matches);
          renderList(matches, searchTerm);
        }
      }
    },
  };

  this.modulesLoaded = true;

  }

  onSearch(evt: any) {
  this.groupUsersList = [];
  this.groupService.searchGroupUsers(this.groupId, evt.target.value)
    .subscribe((res) => {
      this.groupUsersList = res['users'];

    }, (err) => {

    });
  }

  // Google drive Auth API

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
        enableFeature(google.picker.Feature.NAV_HIDDEN).
        setOAuthToken(authResult.access_token).
        addView(view).
        addView(new google.picker.DocsUploadView()).
        setCallback(function (e) {
          if (e[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            let doc = e[google.picker.Response.DOCUMENTS][0];
            src = doc[google.picker.Document.URL];

            this.googleDriveFiles = e[google.picker.Response.DOCUMENTS];

            const driveDivision = document.getElementById('google-drive-file');
            driveDivision.style.display = 'block';
            driveDivision.innerHTML = '<b>Drive File Upload: </b>'+'<a href=\''+src+'\' target=\'_blank\'>'+this.googleDriveFiles[0]['name']+'</a>';
          }
        }).
        build();
        picker.setVisible(true);
      }
    }

  }

  // Quill editor 

  onEditorBlured(quill) {
    console.log('editor blur!', quill);
  }

  onEditorFocused(quill) {
    console.log('editor focus!', quill);
  }

  onEditorCreated(quill) {
    this.editor = quill;
    console.log('quill is ready! this is current quill instance object', quill);
    // quill.insertText(0,'hello', 'bold', true);
  }

  onContentChanged(quill) {
  this.editorTextLength = quill.text.length;
  }

  // Items 

  onItemSelect(item: any) {
    if (this.selectedGroupUsers.length >= 1) {
      this.assignment = 'Assigned';
    }
  }

  OnItemDeSelect(item: any) {
    if (this.selectedGroupUsers.length < 1) {
      this.assignment = 'Unassigned';
    }

  }

  onSelectAll(items: any) {
    this.assignment = 'Assigned';
  }

  onDeSelectAll(items: any) {
    this.assignment = 'Unassigned';

  }

  // Tags 

  addTags(event: any) {
    //keyCode= 13 represents enter key
    // in else case we are making use of mouse click
    if(event.keyCode == 13){
        const tag = document.getElementById('tags');
        this.tags.push(tag['value']);
        tag['value'] = '';
  
      console.log(this.tags);
    }
  
    if (event.which == '13') {
      event.preventDefault();
    }
  
  }
  
  removeTag(index) {
    this.tags.pop(index);
  }
  
  tagListSearch(){
    console.log("here1")
    if (this.tags_search_words !== '') {
      console.log("here12")
      this.searchService.getTagsSearchResults(this.tags_search_words)
      .subscribe((res) => {
  
         if (res) {
          this.tags_search_result = res['results'];
        } 
      }, (err)=>{
        console.log('Error while searching', err);
      });
    }else{
      console.log("here13")
    }
  }
  
  clickedOnTag(index){
    var tagsFromList = this.tags_search_result[index]["tags"]
    this.tags.push(tagsFromList);;
    this.tags_search_words = '';
    console.log(this.tags);
  } 

  /////// POSTS ///////

  // Get posts

  loadNextPosts(lastPostId){

    this.isLoading$.next(true);

    this.groupService.getRecentGroupTasks(lastPostId, this.groupId)
      .subscribe((res) => {
       console.log('CompletedTasks', res);
        this.completedTasks = this.completedTasks.concat(res['posts']);
       this.isLoading$.next(false);
       if(res['posts'].length == 0){
        this.loadCount = 0;
      }

      else{
        this.loadCount = 1;
      }

      }, (err) => {
        console.log('Error Fetching the Next Completed Tasks Posts', err)

      });
  }

  OnFetchNextPosts(){
    var lastPostId = this.completedTasks[this.completedTasks.length - 1]._id;
    this.loadNextPosts(lastPostId);
  }

  // Edit Posts

  editPost() {
    // const editor = document.getElementById('edit-content-' + index);
 const post = this.postBeingEditted;
    // we create a new date object
    const date_due_to = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);
 
    console.log('this.contentMentions', this.content_mentions);
 
    const postData = {
      'title': this.edit_post_title,
      'content': this.edit_post_content,
      '_content_mentions': this.content_mentions,
      'type': 'task',
      'assigned_to': [this.selectedGroupUsers[0]],
      'date_due_to': moment(date_due_to).format(),
      'status': post.task.status,
      'tags': this.tags
    };
 
    const scanned_content = postData.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;
 
    if (el.getElementsByClassName('mention').length > 0) {
      //  console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
        this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id'].toString());
      }
    }
 
    if(this.tags.length>0){
     for(let i = 0 ; i < this.tags.length; i ++){
       post.tags = this.tags;
     }
   }
 
    this.postService.editPost(post._id, postData)
      .subscribe((res) => {
 
        this.alert.class = 'success';
        this._message.next(res['message']);
        this.resetNewPostForm();
 
        // mirror forntend to backend
        if (post.task.status === 'done') {
          const indexTask = this.completedTasks.findIndex((task) => task._id === post._id);
          this.completedTasks[indexTask] = res['post'];
        } else {
          const indexTask = this.pendingTasks.findIndex((task) => task._id === post._id);
          this.pendingTasks[indexTask] = res['post'];
        }
 
        this.editTaskModalRef.close();
 
        // socket notifications
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.groupId,
          type: 'post'
        };
 
        this.socket.emit('newPost', data);
        this.content_mentions = [];
        this.tags = [];
      }, (err) => {
 
        this.alert.class = 'danger';
        this.content_mentions = [];
        this.tags = [];
 
        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }
 
      });
  }

  OnSaveEditPost(index, post) {
    const editor = document.getElementById('edit-content-' + index);

    // we create a new date object based on whether we added time
    const date_due_to = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    const postData = {
      'content': document.getElementById(index).innerHTML,
      '_content_mentions': this.content_mentions,
      'type': post.type,
      'assigned_to': this.selectedGroupUsers,
      'date_due_to': moment(date_due_to).format(),
      'status': post.task.status
    };


    const scanned_content = postData.content;
    let el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {
      //  console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (let i = 0; i < el.getElementsByClassName('mention').length; i++) {
        this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id'].toString());
      }
    }

    this.postService.editPost(post._id, postData)
      .subscribe((res) => {

        this.alert.class = 'success';
        this._message.next(res['message']);
        this.resetNewPostForm();


        if (postData.status === 'done') {
          const postIndex = this.completedTasks.findIndex((task) => post._id == task._id);
          this.completedTasks[postIndex] = res.post;
        } else {
          const postIndex = this.pendingTasks.findIndex((task) => post._id == task._id);
          this.pendingTasks[postIndex] = res.post;
        }

        // socket notifications
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.groupId,
          type: 'post'
        };

        this.socket.emit('newPost', data);
        this.content_mentions = [];

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

  // User Profile

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        // this.profileImage = res.user['profile_pic'];
        // this.profileImage = this.BASE_URL + `/uploads/${this.profileImage}`;
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

  // Like/Dislike Posts

  userLikedPost(post) {

    const currentUserId = this.user_data.user_id;
    // see is the current user is one of the users who liked this post
    const index = post._liked_by.findIndex( user => user == currentUserId);
    return index > -1;
  }
 
  onClickLikePost(index, post) {
 
 
     // const like_icon = document.getElementById('icon_like_post_' + index);
     const postData = {
       '_id': post._id,
       'user_id': this.user_data.user_id,
       '_liked_by': post._liked_by,
       'type_post': post.task.status === 'done' ? 'completed' : 'pending'
     };
 
     if (postData._liked_by.length == 0) {
       this.likepost(postData);
     } else {
       let userHasLikedPost = false;
 
       // we check whether the user is one of the likes we already have
       postData._liked_by.forEach((user) => {
         if ( user == this.user_data.user_id ) {
           userHasLikedPost = true;
         }
       });
 
       // we like the post when the user is not between the users that liked the post
       // and we unlike the post when it is
       if (!userHasLikedPost) {
         this.likepost(postData);
       } else {
         this.unlikepost(postData);
       }
     }
  }

  likepost(post) {

    this.postService.like(post)
      .subscribe((res) => {
        // find the post we are currently handling
        // we differentiate between pending posts and completed posts so we can update the right ones
        if (post.type_post === 'pending') {
          const indexLikedPost = this.pendingTasks.findIndex((_post) => {
            return _post._id === post._id;
          });

          this.pendingTasks[indexLikedPost]._liked_by.push(this.user_data.user_id);

        } else if (post.type_post === 'completed') {
          console.log('entered complete zone')
          // completed tasks differentiate from the pending one
          // so we have to update a different array
          const indexLikedPost = this.completedTasks.findIndex((_post) => {
            return _post._id === post._id;
          });
          console.log('indexLikePost', indexLikedPost);
          this.completedTasks[indexLikedPost]._liked_by.push(this.user_data.user_id);
          console.log('end zone', this.completedTasks[indexLikedPost]);
        }

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

  unlikepost (post) {
    const currentUserId = JSON.parse(localStorage.getItem('user')).user_id;

    this.postService.unlike(post)
      .subscribe((res) => {
        // this.alert.class = 'success';
        // this._message.next(res['message']);

        // find the index of the like
        const indexLike = post._liked_by.findIndex(user => user == currentUserId);

        // find the index of the post we are currently handling
        if (post.type_post === 'pending') {
          const indexUnlikedPost = this.pendingTasks.findIndex((_post) => {
            return _post._id === post._id;
          });
          this.pendingTasks[indexUnlikedPost]._liked_by.splice(indexLike, 1);
        } else {
          // completed tasks differentiate from the pending ones
          // so we have to update a different array
          const indexUnlikedPost = this.completedTasks.findIndex((_post) => {
            return _post._id === post.post_id;
          });
          this.completedTasks[indexUnlikedPost]._liked_by.splice(indexLike, 1);
        }
      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  // File/Audio I/O

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
    // this.product.photo = fileInput.target.files[0]['name'];
  }

  onDownlaodFile(fileName) {

    // const fileData = {
    //   'fileName': fileName
    // };

    this.groupService.downloadGroupFile(this.group._id, fileName)
      .subscribe((file_toDownload) => {

        //   console.log('Downloaded File', file);
        saveAs(file_toDownload, fileName);

      }, (err) => {
        //  console.log('Downloaded File err', err);

      });
  }

  playAudio() {
    const audio = new Audio();
    audio.src = "/assets/audio/intuition.ogg";
    audio.load();
    audio.play();
  }

  /////// MODALS ///////

  // Open modals

  openNewTaskModal(newTaskModal) {
    this.newTaskModalRef = this.modalService.open(newTaskModal, { centered: true, size: "lg" });
  }

  openNewColumnModal(newColumnModal) {
    this.newColumnModalRef = this.modalService.open(newColumnModal, { centered: true, size: "lg" });
  }

  openEditColumnModal(editColumnModal, columnName) {
    this.editColumnNameOld = columnName;
    this.editColumnNameNew = columnName;
    this.editColumnModalRef = this.modalService.open(editColumnModal, { centered: true, size: "lg" });
  }

  openEditTaskModal(taskmodal, post) {
    this.postBeingEditted = post;
    this.assignment = 'Assigned';
    this.tags = this.postBeingEditted.tags;
 
    console.log('post.assign', post.task._assigned_to);
    this.selectedGroupUsers = [post.task._assigned_to];
    // this isn't present at first so we need to add the full name so we can display it in the assign modal
    post.task._assigned_to.full_name = post.task._assigned_to.first_name + " " + post.task._assigned_to.last_name;
    this.groupUsersList = [post.task._assigned_to];
 
    this.edit_post_title = post.title;
    this.edit_post_content = post.content;
 
    this.model_date = {
      day: moment(post.task.due_to, "YYYY-MM-DD").date(),
      month: moment(post.task.due_to, "YYYY-MM-DD").month() + 1,
      year: moment(post.task.due_to, "YYYY-MM-DD").year()
    };
    this.editTaskModalRef = this.modalService.open(taskmodal, {centered: true, size: "lg"});
  }
 
  // Open pickers

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
    }
  }

  // Ready to add 

  readyToAddTask() {
   return !this.selectedGroupUsers[0] || !this.model_date || this.post.content === '';
  }

  readyToAddColumn() {
  return !this.columnName;
  }

  readyToEditColumnName() {
    return this.editColumnNameNew == this.editColumnNameOld;
  }

  readyToDeleteColumn() {
    return this.taskCount[this.editColumnNameOld] || this.editColumnNameNew != this.editColumnNameOld;
  }

  readyToEditTask() {
    return !this.selectedGroupUsers[0] || !this.model_date || this.edit_post_content.content === '';
  } 

  // Close modals

  closeCreatePostModal() {
    this.newTaskModalRef.close();
  }

  closeNewColumnModal() {
     this.newColumnModalRef.close();
  }

  closeEditColumnModal() {
     this.editColumnModalRef.close();
  }

  /////// COLUMNS ///////

  // Get Columns 

  initColumns(){
    this.columnService.initColumns(this.groupId).subscribe(() => {
      this.getAllColumns();
    });   
  }

  getAllColumns(){
    this.columnService.getAllColumns(this.groupId).subscribe((res: Column) => {
      this.allColumns = res.columns;
    }); 
  }

  // Add Columns 

  addNewColumn(){
    this.columnService.addColumn(this.groupId, this.columnName).subscribe(() => {
      this.getAllColumns();
    });
    this.newColumnModalRef.close();
    this.taskList.push({
      title:this.columnName,
      id:this.allColumns[this.allColumns.length-1]['_id'],
      tasks: []
    });
    this.taskIds.push(this.allColumns[this.allColumns.length-1]['_id']);
  }

  // Delete Columns

  deleteColumn(columnName){
    this.columnService.deleteColumn(this.groupId, columnName).subscribe(() => {
      this.getAllColumns();
      this.closeEditColumnModal();
    });
    for(var i=0; i<this.taskList.length; i++){
      if(this.taskList[i]['title'] == columnName){
        this.taskList.splice(i,1);
      }
    }
    for(var i=0; i<this.allColumns.length; i++){
      if(this.allColumns[i]['title'] == columnName){
        this.taskIds.splice(i,1);
      }
    }
    console.log(this.taskList);
  }

  // Edit Columns

  editColumnName(){
    this.columnService.editColumnName(this.groupId,this.editColumnNameOld, this.editColumnNameNew).subscribe((res) => {
      this.getAllColumns();
      this.closeEditColumnModal();
    });
    const statusUpdate = {
      'status' : this.editColumnNameNew
    }
    console.log(this.editColumnNameNew);
    for(var i=0; i<this.taskList.length; i++){
      if(this.taskList[i]['title'] == this.editColumnNameOld){
        this.taskList[i]['title'] = this.editColumnNameNew;
      }
    }
    for(var i=0; i<this.pendingTasks.length; i++){
      if(this.pendingTasks[i]['task']['status'] == this.editColumnNameOld){
        console.log(this.pendingTasks[i]['_id']);
        this.postService.complete(this.pendingTasks[i]['_id'],statusUpdate)
        .subscribe((res) => {
          this.getTasks();
          this.getAllColumns();
        }, (err) => {
          console.log('Error:', err);
        });
      }
    }
    
  }

  // Update Columns

  updateColumnNumber(columnName, numberOfTasks){
    this.columnService.editColumnNumber(this.groupId, columnName, numberOfTasks).subscribe((res) => {
      console.log('column number updated');
    });
  }

  updateTaskColumn(post_id, oldColumnName, newColumnName){
    const statusUpdate = {
      'status' : newColumnName
    }
    console.log(post_id);
    this.postService.complete(post_id,statusUpdate)
    .subscribe((res) => {
      this.columnService.addColumnTask(this.groupId, newColumnName).subscribe((res) => {
        console.log(res);
      });
      this.columnService.deleteColumnTask(this.groupId, oldColumnName).subscribe((res) => {
        console.log(res);
      });
      this.getAllColumns();
      this.getTasks();
    }, (err) => {
      console.log('Error:', err);
    });
  }

  onTaskDrop(event: CdkDragDrop<any[]>){
    if(event.previousContainer == event.container){
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }else{
      var oldCol = event.previousContainer.data[event.previousIndex]['task']['status'];
      var postId = event.previousContainer.data[event.previousIndex]['_id'];
      var newCol = event.container.data[event.currentIndex]['task']['status'];
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      console.log(postId);
      console.log(oldCol);
      console.log(newCol);
      this.updateTaskColumn(postId, oldCol, newCol);
    } 
    this.changeBg = '#000'; 
    console.log(this.changeBg);
  }

  onTrackDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.changeBg = '#000'; 
    console.log(this.changeBg);
  }

  changeBg = 'none';

  entered(event: CdkDragStart<any[]>){  
    this.changeBg = '#fff'; 
    console.log(this.changeBg);
  } 

} 
