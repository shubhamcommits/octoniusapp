import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-engagement-card',
  templateUrl: './engagement-card.component.html',
  styleUrls: ['./engagement-card.component.scss']
})
export class EngagementCardComponent implements OnChanges {

  @Input() period;

  num_agoras = 0;
  num_topics = 0;
  num_highly_engaged = 0;

  constructor() { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    console.log(this.period);
  }

}
