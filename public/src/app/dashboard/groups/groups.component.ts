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
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
/*   encapsulation: ViewEncapsulation.None,
 */  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups = [{ title: 'group1', desc: 'this is group 1' }, { title: 'group2 ', desc: 'this is group 2' }];
  constructor(private _workspaceService: WorkspaceService,
    private _router: Router,
    private _userService: UserService,
    private modalService: NgbModal) { }
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
    name: '',
    user_id:''
    
  };
  createNewGroupForm: FormGroup;
  ngOnInit() {

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.createNewGroupFrom();

    // this.loadWorkspace();
    this.getUserProfile();

    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }

  // Create New group form initialization inside the modal
  createNewGroupFrom() {
    this.createNewGroupForm = new FormGroup({
      'groupName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty])
    });
  }


  onCreateNewGroup() {

  }

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
          this.alert.class = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }

  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
        console.log('response: ', res);
        // console.log('domains: ', this.domainData.domains);

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
