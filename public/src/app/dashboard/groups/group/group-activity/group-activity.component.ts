import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators'; @Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss']
})
export class GroupActivityComponent implements OnInit {
  posts = new Array();
  group_id;
  group;

  user_data;
  postForm: FormGroup;
  post = {
    type: 'normal',
    content: ''
  };
  processing = false;
  post_type;
  time = { hour: 13, minute: 30 };
  modal_date: NgbDateStruct;
  date: { year: number, month: number };
  modal_time = { hour: 13, minute: 30 };
  due_date = 'Due Date';
  due_time = 'Due Time';

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

  constructor(private _activatedRoute: ActivatedRoute,
    private groupDataService: GroupDataService,
    private router: Router, private groupService: GroupService,
    private modalService: NgbModal, private postService: PostService) { }



  ngOnInit() {

    this.group_id = this.groupDataService.groupId;
    this.user_data = JSON.parse(localStorage.getItem('user'));

    this.group = this.groupDataService.group;

    // console.log('Group Activity _group:', this.groupDataService.group);
    this.inilizePostForm();
    this.loadGroupPosts();
    this.alertMessageSettings();
    this.initializeGroupMembersSearchForm();
  }
  // group memebrs search setting when user add new event or taks type post
  initializeGroupMembersSearchForm() {
    this.settings = {
      text: 'Select Group Members',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: 'myclass custom-class',
      primaryKey: '_id',
     // labelKey: 'first_name',
      noDataLabel: 'Search Members...',
      enableSearchFilter: true,
     // searchBy: ['first_name', 'capital']


    };
  }

  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }

  inilizePostForm() {
    this.postForm = new FormGroup({
      'postContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }


  OnAddNewPost() {
    console.log('on addnew post');
    console.log('on addnew post.type', this.post.type);


    switch (this.post.type) {
      case 'normal':
        console.log('NOrmal post adding');

        this.addNewNormalPost();
        break;
      case 'event':
        console.log('Event post adding');

        this.addNewEventPost();
        break;
      case 'task':
        console.log('Task post adding');

        this.addNewTaskPost();
        break;
    }
  }

  addNewNormalPost() {
    const post = {
      content: this.post.content,
      type: this.post.type,
      _posted_by: this.user_data.user_id,
      _group: this.group_id

    };
    this.processing = true;
    this.disblePostForm();
    this.postService.addNewNormalPost(post)
      .subscribe((res) => {
        this.processing = false;
        this.enablePostForm();
        this.postForm.reset();
        this.alert.class = 'success';
        this._message.next(res['message']);
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

  }

  addNewTaskPost() {

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
    // console.log('post type: ', this.post.type);

  }

  onDateSelcted() {
    const temp = this.modal_date;
    this.due_date = temp.day.toString() + '-' + temp.month.toString() + '-' + temp.year.toString();
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
    const temp = this.modal_date;
    this.due_date = temp.day.toString() + '-' + temp.month.toString() + '-' + temp.year.toString();

    // console.log('oneDateSelected');

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

    this.due_time = this.modal_time.hour.toString() + ':' + this.modal_time.minute.toString();
  }

  onSearch(evt: any) {
    console.log(evt.target.value);
    this.groupUsersList = [];
    this.groupService.searchGroupUsers(this.group_id)
      .subscribe((res) => {
        // console.log('workspace users: ', res);
        console.log('Group Users: ', res);

        this.groupUsersList = res['group'][0]['_members'];
        // this.groupUsersList = res['users'];
      }, (err) => {

      });

  }

  onItemSelect(item: any) {
    console.log(item);
    console.log('selected items: ', this.selectedGroupUsers);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedGroupUsers);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }

}
