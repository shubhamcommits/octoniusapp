import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { WorkspaceService } from '../../../shared/services/workspace.service';

@Component({
  selector: 'app-user-profile-header',
  templateUrl: './user-profile-header.component.html',
  styleUrls: ['./user-profile-header.component.scss']
})
export class UserProfileHeaderComponent implements OnInit {
  user = {
    phone: '',
    mobile: '',
    bio: '',
    current_position: '',
    company_join_date: ''
  };

  constructor(private _workspaceService: WorkspaceService, private alertConfig: NgbAlertConfig,
    private modalService: NgbModal) { }


  ngOnInit() {
  }

  openLg(content) {
    this.modalService.open(content, { size: 'lg', centered: true });
  }

}
