import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-pulse',
  templateUrl: './pulse.component.html',
  styleUrls: ['./pulse.component.scss']
})
export class PulseComponent implements OnInit {
  workspace: Workspace;
  user_data;

  isLoading$ = new BehaviorSubject(false);

  constructor(private _workspaceService: WorkspaceService, private _router: Router, private alertConfig: NgbAlertConfig,
    private adminService: AdminService, private modalService: NgbModal, private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace()
    .then(()=>{
      this.ngxService.stop();
    })
    .catch((err)=>{
      console.log('Error while fetching the loading the workpace', err);
    })
  }

  loadWorkspace() {
    this.isLoading$.next(true);
    return new Promise((resolve, reject)=>{
      this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
        this.isLoading$.next(false);
        resolve();
      }, (err) => {
        reject(err);
      });
    })
  }


}
