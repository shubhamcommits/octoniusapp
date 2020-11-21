import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/shared/services/auth-service/auth.service';

@Component({
  selector: 'select-workspace',
  template: `<app-auth-common-layout [routerState]="'select-workspace'" [userWorkspaces]="userWorkspaces"></app-auth-common-layout>`
})
export class SelectWorkspaceComponent implements OnInit {

  constructor(
    private authenticationService: AuthService,
    private _ActivatedRoute: ActivatedRoute
    ) { }

  userWorkspaces = [];
  email = this._ActivatedRoute.snapshot.queryParamMap.get('email');

  ngOnInit() {
    this.authenticationService.getUserWorkspaces(this.email).then(res => {
      this.userWorkspaces = res['workspaces'];
    });
  }

}
