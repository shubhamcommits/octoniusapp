import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'auth-sign-in',
  template: `<app-auth-common-layout [routerState]="'signin'"></app-auth-common-layout>`
})
export class AuthSignInComponent implements OnInit {

  constructor() { }


  ngOnInit() {

  }

}
