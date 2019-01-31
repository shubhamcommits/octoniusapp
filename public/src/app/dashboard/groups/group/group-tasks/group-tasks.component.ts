import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';
import * as io from 'socket.io-client';

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
  }

  constructor(private groupDataService: GroupDataService,
     private ngxService: NgxUiLoaderService, 
     private _activatedRoute: ActivatedRoute, 
     private userService: UserService,
     private groupService: GroupService, 
     private postService: PostService,
     private modalService: NgbModal) {
    this.user_data = JSON.parse(localStorage.getItem('user')); 
  }

  public editor;
  public editorTextLength;

  modules;
  modulesLoaded = false;

  pendingTasks = new Array();
  completedTasks = new Array();

  loadCount = 1;

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;

  datePickedCount = 0;
  timePickedCount = 0;

  selectedGroupUsers: any = new Array();
  groupUsersList: any = new Array();
  settings = {};
  model_date;

  members = [];
  allMembersId = [];
  files = [];
  content_mentions = [];

  assignment = 'Unassigned';

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
        // there are two scenarios:
        // 1. personal workspace task post: doesn't need assigned members so selectGroupUsers will be undefined
        // 2. group task post: needs one assigned member so selectgorupusers will be defined
        // assign_to become the id of the selected group user in groups
        // assign_to becomes the current user ID in the personal workspace
        _assigned_to: this.selectedGroupUsers[0] ? this.selectedGroupUsers[0]._id : JSON.parse(localStorage.getItem('user')).user_id,
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

      // console.log('Content Mention', post._content_mentions);
      //  console.log('This post', postId);
    }


    // console.log('post: ', post);
    this.postService.addNewTaskPost(formData)
      .subscribe((res) => {

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
        var division = document.getElementById('show_hide');
        division.style.display = 'none';
        this.content_mentions = [];
        this.post.content = '';
        this.selectedGroupUsers = [];
        this.assignment = 'Unassigned';
        this.getTasks();
        this.getCompletedTasks();
        

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
      console.log('quill content is changed!', quill);
      this.editorTextLength = quill.text.length
      console.log('length', this.editorTextLength);
    }

    mentionmembers() {
      var hashValues = [];
  
      var Value = [];
  
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
          }
        },
      };
  
    }
  
 toggle_div(){
  
   var division = document.getElementById('show_hide');
   if(division.style.display === 'none'){
     division.style.display = 'block';
   }
   else{
     division.style.display = 'none';
     this.selectedGroupUsers = [];
     this.post.content = '';
   }
 }

}
