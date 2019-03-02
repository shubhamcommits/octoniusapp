import {Component, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import * as moment from 'moment';
import * as io from 'socket.io-client';
import { environment } from '../../../../environments/environment'
import { BehaviorSubject } from 'rxjs';
import { async } from '@angular/core/testing'
import {WorkspaceService} from "../../../shared/services/workspace.service";
import {SearchService} from "../../../shared/services/search.service";




// Further ideas for notifications under consideration
// 1. when the user gets mentioned and assigned a task at the same time we should maybe just display 1 notification instead of two?
// 2. we might want to change name generateFeed to generateFeedAndEmitToUser
// 3. when you click the notification in the feed and you relocate, the red sign doesn't disappear until you click outside the feed window

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @ViewChild('searchDrop') searchDrop;

  user: User;
  userProfileImage;
  user_data;
  isLoading$ = new BehaviorSubject(false);
  alert = {
    class: '',
    message: ''
  };

  notifications_data: any;

  Date = new Date;

  socket = io(environment.BASE_URL);

  isCollapsed = true;

  // search data
  search_value = '';
  checked_filter = 'all';

  // search results
  search_results = [];
  search_results_posts = [];
  search_results_users = [];
  search_results_skills = [];
  recent_searches = [];

  constructor(
    private _auth: AuthService,
    private _userService: UserService,
    private _router: Router,
    private router: Router,
    private workspaceService: WorkspaceService,
    private searchService: SearchService) {
      this.user_data = JSON.parse(localStorage.getItem('user'));
     }

  async ngOnInit() {

    await this.socket.on('connect', async () => {
      // we can probably delete this  second parameter since every server request already has access to the current userId
      await this.socket.emit('joinUser', this.user_data.user_id);
    });

    this.getUserProfile();
      const user = {
        'userId': this.user_data.user_id
        };
        this.socket.on('notificationsFeed', (feed) => {
          this.notifications_data = feed;
         // console.log(this.notifications_data);
        });
        this.socket.emit('getNotifications', this.user_data.user_id);

    }

  gotToPostPage(groupId, postId) {
   this.router.navigate(['dashboard', 'group', groupId, 'post', postId]);
  }

  refreshPage() {
    location.reload();
}

  toggled(event) {
    if (event) {
       // console.log('is open');
    } else {
     // console.log('is closed');
      if(this.notifications_data['unreadNotifications'].length > 0){

        this.socket.emit('markRead', this.notifications_data['unreadNotifications'][0]._id , this.user_data.user_id);

      }

    }
  }

  underline_navbar_overview(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");

    if( z != null){
      x.className = "active";
      y.className = "none";
      z.className = "none";
    }

  }


  underline_navbar_group(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    if( z != null){
      y.className = "active";
      x.className = "none";
      z.className = "none";
    }

  }


  underline_navbar_admin(){
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    if( z!= null){
      z.className = "active";
      y.className = "none";
      x.className = "none";
    }
  }

  deleteSearchResult(data) {
    this.searchService.deleteSearchResult(data)
      .subscribe( (res) => {
        console.log('data', data);
        this.recent_searches = this.recent_searches.filter((search) => {
          if (data.type === 'user') {
            return search.user._id != data.user._id;
          } else if (data.type === 'content') {
            return search.content._id != data.content._id;
          }
        });
      });
  }

  displayAllSearchResults() {
    if (this.search_value !== '') {
      this.router.navigateByUrl(`/dashboard/all-search-results/${this.search_value}`);
    }
  }

  loadRecentSearches() {
    if (this.search_value === '') {
      this.searchService.loadRecentSearches()
        .subscribe((res) => {
          this.recent_searches = res['searches'];
          console.log('recent_searches', this.recent_searches);
        });
    }
  }

  getUserProfile() {
    this.isLoading$.next(false);
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.userProfileImage = res.user['profile_pic'];
      //  console.log(this.user._id);
        this.userProfileImage = `/uploads/${this.userProfileImage}`;
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
  onSignOut() {
    this._auth.signout()
      .subscribe((res) => {
        localStorage.clear();
        this.router.navigate(['']);

      }, (err) => {
        this.alert.class = 'danger';

        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this.router.navigate(['']);
          }, 2000);
        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or you internet is not working';
        }

      });
  }
  public closeAlert() {
    this.alert.message = '';
  }

  saveSearch(data) {
    this.searchService.saveSearch(data)
      .subscribe((res) => {
        console.log('RES', res);
      });
  }

  search() {
    if (this.search_value !== '') {
      const filter = this.checked_filter;
      this.search_results = [];
      const data = {
        query: this.search_value,
        filter
      };

      // yes
      this.searchService.search(data)
        .debounceTime(300)
        .subscribe((res) => {
          console.log('RES SKILLS', res);
            if (filter === 'users') {
              this.search_results_users = res['results'];
            } else if (filter === 'skills') {
              this.search_results_skills = res['results'];
            } else if (filter === 'posts') {
              this.search_results_posts = res['results'];
            } else {
            this.search_results_users = res['results'][0];
            this.search_results_posts = res['results'][1];
            console.log('POSTS', this.search_results_posts);
            this.search_results_skills = res['results'][2];
          }
        });
    } else {
      this.loadRecentSearches();
    }
  }

  resetSearchResults() {
    this.search_results_skills = [];
    this.search_results_posts = [];
    this.search_results_users = [];
  }

 toggleCheckbox(type) {
    this.checked_filter = this.checked_filter === type ? 'all' : type;
    this.resetSearchResults();
    this.search();
 }

}
