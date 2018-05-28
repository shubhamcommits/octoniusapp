import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Workspace } from '../../shared/models/workspace.model';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { InputValidators } from '../../common/validators/input.validator';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { GroupsService } from '../../shared/services/groups.service';
import { Group } from '../../shared/models/group.model';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
/*   encapsulation: ViewEncapsulation.None,
 */  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups = new Array();

  workspace: Workspace;
  user_data;
  user: User;
  staticAlertClosed = false;
  private _message = new Subject<string>();
  alert = {
    class: '',
    message: ''
  };
  group = {
    group_name: '',
  };
  createNewGroupForm: FormGroup;

  constructor(private _workspaceService: WorkspaceService,
    private _router: Router,
    private _userService: UserService,
    private _groupsService: GroupsService,
    private modalService: NgbModal) { }


  ngOnInit() {

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.createNewGroupFrom();

    this.loadWorkspace();
    this.getUserProfile();
    this.getUserGroups();

    this.alertMessageSettings();
  }

  // Create New group form initialization inside the modal
  createNewGroupFrom() {
    this.createNewGroupForm = new FormGroup({
      'groupName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty])
    });
  }


  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }
  // creating new group
  onCreateNewGroup() {
    const new_group = {
      group_name: this.group.group_name,
      _workspace: this.workspace._id,
      _admins: this.user._id,
      workspace_name: this.workspace.workspace_name
    };

    this._groupsService.createNewGroup(new_group)
      .subscribe((response) => {
        this.groups.push(response['group']);
        // console.log('create new group response:', response);
        // this.getUserGroups();

        this.alert.class = 'success';
        this._message.next(response['message']);
        this.createNewGroupForm.reset();
        setTimeout(() => {

        }, 3000);
      }, (err) => {
        this.alert.class = 'danger';
        if (err.status === 401) {
          this._message.next(err.error.message);
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });

  }

  // getting all user's group
  getUserGroups() {
    console.log('Inside get user groups');

    const user = {
      user_id: this.user_data.user_id,
      workspace_id: this.user_data.workspace._id,
    };

    this._groupsService.getUserGroups(user)
      .subscribe((res) => {
        console.log('All groups:', res);
        this.groups = res['groups'];
      }, (err) => {
        console.log(err);
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }

      });

  }
  // getting currently logged in user's profile
  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        console.log('user: ', this.user);

      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }
  // loading workspace form server
  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
        // console.log('workspace: ', res);


      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }


  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }

}
