import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { debounceTime } from 'rxjs/operators';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss']
})
export class GroupActivityComponent implements OnInit {
  posts = new Array();
  group_id;
  group;

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
  due_time = 'Due Time';
  assignment = 'UnAssigned';
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


  constructor(private _activatedRoute: ActivatedRoute, private _router: Router,
    private _userService: UserService,
    public groupDataService: GroupDataService,
    private router: Router, private groupService: GroupService,
    private modalService: NgbModal, private postService: PostService) {

  }



  ngOnInit() {

    this.group_id = this.groupDataService.groupId;
    this.user_data = JSON.parse(localStorage.getItem('user'));

    this.group = this.groupDataService.group;

    // console.log('Group Activity _group:', this.groupDataService.group);
    this.getUserProfile();
    this.inilizePostForm();
    this.inilizeCommentForm();
    this.loadGroupPosts();
    this.alertMessageSettings();
    this.initializeGroupMembersSearchForm();
  }



  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
    console.log('files', this.filesToUpload);

    // this.product.photo = fileInput.target.files[0]['name'];
  }

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.profileImage = res.user['profile_pic'];
        this.profileImage = `http://localhost:3000/uploads/${this.profileImage}`;
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

  onAddNewComment(post_id) {
    // console.log('post._id: ', post_id);

    this.comment.post_id = post_id;
    this.comment._commented_by = this.user_data.user_id;

    this.postService.addNewComment(this.comment)
      .subscribe((res) => {
        this.commentForm.reset();
        this.loadGroupPosts();

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

  addNewNormalPost() {

    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;
    console.log(files);

    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i], files[i]['name']);
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
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i], files[i]['name']);
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
        _assigned_to: assignedUsers
      },
      files: this.filesToUpload
    };
    // console.log(this.selectedGroupUsers);


    formData.append('content', post.content);
    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('event.due_date', post.event.due_date);
    formData.append('event.due_time', post.event.due_time);
    // formData.append('event._assigned_to', assignedUsers);



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
    console.log(files);

    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i], files[i]['name']);
    }



    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group_id,
      task: {
        due_date: this.selected_date,
        _assigned_to: this.selectedGroupUsers[0]._id
      }
    };


    formData.append('content', post.content);
    formData.append('type', post.type);
    formData.append('_posted_by', post._posted_by);
    formData.append('_group', post._group);
    formData.append('task.due_date', post.task.due_date);
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


  onDeletePost(postId) {


   // console.log('postId: ', postId);

    const post = {
      'postId': postId
    };

    console.log('post: ', post);



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

  }

  resetNewPostForm() {
    this.due_date = 'Due Date';
    this.due_time = 'Due Time';
    this.assignment = 'UnAssigned';
    this.filesToUpload = null;
  }
  loadGroupPosts() {

    this.postService.getGroupPosts(this.group_id)
      .subscribe((res) => {
        // console.log('Group posts:', res);
        this.posts = res['posts'];
        // console.log('Group posts:', this.posts);

      }, (err) => {

      });

  }

  onSelectPostType(type) {
    this.post.type = type;
    this.due_date = 'Due Date';
    this.due_time = 'Due Time';
    switch (this.post.type) {
      case 'event':
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
    // console.log('post type: ', this.post.type);

  }


  openTimePicker(content) {
    this.modalService.open(content, { centered: true });
  }

  openDatePicker(content) {
    this.modalService.open(content, { centered: true });
  }

  openAssignPicker(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  onDateSelected() {

    // console.log('model_date:', this.model_date);
    // console.log('this.date:', this.date);

    const temp = this.model_date;
    this.due_date = temp.day.toString() + '-' + this.date.month.toString() + '-' + temp.year.toString();
    this.selected_date = new Date(this.date.year, (this.date.month - 1), temp.day);

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

}
