import { Component, OnInit, forwardRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import {SnotifyService} from "ng-snotify";
import {UserService} from "../../../../shared/services/user.service";

@Component({
  selector: 'app-group-header',
  templateUrl: './group-header.component.html',
  styleUrls: ['./group-header.component.scss']
})
export class GroupHeaderComponent implements OnInit {
  modalReference: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  @ViewChild('content') private content;

  group_id;

  groupImageUrl = '';
  profilePic = '';
  // fileToUpload: File = null;
  fileToUpload: Blob = null;

  group = {
    group_name: '',
    description: ''
  };

  alert = {
    class: '',
    message: ''
  };

  user;

  isItMyWorkplace = false;

  constructor(private groupService: GroupService, private modalService: NgbModal,
              private _router: Router, public groupDataService: GroupDataService,
              private snotifyService: SnotifyService, private userService: UserService) { }

  ngOnInit() {
    this.group_id = this.groupDataService.groupId;
    this.loadUser();
    this.loadGroup();
  }

  fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
      // this.croppedImage = event.file;
    this.fileToUpload = event.file;
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload);

   // console.log(this.groupImageUrl);
    this.fileToUpload = new File([this.fileToUpload], "-group-avatar.jpg", { type: this.fileToUpload.type });
    //console.log(this.fileToUpload);

  }

  imageLoaded() {
      // show cropper
     console.log('Image loaded');
  }
  cropperReady() {
    console.log('Cropper ready');
  }

  loadImageFailed() {
      // show message
      console.log('Load failed');
  }


  loadGroup() {
    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        //console.log(res);
       this.groupImageUrl = res['group']['group_avatar'] == null
         ? '/assets/images/group.png' : environment.BASE_URL + `/uploads/${res['group']['group_avatar']}`;

        this.group.description = res['group']['description'] || '';
        this.group.group_name = res['group']['group_name'];
        this.groupDataService.group = res['group'];

        if(this.group.group_name === 'private'){
          this.isItMyWorkplace = true;
          this.group.group_name = 'My Space';
          this.groupImageUrl = this.profilePic == null
          ? '/assets/images/user.png' : environment.BASE_URL + `/uploads/${this.profilePic}`;
        }
      }, (err) => {});
  }

  loadUser() {
    this.userService.getUser()
      .subscribe((res) => {
        this.user = res['user'];
        this.profilePic = this.user.profile_pic;
        //console.log(this.user);
      });
  }

  onUpdateGroup() {
    const formData = new FormData();

    formData.append('description', this.group.description);
    formData.append('group_name', this.group.group_name);

    if (this.fileToUpload !== null) {
      formData.append('group_avatar', this.fileToUpload);
    }

    this.groupService.updateGroup(this.group_id, formData)
      .subscribe((res) => {

        this.modalReference.close();
        this.snotifyService.success('Succesfully updated group data');

        this.loadGroup();
      //  console.log('group updated response:', res);

      }, (err) => {

        // this.alert.class = 'alert alert-danger';

        if (err.status === 401) {
         this.snotifyService.error('Error! You are not allowed to edit this group\'s data');
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.snotifyService.error(err.error.message, 'Error!');
        } else {
          this.snotifyService.error('Error! either server is down or no internet connection');
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

