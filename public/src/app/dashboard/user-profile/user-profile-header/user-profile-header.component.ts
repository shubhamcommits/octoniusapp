import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';
import swal from 'sweetalert';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {ProfileDataService} from "../../../shared/services/profile-data.service";
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-profile-header',
  templateUrl: './user-profile-header.component.html',
  styleUrls: ['./user-profile-header.component.scss']
})
export class UserProfileHeaderComponent implements OnInit {

  modalReference: any;
  // starts image cropping
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
  this.fileToUpload = new File([this.fileToUpload], "-profile-avatar.jpg", { type: this.fileToUpload.type });
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


  BASE_URL = environment.BASE_URL;

  userId;

  isCurrentUser = false;

  userImageUrl = '';
  profilePic = '';
  fileToUpload: Blob = null;

  user = {
    _id: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    mobile_number: '',
    bio: '',
    current_position: '',
    company_join_date: '',
    profile_pic: ''
  };

  @Output() updateProfile: EventEmitter<any> = new EventEmitter();

  constructor(
    private _userService: UserService,
    private _router: Router,
    private ngxService: NgxUiLoaderService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private profileDataService: ProfileDataService,
    private snotifyService: SnotifyService) { }


  ngOnInit() {
    this.profileDataService.user.subscribe((user: any) => {
      //console.log('user header', user);
      this.user = {
        _id: user['_id'],
        phone_number: user['phone_number'],
        mobile_number: user['mobile_number'],
        bio: user['bio'],
        first_name: user['first_name'],
        last_name: user['last_name'],
        profile_pic: user['profile_pic'] || null,
        current_position: user['current_position'],
        company_join_date: user['company_join_date']
      };

           if (this.user['profile_pic'] == null) {
              this.profilePic = 'assets/images/user.png';
            } else {
              // console.log('Inside else');
              this.profilePic = `${environment.BASE_URL}/uploads/${this.user['profile_pic']}`;
              this.userImageUrl = this.profilePic;
             }

      this.isCurrentUser = JSON.parse(localStorage.getItem('user')).user_id == this.user._id;
    });
  }

  refreshPage() {
    this.ngOnInit();
}

   onUpdateUser() {

    // console.log('calling Method onUpdateUser,, User: ', this.user);

     this._userService.updateUser(this.user)
      .subscribe((res) => {
        
        this.modalReference.close();
        console.log("Profile updated!", res);

        const successAction = Observable.create(observer => {
          this.updateProfile.emit();
          setTimeout(() => {
            observer.next({
              body: 'You are almost there...',
            });
          }, 2000);
    
          setTimeout(() => {
            observer.next({
              body: 'Profile Updated successfully!',
              config: {
                closeOnClick: true,
                timeout: 2000,
                showProgressBar: true
              }
            });
            observer.complete();
          }, 1000);
        });
    
     this.snotifyService.async('Please wait...', successAction,{
      timeout: 3000,
      showProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true
    });

      }, (err) => {


       // this.alert.class = 'alert alert-danger';

        if (err.status === 401) {
          swal("Error!", "Seems like there's an error, please try again!", "danger");
        } else if (err.status) {
        } else {
          swal("Error!", "Either server is down, or no Internet connection!", "danger");
        }
      });
  }

  onUpdateUserProfileImage() {

    if (this.fileToUpload !== null) {

      var file: any = this.fileToUpload;
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      this._userService.updateUserProfileImage(<File>file)
        .subscribe((res) => {
          this.profilePic = `${this.BASE_URL}/uploads/${res.user['profile_pic']}`;
          console.log(res);
          // this.getUserProfile(this.userId);

        }, (err) => {
          swal("Error!", "Seems like there's an error- "+ err, "danger");
          if (err.status === 401) {
            swal("Error!", "Seems like there's an error, please try again!", "danger");
          } else {
            swal("Error!", "Either server is down, or no Internet connection!", "danger");
          }
        });
    }

  }
  openLg(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg', centered: true });
  }

  resetUser() {
    this.user = {
      _id: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      profile_pic: null,
      mobile_number: '',
      bio: '',
      current_position: '',
      company_join_date: ''
    };
  }

}
