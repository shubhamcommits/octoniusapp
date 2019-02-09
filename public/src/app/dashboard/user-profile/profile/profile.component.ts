import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 

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

  skills =[];

  constructor(private _userService: UserService, private ngxService: NgxUiLoaderService, private _router: Router) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.getUserProfile();
  }

  closeSkills(){
    const skill = document.getElementById('skills-input');
    const skillContent = document.getElementById('skills-content');

    skill['value'] = null;
    skillContent.innerHTML = null;
    this.ngOnInit();

  }

  saveSkills(){
      const skills = {
        skills: this.skills
      };
      this._userService.addSkills(skills)
      .subscribe((res)=>{
        console.log('Skills Added', res);
        swal("Good Job!", "You have updated your skills, successfully!", "success")
        .then((res)=>{
          this.getUserProfile();
        })    
      },(err) =>{
        console.log('Error while updating the skills', err);
      })

  }

  addSkills(){

    const skill = document.getElementById('skills-input');
    const skillContent = document.getElementById('skills-content');

    skillContent.innerHTML += '<b><br />' + skill['value']+'</b>';

    this.skills.push(skill['value']);

    skill['value'] = '';

   /* swal({
      title: "Enter your skill",
      closeOnClickOutside: false,
      buttons:{
        cancel: true,
        confirm:true,
      },
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your skill",
          type: "text"
        },
      },
    }).then((res) =>{
      if(res){
        console.log(res);
        this.skills.push(res);
        const skills = {
          skills: this.skills
        };
        this._userService.addSkills(skills)
        .subscribe((res)=>{
          console.log('Skills Added', res);
          this.getUserProfile();
        },(err) =>{
          console.log('Error while updating the skills', err);
        })
      }
      else{
        console.log('nothing');
      }
    })*/
  }

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
       this.skills = res.user.skills;
      // console.log('User', this.user);
      if(res.user['company_join_date'] == null){
        swal("Oops!", "Seems like you have been missing out, please update your profile to stay updated!", "warning");
      }
      else{
        this.join_date = new Date(res.user['company_join_date'].year,
          (res.user['company_join_date'].month) - 1, res.user['company_join_date'].day);
          
      }

     


        // console.log('user Inside profile:', res);

      }, (err) => {
        this.alert.class = 'alert alert-danger';
        swal("Error!", "Please try again!", "error");
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
}
