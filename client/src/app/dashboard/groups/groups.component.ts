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
import { environment } from '../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GroupService } from '../../shared/services/group.service';
import { SnotifyService } from 'ng-snotify';
import { PostService } from '../../shared/services/post.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
/*   encapsulation: ViewEncapsulation.None,
 */  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups = new Array();
  groupsMoreToLoad = false
  BASE_URL = environment.BASE_URL;

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

  // public groups
  agoras = [];

  smartGroups = [];

  constructor(private _workspaceService: WorkspaceService,
    private _router: Router,
    private _userService: UserService,
    private _groupsService: GroupsService,
    private groupService: GroupService,
    private modalService: NgbModal,  private ngxService: NgxUiLoaderService,
    private snotifyService: SnotifyService,
    private postService: PostService,) { }


  ngOnInit() {

    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.createNewGroupFrom();

    this.loadWorkspace();
    this.getUserProfile();
    this.getUserGroups().then(()=>{
      this.ngxService.stop();
    });

    this.alertMessageSettings();
    this.getAgoras();
    this.getSmartGroups();
  }

  /**
   * Get all of the public groups in the system that the current
   * user is not a part of.
   */
  getAgoras() {
    this._groupsService.getAgoras(this.user_data.workspace._id).subscribe(
      ({ groups }) => {
        this.agoras = groups;
       // Set the correct path to the group avatar
        for (let i = 0; i < this.agoras.length; i++) {
          if (this.agoras[i]['group_avatar'] == null) {
            this.agoras[i]['group_avatar'] = '/assets/images/group.png';
          } else {
            this.agoras[i]['group_avatar'] = environment.BASE_URL + `/uploads/${this.agoras[i]['group_avatar']}`;
          }
        }
      },
      err => console.error(`Could not fetch public groups! ${err}`)
    );
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

    console.log(this.user_data);
    const new_group = {
      group_name: this.group.group_name,
      _workspace: this.user_data.workspace._id,
      _admins: this.user_data.user_id,
      workspace_name: this.user_data.workspace.workspace_name
    };


    this._groupsService.createNewGroup(new_group)
      .subscribe((response) => {
        this.groups.push(response['group']);

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

    return new Promise((resolve, reject)=>{

      const user = {
        user_id: this.user_data.user_id,
        workspace_id: this.user_data.workspace._id,
      };
      this._groupsService.getUserGroupsQuery(user).subscribe((res) => {
        this.groups = res['groups'];
        this.groupsMoreToLoad = res['moreToLoad']
            for (let i = 0; i < this.groups.length; i++) {
              if (this.groups[i]['group_avatar'] == null) {
                this.groups[i]['group_avatar'] = '/assets/images/group.png';
              } else {
                this.groups[i]['group_avatar'] = environment.BASE_URL + `/uploads/${this.groups[i]['group_avatar']}`;
              }
            }

        resolve();
      },(err) =>{
            // console.log(err);
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
          reject(err);
      })
    })
  }

  getNextUserGroups() {
      this.ngxService.startBackground();
    const user = {
      user_id: this.user_data.user_id,
      workspace_id: this.user_data.workspace._id,
      next_query: this.groups[this.groups.length - 1]._id
    };

    this._groupsService.getNextUserGroupsQuery(user).subscribe((res) => {
      this.groups = [...this.groups, ...res['groups']]
      this.groupsMoreToLoad = res['moreToLoad']
      this.ngxService.stopBackground();
          for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i]['group_avatar'] == null) {
              this.groups[i]['group_avatar'] = '/assets/images/group.png';
            } else {
              this.groups[i]['group_avatar'] = environment.BASE_URL + `/uploads/${this.groups[i]['group_avatar']}`;
            }
          }

    },(err) =>{
          // console.log(err);
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
    })
  }

  // getting currently logged in user's profile
  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        // console.log('user: ', this.user);

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

  openAgoraModal(agora) {
    this.modalService.open(agora, { size: 'lg' });
  }

  openSmartGroupModal(smartGroup) {
    this.modalService.open(smartGroup, { size: 'lg' });
  }

  /**
   * This method is responsible for creating a new public group
   */
  onCreateAgora() {
    const new_group = {
      group_name: this.group.group_name,
      _workspace: this.user_data.workspace._id,
      _admins: this.user_data.user_id,
      workspace_name: this.user_data.workspace.workspace_name,
      type: 'agora'
    };


    this._groupsService.createNewGroup(new_group)
      .subscribe((response) => {
        this.groups.push(response['group']);

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

  /**
   * Makes a request to the backend to add a user to the given public group
   */
  joinPublicGroup(groupId: string) {
    this.groupService.joinPublicGroup(groupId).subscribe(
      res => {
        this._router.navigate(['/dashboard/group/',groupId,'activity']);
      },
      err => console.error(`Failed to join public group! ${err}`)
    );
  }

  /**
   * This method is responsible for creating a new smart group
   */
  onCreateSmartGroup() {
    const group = {
      group_name: this.group.group_name,
      _workspace: this.user_data.workspace._id,
      _admins: this.user_data.user_id,
      workspace_name: this.user_data.workspace.workspace_name,
      type: 'smart'
    };


    this._groupsService.createNewGroup(group)
      .subscribe((response) => {
        this.smartGroups.push(response['group']);

        this.alert.class = 'success';
        this._message.next(response['message']);
        this.createNewGroupForm.reset();
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

  /**
   * Get all of the smart groups that a user is a part of.
   */
  getSmartGroups() {
    this._groupsService.getSmartGroups(this.user_data.workspace._id).subscribe(
      ({ groups }) => {
        this.smartGroups = groups;

        // Set the correct path to the group avatar
        // for (let i = 0; i < this.smartGroups.length; i++) {
        //   if (this.smartGroups[i]['group_avatar'] == null) {
        //     this.smartGroups[i]['group_avatar'] = '/assets/images/group.png';
        //   } else {
        //     this.smartGroups[i]['group_avatar'] = environment.BASE_URL + `/uploads/${this.smartGroups[i]['group_avatar']}`;
        //   }
        // }
      },
      err => {
        this.snotifyService.error('A problem has occurred whilst fetching your smart groups.');
        console.error('Could not fetch smart groups!');
        console.error(err);
      }
    );
  }
}
