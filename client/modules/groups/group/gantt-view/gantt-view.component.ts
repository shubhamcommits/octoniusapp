import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit {

  @Input() tasks;

  constructor() { }

  ngOnInit() {

  }

}
