import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';
import * as io from 'socket.io-client';
import {Subject} from "rxjs/Rx";

import 'quill-mention';

import * as Quill from 'quill';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';


@Component({
  selector: 'app-group-tasks',
  templateUrl: './group-tasks.component.html',
  styleUrls: ['./group-tasks.component.scss']
})
export class GroupTasksComponent implements OnInit {

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
    content: ''
  };

  constructor(private groupDataService: GroupDataService,
     private ngxService: NgxUiLoaderService,
     private _activatedRoute: ActivatedRoute,
     private userService: UserService,
     private groupService: GroupService,
     private postService: PostService,
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

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;

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

  alert = {
    class: '',
    message: ''
  };

  edit_post_content = null;

  editTaskModalRef;

  postBeingEditted;

  private _message = new Subject<string>();

 async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.groupId = this.groupDataService.groupId;
    this.group = this.groupDataService.group;
    this.group_name = this.group ? this.group.group_name : null;
    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    //console.log('Data', this.groupDataService)
   // console.log('Id', this.groupId);
   this.getUserProfile();
    this.getTasks();
    this.getCompletedTasks();
    this.loadGroup();
    this.mentionmembers();
    this.initializeGroupMembersSearchForm();


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


  addNewTaskPost() {
    const formData: any = new FormData();

    // create due date
    const date = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    const post = {
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
    formData.append('content', post.content);
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


    // console.log('post: ', post);
    this.postService.addNewTaskPost(formData)
      .subscribe((res) => {
        // what we need to do is add this fresh task to the tasks we already fetched
        this.pendingTasks.push(res['post']);

        // make sure that we display the new task
        this.pendingToDoTaskCount = 1
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

        this.socket.emit('newPost', data);

      }, (err) => {
        console.log('Error received while adding the taks', err)
      });
  }


  loadGroup() {

    this.groupService.getGroup(this.groupId)
      .subscribe((res) => {
        this.group_members = res['group']._members;
      // console.log(this.group_members);
        this.group_admins = res['group']._admins;
      //  console.log(this.group_admins);
      }, (err) => {
      });
  }

  getTasks() {
    this.pendingToDoTaskCount = 0;
    this.pendingInProgressTaskCount = 0;
    this.isLoading$.next(true);
    this.groupService.getGroupTasks(this.groupId)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      for(var i = 0; i < this.pendingTasks.length; i++){
        if(this.pendingTasks[i]['task']['status'] == 'to do'){
          this.pendingToDoTaskCount = 1;
        }
       if(this.pendingTasks[i]['task']['status'] == 'in progress'){
          this.pendingInProgressTaskCount = 1;
        }
      }
      this.isLoading$.next(false);
      console.log('Tasks', res);
    },
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err);
      this.isLoading$.next(false);
    });
  }

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
      this.getCompletedTasks();
    }, (err) => {
      console.log('Error changing the Task Assignee', err);
    });
  }

  loadNextPosts(lastPostId)
  {

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


  OnMarkTaskCompleted(post_id){
    const post = {
      'status': 'done'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as Completed', res);
      this.getCompletedTasks();
      this.getTasks();

    }, (err) => {

      console.log('Error:', err);

    });

  }

  OnMarkTaskToDo(post_id){
    const post = {
      'status': 'to do'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as to do', res);
      this.getCompletedTasks();
      this.getTasks();

    }, (err) => {

      console.log('Error:', err);

    });

  }

  OnMarkTaskInProgress(post_id){
    const post = {
      'status': 'in progress'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as in Progress', res);
      this.getCompletedTasks();
      this.getTasks();

    }, (err) => {

      console.log('Error:', err);

    });

  }


  getCompletedTasks() {
    this.isLoading$.next(true);
    this.groupService.getCompletedGroupTasks(this.groupId)
    .subscribe((res) => {
      this.completedTasks = res['posts'];
      if(res['posts'].length == 0){
        this.loadCount = 0;
      }

      else{
        this.loadCount = 1;
      }
      this.isLoading$.next(false);
      console.log('Completed Tasks', res);
    },
    (err) => {
      console.log('Error Fetching the Completed Tasks Posts', err);
      this.isLoading$.next(false);
    });

  }

  onSearch(evt: any) {
    this.groupUsersList = [];
    this.groupService.searchGroupUsers(this.groupId, evt.target.value)
      .subscribe((res) => {
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

      console.log('this.modules', this.modules);

      this.modulesLoaded = true;

    }

  /////// MODALS

  openNewTaskModal(newTaskModal) {
    this.newTaskModalRef = this.modalService.open(newTaskModal, { centered: true, size: "lg" });
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
    }
  }

  userLikedPost(post) {

   const currentUserId = this.user_data.user_id;
   // see is the current user is one of the users who liked this post
   const index = post._liked_by.findIndex( user => user == currentUserId);
   return index > -1;
  }

  onClickLikePost(index, post) {


    // const like_icon = document.getElementById('icon_like_post_' + index);
    const postData = {
      'post_id': post._id,
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

readyToAddTask() {
   return !this.selectedGroupUsers[0] || !this.model_date || this.post.content === '';
}

  likepost(post) {

    this.postService.like(post)
      .subscribe((res) => {
console.log('AFTER RES', post);
        // find the post we are currently handling
        // we differentiate between pending posts and completed posts so we can update the right ones
        if (post.type_post === 'pending') {
          const indexLikedPost = this.pendingTasks.findIndex((_post) => {
            return _post._id === post.post_id;
          });

          this.pendingTasks[indexLikedPost]._liked_by.push(this.user_data.user_id);

        } else if (post.type_post === 'completed') {
          console.log('entered complete zone')
          // completed tasks differentiate from the pending one
          // so we have to update a different array
          const indexLikedPost = this.completedTasks.findIndex((_post) => {
            return _post._id === post.post_id;
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
            return _post._id === post.post_id;
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

  playAudio() {
    const audio = new Audio();
    audio.src = "/assets/audio/intuition.ogg";
    audio.load();
    audio.play();
  }

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

  resetNewPostForm() {
   this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
   this.assignment = 'UnAssigned';
   this.post.content = '';
   this.edit_post_content = '';
 }

 openEditTaskModal(taskmodal, post) {
   this.postBeingEditted = post;
   this.assignment = 'Assigned';

   console.log('post.assign', post.task._assigned_to);
   this.selectedGroupUsers = [post.task._assigned_to];
   // this isn't present at first so we need to add the full name so we can display it in the assign modal
   post.task._assigned_to.full_name = post.task._assigned_to.first_name + " " + post.task._assigned_to.last_name;
   this.groupUsersList = [post.task._assigned_to];

   this.edit_post_content = post.content;

   this.model_date = {
     day: moment(post.task.due_to, "YYYY-MM-DD").date(),
     month: moment(post.task.due_to, "YYYY-MM-DD").month() + 1,
     year: moment(post.task.due_to, "YYYY-MM-DD").year()
   };
   this.editTaskModalRef = this.modalService.open(taskmodal, {centered: true, size: "lg"});
 }

 readyToEditTask() {
   return !this.selectedGroupUsers[0] || !this.model_date || this.edit_post_content.content === '';
 }

 editPost() {
   // const editor = document.getElementById('edit-content-' + index);
const post = this.postBeingEditted;
   // we create a new date object
   const date_due_to = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

   console.log('this.contentMentions', this.content_mentions);

   const postData = {
     'content': this.edit_post_content,
     '_content_mentions': this.content_mentions,
     'type': 'task',
     'assigned_to': [this.selectedGroupUsers[0]],
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
     }, (err) => {

       this.alert.class = 'danger';
       this.content_mentions = [];

       if (err.status) {
         this._message.next(err.error.message);
       } else {
         this._message.next('Error! either server is down or no internet connection');
       }

     });
 }

 deleteTask(post) {
   swal({
     title: "Are you sure?",
     text: "You won't be able to revert this!",
     icon: "warning",
     dangerMode: true,
     buttons: ["Cancel", "Yes, delete it!"]
   }).then((confirmed) => {
     if (confirmed) {
       this.postService.deletePost(post._id)
         .subscribe((res) => {
           if (post.task.status === 'done') {
             const indexTask = this.completedTasks.findIndex(task => task._id == post._id)
             this.completedTasks.splice(indexTask, 1);
           } else {
             const indexTask = this.pendingTasks.findIndex(task => task._id == post._id)
             this.pendingTasks.splice(indexTask, 1);
           }
         });
     }
   });
 }

}
