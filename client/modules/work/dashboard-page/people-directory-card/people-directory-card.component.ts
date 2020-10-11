import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-people-directory-card',
  templateUrl: './people-directory-card.component.html',
  styleUrls: ['./people-directory-card.component.scss']
})
export class PeopleDirectoryCardComponent implements OnInit, OnChanges {

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
