import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-global-performance-card',
  templateUrl: './global-performance-card.component.html',
  styleUrls: ['./global-performance-card.component.scss']
})
export class GlobalPerformanceCardComponent implements OnInit, OnChanges {

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
