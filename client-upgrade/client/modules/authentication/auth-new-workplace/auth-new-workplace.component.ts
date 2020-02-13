import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-workplace',
  template: `<app-auth-common-layout [routerState]="'new-workplace'"></app-auth-common-layout>`
})
export class AuthNewWorkplaceComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
