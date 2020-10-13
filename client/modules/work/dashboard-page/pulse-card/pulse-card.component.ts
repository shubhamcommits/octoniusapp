import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-pulse-card',
  templateUrl: './pulse-card.component.html',
  styleUrls: ['./pulse-card.component.scss']
})
export class PulseCardComponent implements OnChanges {

  @Input() period;

  constructor() { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    console.log(this.period);
  }

}
