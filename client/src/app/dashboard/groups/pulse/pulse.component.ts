import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { User } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { InputValidators } from '../../../common/validators/input.validator';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { GroupsService } from '../../../shared/services/groups.service';
import { Group } from '../../../shared/models/group.model';
import { environment } from '../../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GroupService } from '../../../shared/services/group.service';
import { group } from '@angular/animations';


@Component({
  selector: 'app-pulse',
  templateUrl: './pulse.component.html',
  styleUrls: ['./pulse.component.scss']
})
export class PulseComponent implements OnInit {

  workspace: Workspace;
  workspace_id;
  user_data;
  allGroups;
  pulseTotalTasks = {};
  pulseTodoTasks = {};
  pulseInProgressTasks = {};
  pulseDoneTasks = {};
  BASE_URL = environment.BASE_URL;

  constructor(private _workspaceService: WorkspaceService,
    private _router: Router,
    private _userService: UserService,
    private _groupsService: GroupsService,
    private groupService: GroupService,
    private modalService: NgbModal,  private ngxService: NgxUiLoaderService) {

   }

  async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.workspace_id = this.user_data.workspace._id;
    console.log(this.workspace_id);
    await this.loadWorkspace();
    await this.getAllPulse(this.workspace_id);
    await this.getPulseTotalNumTasks();
    await this.getPulseNumTodoTasks();
    await this.getPulseNumInProgressTasks();
    await this.getPulseNumDoneTasks();
    this.ngxService.stop();
  }

    // loading workspace form server
    loadWorkspace () {
      this._workspaceService.getWorkspace(this.user_data.workspace)
        .subscribe((res) => {
          this.workspace = res.workspace;
          // console.log('workspace: ', res);

        }, (err) => {
            throw err;
        });
    }

    getAllPulse (workspace_id) {
      console.log('workspace_id ' + workspace_id);
      return new Promise((resolve, reject) => {
        this.groupService.getAllPulse(workspace_id)
          .subscribe((res) => {
            this.allGroups = res['groups'];
            console.log('response in getAllPulse:', res);
            resolve();
          }, (err) => {
            reject();
          });
      });
    }

    getPulseTotalNumTasks () {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < this.allGroups.length; i++) {
          this.groupService.getPulseTotalNumTasks(this.allGroups[i]._id)
          .subscribe((res) => {
            this.pulseTotalTasks[this.allGroups[i]._id] = (res['numTasks']);
            //console.log('response in this.pulseTotalTasks:', this.pulseTotalTasks);
            resolve();
          }, (err) => {
            reject();
          });
        }
      });
    }

    getPulseNumTodoTasks () {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < this.allGroups.length; i++) {
          this.groupService.getPulseNumTodoTasks(this.allGroups[i]._id)
          .subscribe((res) => {
            this.pulseTodoTasks[this.allGroups[i]._id]=(res['numTasks']);
            //console.log('response in this.pulseTodoTasks:', this.pulseTodoTasks);
            resolve();
          }, (err) => {
            reject();
          });
        }
      });
    }

    getPulseNumInProgressTasks () {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < this.allGroups.length; i++) {
          this.groupService.getPulseNumInProgressTasks(this.allGroups[i]._id)
          .subscribe((res) => {
            this.pulseInProgressTasks[this.allGroups[i]._id]=(res['numTasks']);
            //console.log('response in this.pulseInProgressTasks:', this.pulseInProgressTasks);
            resolve();
          }, (err) => {
            reject();
          });
        }
      });
    }

    getPulseNumDoneTasks () {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < this.allGroups.length; i++) {
          this.groupService.getPulseNumDoneTasks(this.allGroups[i]._id)
          .subscribe((res) => {
            this.pulseDoneTasks[this.allGroups[i]._id]=(res['numTasks']);
            //console.log('response in this.pulseDoneTasks:', this.pulseDoneTasks);
            resolve();
          }, (err) => {
            reject();
          });
        }
      });
    }

}
