import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import swal from 'sweetalert';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {ProfileDataService} from "../../../shared/services/profile-data.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  alert = {
    message: '',
    class: ''
  };

  user: any;
  join_date;

  skills = [];
  skill = '';

  isCurrentUser = false;

  constructor(
    private _userService: UserService,
    private ngxService: NgxUiLoaderService,
    private _router: Router,
    private route: ActivatedRoute,
    private profileDataService: ProfileDataService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.getProfile();

  }

  getProfile(){
    this._userService.getUser()
    .subscribe((user)=>{
      console.log('test 1', user['user']);
      console.log('test 2', JSON.parse(localStorage.getItem('user')).user_id == user['user']._id);
      this.user = user['user'];
      this.join_date = new Date(this.user.company_join_date.year, this.user.company_join_date.month -1, this.user.company_join_date.day);
      this.skills = user['user'].skills;
      this.isCurrentUser = JSON.parse(localStorage.getItem('user')).user_id == this.user._id;

      if (this.user['company_join_date'] == null && this.isCurrentUser) {
        swal("Oops!", "Seems like you have been missing out, please update your profile to stay updated!", "warning");
      }
      else {
        // this.join_date = new Date(this.user['company_join_date'].year,
        //   (this.user['company_join_date'].month) - 1, this.user['company_join_date'].day);

      }
    });
  }

  resetUser() {
    this.user = {
      first_name: '',
      last_name: '',
      phone_number: '',
      mobile_number: '',
      bio: '',
      current_position: '',
      company_join_date: ''
    };
  }

  addNewSkill(event: any){
    if(event.keyCode == 13) {
      console.log(this.skill);
      this.skills.push(this.skill);;
      this.saveSkills();
      
      this.skill = '';
      // rest of your code
    }
    
  }

  removeSkill(index){
      this.skills.splice(index, 1);
    this.saveSkills();
  }

  saveSkills() {
      const skills = {
        skills: this.skills
      };
      this._userService.addSkills(skills)
      .subscribe((res)=>{
        console.log('Skills Added', res);
      },(err) =>{
        console.log('Error while updating the skills', err);
      })

  }

 
}
