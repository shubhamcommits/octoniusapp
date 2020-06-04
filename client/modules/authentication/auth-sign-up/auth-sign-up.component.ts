import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-sign-up',
  template: `<app-auth-common-layout [routerState]="'sign-up'"></app-auth-common-layout>`
})
export class AuthSignUpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
