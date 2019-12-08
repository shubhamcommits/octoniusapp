import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';
import {Router} from '@angular/router';
import {UserService} from '../../../shared/services/user.service';
import {User} from '../../../shared/models/user.model';
import io from 'socket.io-client';
import {environment} from '../../../../environments/environment'
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-intercom',
  templateUrl: './intercom.component.html',
  styleUrls: ['./intercom.component.scss']
})
export class IntercomComponent implements OnInit {
  @ViewChild('searchDrop', {static: false}) searchDrop;

  user: User;
  user_data;
  isLoading$ = new BehaviorSubject(false);
  alert = {
    class: '',
    message: ''
  };

  notifications_data: any;

  Date = new Date;

  socket = io(environment.BASE_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
  });

  BASE_URL = environment.BASE_URL;


  constructor(
    private _auth: AuthService,
    private _userService: UserService,
    private _router: Router) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  async ngOnInit() {

    await this.socket.on('connect', async () => {
      // we can probably delete this  second parameter since every server request already has access to the current userId
      await this.socket.emit('joinUser', this.user_data.user_id);
    });

    await this.getUserProfile();
    const user = {
      'userId': this.user_data.user_id
    };
    this.socket.on('notificationsFeed', (feed) => {
      this.notifications_data = feed;
      // console.log(this.notifications_data);
    });
    this.socket.emit('getNotifications', this.user_data.user_id);

  }

  getUserProfile() {
    this.isLoading$.next(false);
    this._userService.getUser()
      .subscribe(async (res) => {
        this.user = await res.user;


        console.log(this.user._id);


        this.isLoading$.next(true);
      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.class = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }

}
