import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-velocity-card',
  templateUrl: './velocity-card.component.html',
  styleUrls: ['./velocity-card.component.scss']
})
export class VelocityCardComponent implements OnChanges {

  @Input() period;

  constructor() { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    console.log(this.period);
  }

}
