import { Component, OnInit, forwardRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-group-header',
  templateUrl: './group-header.component.html',
  styleUrls: ['./group-header.component.scss']
})
export class GroupHeaderComponent implements OnInit {
  modalReference: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      // this.croppedImage = event.file;
    this.fileToUpload =event.file;
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload);

   // console.log(this.groupImageUrl);
    this.fileToUpload = new File([this.fileToUpload], "-group-avatar.jpg", { type: this.fileToUpload.type });
    //console.log(this.fileToUpload);
      
  }
  imageLoaded() {
      // show cropper
     console.log('Image loaded')
  }
  cropperReady() {
    console.log('Cropper ready')
  }

  loadImageFailed() {
      // show message
      console.log('Load failed');
  }
  @ViewChild('content') private content;
 
  group_id;

  groupImageUrl = '';
  profilePic = '';
  // fileToUpload: File = null;
  fileToUpload: Blob = null;

  group: any = new Object();

  alert = {
    class: '',
    message: ''
  };
  constructor(private groupService: GroupService, private modalService: NgbModal,
    private _router: Router, public groupDataService: GroupDataService) { }

  ngOnInit() {

    this.group_id = this.groupDataService.groupId;
    this.loadGroup();
  }

  loadGroup() {
    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
       // console.log('Group: ', res);
        if (res['group']['group_avatar'] == null) {
        //  console.log('Inside if: ', this.groupImageUrl);

          this.groupImageUrl = '/assets/images/group.png';
        } else {
          this.groupImageUrl = environment.BASE_URL + `/uploads/${res['group']['group_avatar']}`;

        }

        this.group.description = res['group']['description'];

      }, (err) => {

     //   console.log('err: ', err);

      });

  }

  onUpdateGroup() {
    
    const formData = new FormData();

    if (this.fileToUpload !== null) {

      formData.append('group_avatar', this.fileToUpload); 
      formData.append('description', this.group.description);
    } else {
      formData.append('description', this.group.description);

    }

    this.groupService.updateGroup(this.group_id, formData)
      .subscribe((res) => {

        this.alert.class = 'alert alert-success';
        this.alert.message = res['message'];

        this.modalReference.close();
        this.openLg(this.content);
        setTimeout(() => {
          this.modalReference.close();
        }, 2000);
        this.loadGroup();
      //  console.log('group updated response:', res);

      }, (err) => {

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

  onUpdateGroupCancle() {
    this.loadGroup();
  }


  // handleFileInput(file: FileList) {

  //   this.fileToUpload = file.item(0);

  //   // Show image preview
  //   const reader = new FileReader();
  //   reader.onload = (event: any) => {
  //     this.groupImageUrl = event.target.result;
  //   };
  //   reader.readAsDataURL(this.fileToUpload);
  // }

  openLg(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg', centered: true });
  }

}

