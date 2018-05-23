import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss']
})
export class GroupActivityComponent implements OnInit {
  group_id;
  group_name;
  post_type;
  time = { hour: 13, minute: 30 };
  modal_date: NgbDateStruct;
  date: { year: number, month: number };
  modal_time = { hour: 13, minute: 30 };
  due_date = 'Due Date';
  due_time = 'Due Time';



  constructor(private _activedRoute: ActivatedRoute, private modalService: NgbModal) { }




  ngOnInit() {

    /*      this.group_id = this._activedRoute.snapshot.paramMap.get('id');
         this.group_name = this._activedRoute.snapshot.paramMap.get('groupName');

         console.log('group_id in group activity: ', this.group_id, 'group_name group activity: ', this.group_name);
         console.log('this._activedRoute.snapshot.paramMap', this._activedRoute.snapshot.paramMap); */

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

  onDateSelected() {
    const temp = this.modal_date;
    this.due_date = temp.day.toString() + '-' + temp.month.toString() + '-' + temp.year.toString();

    console.log('oneDateSelected');

  }


  onTimeSelected() {
    console.log('on time selection');
    console.log(this.modal_time);

    this.due_time = this.modal_time.hour.toString() + ':' + this.modal_time.minute.toString();
  }
}
