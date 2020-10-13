import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-engagement-card',
  templateUrl: './engagement-card.component.html',
  styleUrls: ['./engagement-card.component.scss']
})
export class EngagementCardComponent implements OnChanges {

  @Input() period;

  constructor() { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    console.log(this.period);
  }

}
