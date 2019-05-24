import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import swal from 'sweetalert';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {ProfileDataService} from "../../../shared/services/profile-data.service";
import {SearchService} from "../../../shared/services/search.service";

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
  userId: String;
  join_date;

  skills = [];
  skill = '';
  skills_search_result: any = new Array();

  isCurrentUser = false;

  constructor(
    private _userService: UserService,
    private ngxService: NgxUiLoaderService,
    private _router: Router,
    private route: ActivatedRoute,
    private profileDataService: ProfileDataService,
    private searchService: SearchService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.route.parent.params.subscribe((params) => {
      this.userId = params.userId;
      this.getProfile();
    });
  }

  getProfile(){
    this._userService.getOtherUser(this.userId)
    .subscribe((user)=>{
      this.user = user['user'];
      this.join_date = new Date(this.user.company_join_date.year, this.user.company_join_date.month -1, this.user.company_join_date.day);
      this.skills = user['user'].skills;
      this.isCurrentUser = JSON.parse(localStorage.getItem('user')).user_id == this.user._id;
      this.profileDataService.user.next(user['user']);

      if (this.user['company_join_date'] == null && this.isCurrentUser) {
        swal("Oops!", "Seems like you have been missing out, please update your profile to stay updated!", "warning");
      }
      else {
        // this.join_date = new Date(this.user['company_join_date'].year,
        //   (this.user['company_join_date'].month) - 1, this.user['company_join_date'].day);

      }
    });
  }
  getSkillsSearchResults() {
    if (this.skill !== '') {
      this.searchService.getSkillsSearchResults(this.skill)
      .subscribe((res) => {

         if (res) {
          this.skills_search_result = res['results'];
        } 
      }, (err)=>{
        console.log('Error while searching', err);
      });
    }else{
      
    }
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
      //console.log(this.skill);
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
        //console.log('Skills Added', res);
      },(err) =>{
        console.log('Error while updating the skills', err);
      })
  }
  clickedOnSkill(index){
    var skillFromList = this.skills_search_result[index]["skills"]
    this.skills.push(skillFromList);;
    this.saveSkills();
    this.skill = '';
  }
}
