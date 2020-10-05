import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit, AfterViewInit {

  @Input() task;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  showImg = true;

  constructor(){
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showImg = document.getElementById(this.task._id).offsetWidth > 140;
  }
}
