  import * as moment from 'moment';
  import * as io from 'socket.io-client';
  import { Component, OnInit, ViewChild, Testability, ViewContainerRef } from '@angular/core';
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
  import {SnotifyService, SnotifyPosition, SnotifyToastConfig} from 'ng-snotify';
  import {NgbPopoverConfig} from '@ng-bootstrap/ng-bootstrap';
  import { ScrollToService } from 'ng2-scroll-to-el';
  import 'quill-mention';
  import { environment } from '../../../../../environments/environment';

  @Component({
    selector: 'app-group-activity',
    templateUrl: './group-activity.component.html',
    styleUrls: ['./group-activity.component.scss'],
    providers: [NgbPopoverConfig]
  })
  export class GroupActivityComponent implements OnInit {
    posts = new Array();
    group_id;
    group;
    group_name;

    socket = io(environment.BASE_URL);
    BASE_URL = environment.BASE_URL;
    show_new_posts_badge = 0;

   values = [
      { id: 1, value: 'Fredrik Sundqvist' },
      { id: 2, value: 'Patrik Sjölin' }
    ];

    members = [];
    files = [];

    public editor;

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
      post_id: ''
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

    modules = {};


    constructor(private _activatedRoute: ActivatedRoute, private _router: Router,
      private _userService: UserService,
      public groupDataService: GroupDataService,
      private router: Router, private groupService: GroupService,
      private modalService: NgbModal, private postService: PostService, private _sanitizer: DomSanitizer,
      private ngxService: NgxUiLoaderService, private snotifyService: SnotifyService, config: NgbPopoverConfig,
      private scrollService: ScrollToService) {
        config.placement = 'top';
        config.triggers = 'hover';
        this.group_id = this.groupDataService.groupId;
        this.user_data = JSON.parse(localStorage.getItem('user'));
       // console.log('user', this.user_data);

        this.group = this.groupDataService.group;
        this.socket.on('connect', () => {
          console.log(`Socket connected!`);});
          this.loadGroup();
          this.socketio();

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
      quill.insertText(0,'hello', 'bold', true);
    }

    onContentChanged({ quill, html, text }) {
      console.log('quill content is changed!', quill, html, text);
    }
    transform(html: string) : SafeHtml {
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


    ngOnInit() {
      this.ngxService.start(); // start foreground loading with 'default' id
  
      // Stop the foreground loading after 5s
      setTimeout(() => {
        this.ngxService.stop(); // stop foreground loading with 'default' id
      }, 500);
      this.group_id = this.groupDataService.groupId;
      this.user_data = JSON.parse(localStorage.getItem('user'));
     // console.log('user', this.user_data);

      this.group = this.groupDataService._group;
      console.log('Group bkl', this.group_id);

      this.getUserProfile();
      this.inilizePostForm();
      this.inilizeCommentForm();
      this.loadGroupPosts();
      this.alertMessageSettings();
      this.initializeGroupMembersSearchForm();
      this.scrollToTop('#card-normal-post-4');
      this.mentionmembers();


     
    }

    ngAfterViewChecked(){
     // this.socketio();
    }

    loadGroup() {
      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
         // console.log('Group: ', res);
          this.group_name = res['group'].group_name;

  
        }, (err) => {
  
          console.log('err: ', err);
  
        });
  
    }
  

    socketio()
    {
      
			// start socket!
		//	var socket = io();

			// On connect, join the Group room
		

				// get workspace and group names
				const room = {
        workspace: this.user_data.workspace.workspace_name,
        group: this.group_name,
				}

				// join room to get notifications for this group
				this.socket.emit('join', room, (err) => {
          console.log(`Socket Joined`);

				});

			// Alert on screen when newPost is created
		this.socket.on('newPostOnGroup', (data) => {
      this.show_new_posts_badge=1;
     // alert(data);
      console.log('value', this.show_new_posts_badge);
    	});

			this.socket.on('disconnect', () => {
				console.log(`Socket disconnected from group`);
			});
    }


    fileChangeEvent(fileInput: any) {
      this.filesToUpload = <Array<File>>fileInput.target.files;
      console.log('files', this.filesToUpload);

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

    navigate_to_group(group_id){
      //this.router.navigate(['../dashboard','group',group_id,'activity']);
      window.location.href = this.BASE_URL+'#/dashboard/group/'+group_id+'/activity'; 
      console.log('routed');
    }

    getUserProfile() {
      this._userService.getUser()
        .subscribe((res) => {
          this.user = res.user;
          this.profileImage = res.user['profile_pic'];
          this.profileImage = `/uploads/${this.profileImage}`;
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

      this.comment.post_id = post_id;
      this.comment._commented_by = this.user_data.user_id;

      this.postService.addNewComment(this.comment)
        .subscribe((res) => {
          this.commentForm.reset();
          this.loadGroupPosts();
          this.scrollToTop('#card-normal-post-'+index);
          this.scrollToTop('#card-event-post-'+index);
          this.scrollToTop('#card-task-post-'+index);

        }, (err) => {
          this.alert.class = 'danger';

          if (err.status) {
            this._message.next(err.error.message);
          } else {
            this._message.next('Error! either server is down or no internet connection');
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
    }



  linkify(text) {
    const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
  }

  test(index) {
    const text = document.getElementById("div_text"+index);
    text.innerHTML= this.linkify(text.innerHTML);

  }




    addNewNormalPost() {

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
        _group: this.group_id

      };

      formData.append('content', post.content);
      formData.append('type', post.type);
      formData.append('_posted_by', post._posted_by);
      formData.append('_group', post._group);

      this.processing = true;
      this.disblePostForm();
      this.postService.addNewNormalPost(formData)
        .subscribe((res) => {
          this.processing = false;
          this.enablePostForm();
          this.postForm.reset();
          this.alert.class = 'success';
          this._message.next(res['message']);
          this.filesToUpload = null;
      // start socket!
     // const socket = io();
      const data = {
        // it should get automatically, something like workspace: this.workspace_name
        workspace: this.user_data.workspace.workspace_name,
        // it should get automatically, something like group: this.group_name
        group: this.group_name,
        user: this.user,
        groupId: this.groupDataService.group._id // Pass group id here!!!
      };

        this.socket.emit('newPost', data);  
  
      

          // console.log('Normal post response: ', res);
          this.loadGroupPosts();

        }, (err) => {
          this.processing = false;
          this.alert.class = 'danger';
          this.enablePostForm();

          if (err.status) {
            this._message.next(err.error.message);
          } else {
            this._message.next('Error! either server is down or no internet connection');
          }

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
          _assigned_to: assignedUsers
        },
        files: this.filesToUpload
      };
  
      formData.append('content', this.linkify(post.content));
      formData.append('type', post.type);
      formData.append('_posted_by', post._posted_by);
      formData.append('_group', post._group);
      formData.append('event.due_to', post.event.due_to);
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
          // console.log('Normal post response: ', res);
          this.loadGroupPosts();

        }, (err) => {
          this.processing = false;
          this.alert.class = 'danger';
          this.enablePostForm();
          console.log(err);

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
          _assigned_to: this.selectedGroupUsers[0]._id
        }
      };

      formData.append('content', this.linkify(post.content));
      formData.append('type', post.type);
      formData.append('_posted_by', post._posted_by);
      formData.append('_group', post._group);
      formData.append('task.due_to', post.task.due_to);
      formData.append('task._assigned_to', post.task._assigned_to);

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
          // console.log('Normal post response: ', res);
          this.loadGroupPosts();

        }, (err) => {
          this.processing = false;
          this.alert.class = 'danger';
          this.enablePostForm();

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
          console.log('Downloaded File err', err);

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

      console.log('post: ', post);

    

      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        dangerMode: true,
        buttons: ["Cancel", "Yes, delete it!"],
        
        })
        .then(willDelete => {
        if (willDelete) {
          this.postService.deletePost(post)
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
    loadGroupPosts() {

      this.isLoading$.next(true);

      this.postService.getGroupPosts(this.group_id)
        .subscribe((res) => {
          // console.log('Group posts:', res);
          this.posts = res['posts'];
        console.log('Group posts:', this.posts);
        this.isLoading$.next(false);
        this.show_new_posts_badge = 0;


        }, (err) => {

        });

    }

    loadNextPosts(last_post_id)
    {

      this.isLoading$.next(true);

      this.postService.getNextPosts(this.group_id, last_post_id)
        .subscribe((res) => {
           console.log('Group posts:', res);
          this.posts = this.posts.concat(res['posts']);
        console.log('Group posts:', this.posts);
        this.isLoading$.next(false);


        }, (err) => {

        });
    }

    onScroll() {

      this.postService.getGroupPosts(this.group_id)
        .subscribe((res) => {
          // console.log('Group posts:', res);
          //this.posts = res['posts'];
        //console.log('Group posts:', this.posts);
        if(this.posts.length != 0){
          this.isLoading$.next(true);
          var last_post_id = this.posts[this.posts.length - 1]._id
          console.log('Last Post Id', last_post_id)
          this.loadNextPosts(last_post_id);
          this.isLoading$.next(false);
        }



        }, (err) => {

        });
      console.log('scrolled!!');
    }
    

    scrollToTop(element) {
      this.scrollService.scrollTo(element).subscribe(data => {
        console.log('next');
        console.log(data);
  }, error => {
        console.error('error');
        console.log(error);
  }, () => {
        console.log('complete');
  });
  }

    abc(){
      console.log('clicked');
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
      const x = document.getElementById('icon_comment_post_'+index);

      if(x.style.color == "#005fd5"){
        x.style.color = "#9b9b9b";
      }

      else if(x.style.color == "#9b9b9b"){
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
      if (x.style.color === "#005fd5"){

        x.style.color = "#9b9b9b";

      }
      else ( x.style.color === "#9b9b9b")
      {
        x.style.color = "#005fd5";
      }

    }

    refreshPage() {
      location.reload();
  }

  OnEditPost(index) {

    const x = document.getElementById(index);
    const editor = document.getElementById('edit-content-'+index);
    const y = document.getElementById("button_edit_post"+index);
    y.style.display="block";
    editor.style.display = 'block';

    }

    OnSaveEditPost(index, post_id, content) {

      const editor = document.getElementById('edit-content-'+index);
    const post = {
      'post_id': post_id,
      'content': document.getElementById(index).innerHTML,
      'user_id': this.user_data.user_id
    };
    console.log('post: ', post);
    this.postService.editPost(post)
    .subscribe((res) => {

      this.alert.class = 'success';
      this._message.next(res['message']);
      this.resetNewPostForm();
      // console.log('Normal post response: ', res);
      this.loadGroupPosts();
      this.scrollToTop('#card-normal-post-'+index);
      this.scrollToTop('#card-event-post-'+index);
      this.scrollToTop('#card-task-post-'+index);
      console.log("Post Updated, Successfully!")

    }, (err) => {

      this.alert.class = 'danger';

      if (err.status) {
        this._message.next(err.error.message);
      } else {
        this._message.next('Error! either server is down or no internet connection');
      }

    });
      const x = document.getElementById(index);
    const y = document.getElementById("button_edit_post"+index);
    x.style.borderStyle="none";
    x.style.display="block";
    editor.style.display='none';
    x.setAttribute('contenteditable', 'false');
    y.style.display="none";
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
    }

    openDatePicker(content) {
      this.modalService.open(content, { centered: true });
    }

    openAssignPicker(content) {
      this.modalService.open(content, { centered: true });
    }

    onDateSelected() {

      // console.log('model_date:', this.model_date);
      // console.log('this.date:', this.date);

      const temp = this.model_date;
      this.due_date =  temp.year.toString() + '-' + this.date.month.toString() + '-' + temp.day.toString();
      this.selected_date = new Date(this.date.year, (this.date.month - 1), temp.day, this.model_time.hour, this.model_time.minute);
      this.due_to =  temp.year.toString() + '-' + this.date.month.toString() + '-' + temp.day.toString() +'T'+ this.model_time.hour + ':' + this.model_time.minute+ ':'+'00'+ this.selected_date.getTimezoneOffset();
      
    

      // console.log('model_date:', this.model_date);
      // console.log('selected date:', this.selected_date);
      // console.log('selected date:', this.due_date);
      // console.log('oneDateSelected temp Date', new Date(temp.year, temp.month, temp.day));
      // console.log('this.due_date', this.due_date);

    }


    enablePostForm() {
      this.postForm.enable();
    }

    disblePostForm() {
      this.postForm.disable();
    }

    onTimeSelected() {
      // console.log('on time selection');
      // console.log(this.modal_time);

      this.due_time = this.model_time.hour.toString() + ':' + this.model_time.minute.toString();
      // console.log(' this.due_time', this.due_time);

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


    OnMarkEventCompleted(index, post_id){

      const button = document.getElementById("button_event_mark_completed_"+index);

      const post = {
        'post_id': post_id,
        'user_id': this.user_data.user_id
      };
      this.postService.complete(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);
        console.log('Post Marked as Completed');

        button.style.background="#005fd5";
        button.style.color="#ffffff";
        button.innerHTML="Completed";
        button.setAttribute('disabled', 'true');
        this.loadGroupPosts();
        this.onScroll();
        this.scrollToTop('#card-normal-post-'+index);
        this.scrollToTop('#card-event-post-'+index);
        this.scrollToTop('#card-task-post-'+index);

      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
 
    }

    OnMarkTaskCompleted(index, post_id){
      const button = document.getElementById("button_task_mark_completed_"+index);
      const post = {
        'post_id': post_id,
        'user_id': this.user_data.user_id
      };
      this.postService.complete(post)
      .subscribe((res) => {

        this.alert.class = 'success';
        this._message.next(res['message']);
      // this.resetNewPostForm();
        // console.log('Normal post response: ', res);

        console.log('Post Marked as Completed');
        button.style.background="#005fd5";
        button.style.color="#ffffff";
        button.innerHTML="Completed";
        button.setAttribute('disabled', 'true');
        this.loadGroupPosts();
        this.onScroll();
        this.scrollToTop('#card-normal-post-'+index);
        this.scrollToTop('#card-event-post-'+index);
        this.scrollToTop('#card-task-post-'+index);

      }, (err) => {

        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
      /*button.style.background="#005fd5";
      button.style.color="#ffffff";
      button.innerHTML="Completed";
      button.setAttribute('disabled', 'true');*/

    }

    likepost(post){

      this.postService.like(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);
        console.log('Post Liked!');
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

    unlikepost(post){

      this.postService.unlike(post)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);
        console.log('Post Unliked!');
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



    OnClickLikePost(index, post_id, like_length, liked_by, user_id){

      const like_icon = document.getElementById('icon_like_post_'+index);
      const post = {
        'post_id': post_id,
        'user_id': this.user_data.user_id
      };

      if(like_length == 0){
        this.likepost(post);
        this.scrollToTop('#card-normal-post-'+index);
        this.scrollToTop('#card-event-post-'+index);
        this.scrollToTop('#card-task-post-'+index);
        like_icon.style.color="#005FD5";

      }

    else{
      var i ;
    for(i = 0; i < like_length; i++){

      if(liked_by[i]._id==this.user_data.user_id){
        this.unlikepost(post);
        this.scrollToTop('#card-normal-post-'+index);
        this.scrollToTop('#card-event-post-'+index);
        this.scrollToTop('#card-task-post-'+index);
        like_icon.style.color = "#9b9b9b";
      }
      else {
        this.likepost(post);
        this.scrollToTop('#card-normal-post-'+index);
        this.scrollToTop('#card-event-post-'+index);
        this.scrollToTop('#card-task-post-'+index);
      }
    }

    }
    
    }

    
    loadGroupMembers() {

      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {

          for(var i = 0; i < res['group']._members.length; i++ ){
            this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
          }
          for(var i = 0; i < res['group']._admins.length; i++ ){
            this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
          }
       
         console.log('Members', this.members);

        }, (err) => {

        });
    }

    mentionmembers()
    {
      var hashValues = [];

      var Value = [];
      
      this.groupService.getGroup(this.group_id)
      .subscribe((res) => {

        for(var i = 0; i < res['group']._members.length; i++ ){
          this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
          Value.push({id:res['group']._members[i]._id, value: res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name});
        }
        for(var i = 0; i < res['group']._admins.length; i++ ){
          this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
          Value.push({id:res['group']._members[i]._id, value: res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name});
        }
     
      }, (err) => {

      });

      this.groupService.getGroupFiles(this.group_id)
      .subscribe((res) => {
        console.log('Group Files:', res['posts']);
        this.files = res['posts'];
        for(var i = 0; i < res['posts'].length; i++){
          if(res['posts'][i].files.length > 0) {
            hashValues.push({id:res['posts'][i].files[0]._id, value: res['posts'][i].files[0].orignal_name})
          }
   
        }


      }, (err) => {

      });
  
  
      this.modules = {
        toolbar:[ ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
    
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
    
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
    
        ['clean'],                                         // remove formatting button
    
        ['link', 'image', 'video']                         // link and image, video],
      ],
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


  }
