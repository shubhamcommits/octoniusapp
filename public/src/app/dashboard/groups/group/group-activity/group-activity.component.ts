import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss']
})
export class GroupActivityComponent implements OnInit {
  posts = new Array();
  group_id;
  group;

  post_type;
  time = { hour: 13, minute: 30 };
  modal_date: NgbDateStruct;
  date: { year: number, month: number };
  modal_time = { hour: 13, minute: 30 };
  due_date = 'Due Date';
  due_time = 'Due Time';





  constructor(private _activatedRoute: ActivatedRoute,
     private groupDataService: GroupDataService,
    private router: Router, private groupService: GroupService,
    private modalService: NgbModal, private postService: PostService) { }




  ngOnInit() {

    this.group_id = this.groupDataService.groupId;
    this.group = this.groupDataService.group;

    // console.log('Group Activity _group:', this.groupDataService.group);

    this.loadGroupPosts();

  }


  loadGroupPosts() {

    this.postService.getGroupPosts(this.group_id)
      .subscribe((res) => {

        // console.log('Group posts:', res);
        this.posts = res['posts'];
        console.log('Group posts:', this.posts);

      }, (err) => {

      });

  }

  onSelectPostType(type) {
    this.post_type = type;
    this.due_date = 'Due Date';
    console.log('post type: ', type);

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


  onTimeSelected() {
    // console.log('on time selection');
    // console.log(this.modal_time);

    this.due_time = this.modal_time.hour.toString() + ':' + this.modal_time.minute.toString();
  }
}
