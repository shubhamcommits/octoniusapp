import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-organizational-structure-card',
  templateUrl: './organizational-structure-card.component.html',
  styleUrls: ['./organizational-structure-card.component.scss']
})
export class OrganizationalStructureCardComponent implements OnInit, OnChanges {

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
