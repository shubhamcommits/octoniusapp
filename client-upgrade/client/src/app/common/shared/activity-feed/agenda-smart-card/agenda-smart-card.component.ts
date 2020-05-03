import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agenda-smart-card',
  templateUrl: './agenda-smart-card.component.html',
  styleUrls: ['./agenda-smart-card.component.scss']
})
export class AgendaSmartCardComponent implements OnInit {

  constructor() { }

  todayFirstTwoEvents: any = [];
  today_event_count = 0

  ngOnInit() {
  }

}
