import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-user-profile-header',
  templateUrl: './user-profile-header.component.html',
  styleUrls: ['./user-profile-header.component.scss']
})
export class UserProfileHeaderComponent implements OnInit {

  modalReference: any;
  @ViewChild('content') private content;


  BASE_URL = environment.BASE_URL;

  userImageUrl = '';
  profilePic = '';
  fileToUpload: File = null;
  alert = {
    message: '',
    class: ''
  };

  user = {
    first_name: '',
    last_name: '',
    phone_number: '',
    mobile_number: '',
    bio: '',
    current_position: '',
    company_join_date: ''
  };

  constructor(private _userService: UserService, private _router: Router, private modalService: NgbModal) { }


  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = {
          phone_number: res.user['phone_number'],
          mobile_number: res.user['mobile_number'],
          bio: res.user['bio'],
          first_name: res.user['first_name'],
          last_name: res.user['last_name'],
          current_position: res.user['current_position'],
          company_join_date: res.user['company_join_date']
        };

        // console.log('user Inside profile header:', res);

        if (res.user['profile_pic'] == null) {
          this.profilePic = 'assets/images/user.png';
          // console.log('Inside if');
        } else {
          // console.log('Inside else');
          this.profilePic = `${this.BASE_URL}/uploads/${res.user['profile_pic']}`;
          this.userImageUrl = this.profilePic;
        }


      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          //  this.alert.class = err.error.message;
        } else {
          // this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }

  onUpdateUser() {

    // console.log('calling Method onUpdateUser,, User: ', this.user);

    this._userService.updateUser(this.user)
      .subscribe((res) => {
        this.alert.class = 'alert alert-success';
        this.alert.message = res.message;

        this.modalReference.close();
        this.openLg(this.content);
        setTimeout(() => {
          this.modalReference.close();
        }, 2000);

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

  onUpdateUserProfileImage() {

    if (this.fileToUpload !== null) {

      //  console.log('calling Method onUpdateUserProfileImage');

      this._userService.updateUserProfileImage(this.fileToUpload)
        .subscribe((res) => {
          this.alert.class = 'alert alert-success';
          this.alert.message = res.message;

          this.modalReference.close();
          this.openLg(this.content);
          this.profilePic = `${this.BASE_URL}/uploads/${res.user['profile_pic']}`;

          setTimeout(() => {
            this.modalReference.close();
          }, 2000);

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
            this.alert.class = err.error.message;
            this.openLg(this.content);
          } else {
            this.alert.message = 'Error! either server is down or no internet connection';
            this.openLg(this.content);
          }
        });
    }

  }
  openLg(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg', centered: true });
  }


  handleFileInput(file: FileList) {

    this.fileToUpload = file.item(0);

    // Show image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.userImageUrl = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload);
  }
}
