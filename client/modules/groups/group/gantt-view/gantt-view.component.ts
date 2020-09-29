import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit {

  // Current Group Data
  @Input() groupData: any;
  // Current User Data
  @Input() userData: any;
  // Task Posts array variable
  tasks = [];

  constructor() { }

  ngOnInit() {

  }

}
