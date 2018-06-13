import { Component, OnInit } from '@angular/core';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkspaceService } from '../../../shared/services/workspace.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  alert = {
    message: '',
    clas: ''
  };
  constructor(private _workspaceService: WorkspaceService, private alertConfig: NgbAlertConfig,
    private modalService: NgbModal) { }

  ngOnInit() {
  }


  openVerticallyCentered(content) {

    this.modalService.open(content, { centered: true });
  }
}
