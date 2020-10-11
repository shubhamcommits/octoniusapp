import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-workload-card',
  templateUrl: './workload-card.component.html',
  styleUrls: ['./workload-card.component.scss']
})
export class WorkloadCardComponent implements OnInit, OnChanges {

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
