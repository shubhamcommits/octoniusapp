import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-velocity-card',
  templateUrl: './velocity-card.component.html',
  styleUrls: ['./velocity-card.component.scss']
})
export class VelocityCardComponent implements OnInit, OnChanges {

  @Input() period;

  constructor() { }

  ngOnInit() {
    this.initView();
  }

  ngOnChanges() {
    console.log(this.period);
    this.initView();
  }

  async initView() {
    console.log(this.period);
  }

}
