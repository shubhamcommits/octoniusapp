import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-sign-up',
  template: `<app-auth-common-layout [routerState]="'signup'"></app-auth-common-layout>`
})
export class AuthSignUpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
