import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { AdminService } from '../../shared/services/admin.service';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { Workspace } from '../../shared/models/workspace.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {




  message;
  constructor() { }

  ngOnInit() {

  }


}
