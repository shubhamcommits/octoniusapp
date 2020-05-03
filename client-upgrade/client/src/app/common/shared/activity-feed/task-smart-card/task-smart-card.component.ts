import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-smart-card',
  templateUrl: './task-smart-card.component.html',
  styleUrls: ['./task-smart-card.component.scss']
})
export class TaskSmartCardComponent implements OnInit {

  constructor() { }

  today_task_count = 0;
  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0
  overdueTasks = []


  ngOnInit() {
  }

}
