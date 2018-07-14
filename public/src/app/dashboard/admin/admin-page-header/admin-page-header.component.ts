import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrls: ['./admin-page-header.component.scss']
})
export class AdminPageHeaderComponent implements OnInit {

  modalReference: any;
  @ViewChild('content') private content;

  group_id;

  workspaceImageUrl = '';
  profilePic = '';
  fileToUpload: File = null;

  user_data;

  alert = {
    class: '',
    message: ''
  };
  constructor(private modalService: NgbModal, private _workspaceService: WorkspaceService,
    private _router: Router) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace();
  }


  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        if (res['workspace']['workspace_avatar'] == null) {
          this.workspaceImageUrl = '/assets/images/organization.png';
        } else {
          this.workspaceImageUrl = environment.BASE_URL + `/uploads/${res['workspace']['workspace_avatar']}`;
        }

      }, (err) => {

        this.alert.class = 'alert alert-danger';
        console.log('err: ', err);

        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 2000);

        }
      });
  }


  onUpdateWorkspace() {

    const formData = new FormData();

    if (this.fileToUpload !== null) {
      formData.append('workspace_avatar', this.fileToUpload);



      this._workspaceService.updateWorkspace(this.user_data['workspace']['_id'], formData)
        .subscribe((res) => {

          this.alert.class = 'alert alert-success';
          this.alert.message = res['message'];

          this.modalReference.close();
          this.openLg(this.content);
          setTimeout(() => {
            this.modalReference.close();
          }, 2000);
          console.log('workspace updated response:', res);

        }, (err) => {
          console.log('err:', err);

          this.alert.class = 'alert alert-danger';

          if (err.status === 401) {
            this.alert.message = err.error.message;
            this.openLg(this.content);
            setTimeout(() => {
              localStorage.clear();
              this._router.navigate(['']);
            }, 3000);
          } else if (err.status) {
            this.alert.message = err.error.message;
            this.openLg(this.content);
          } else {
            this.alert.message = 'Error! either server is down or no internet connection';
            this.openLg(this.content);
          }
        });
    }
  }

  handleFileInput(file: FileList) {

    this.fileToUpload = file.item(0);

    // Show image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.workspaceImageUrl = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload);
  }

  openLg(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg', centered: true });
  }


}
