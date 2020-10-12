import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-organizational-structure-card',
  templateUrl: './organizational-structure-card.component.html',
  styleUrls: ['./organizational-structure-card.component.scss']
})
export class OrganizationalStructureCardComponent implements OnInit, OnChanges {

  @Input() period;

  num_groups = 0;
  num_agoras = 0;

  constructor() { }

  ngOnInit() {
    this.initView();
  }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

  }

}
