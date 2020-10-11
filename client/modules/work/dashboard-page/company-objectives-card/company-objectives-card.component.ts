import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-company-objectives-card',
  templateUrl: './company-objectives-card.component.html',
  styleUrls: ['./company-objectives-card.component.scss']
})
export class CompanyObjectivesCardComponent implements OnInit, OnChanges {

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
