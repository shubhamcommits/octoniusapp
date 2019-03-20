import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { PostService } from '../../../../shared/services/post.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import {Router} from "@angular/router";
import { GroupService } from '../../../../shared/services/group.service';
import { UserService } from '../../../../shared/services/user.service';



interface MyEvent extends CalendarEvent {
  link: string;
}

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }, 
  todo: {
    primary: '#fd7714',
    secondary: '#fd7714'
  },
  working:{
    primary: '#0bc6a0',
    secondary: '#0bc6a0'
  },
  done:{
    primary: '#4a90e2',
    secondary: '#4a90e2'
  }
};

@Component({
  selector: 'app-group-calendar',
  templateUrl: './group-calendar.component.html',
  styleUrls: ['./group-calendar.component.scss']
})
export class GroupCalendarComponent implements OnInit {

  // this initializes the date for the calendar
  viewDate: Date = new Date();
  view = 'month';

  events: MyEvent[] = [];

  groupMembers: any = new Array();

  // these are the details of the month of which events and tasks were fetched
  // (or about to be fetched in case that the component is initializing
  fetchedDates: {year: number, month: number}[] = [];

  posts = [];
  group_id;

  selectedUser = {
    _id:'All Team',
    first_name:'All Team'
  };
  profile_pic: any = '';

  activeDayIsOpen = true;

  refresh: Subject<any> = new Subject();

  constructor(
    private ngxService: NgxUiLoaderService,
    private _postservice: PostService,
    public groupDataService: GroupDataService,
    public router: Router,
    public groupService: GroupService,
    public userService: UserService) {
     }

  async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after .5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.group_id = this.groupDataService.groupId;
    await this.getGroupMembers();
    // We will fetch all the tasks and events of this month
    this.loadCalendarPosts(this.selectedUser);

    // not sure what this is
    this.events = this.events;
  }

  async getGroupMembers(){
    await this.groupService.getGroup(this.group_id)
    .subscribe((res)=>{
      //this.groupMembers = res['group']['_members'];
      this.groupMembers.push({'first_name':'All Team','_id':'All Team', 'profile_pic':res['group']['group_avatar']});
      for(let i = 0; i < res['group']['_members'].length; i++){
        this.groupMembers.push(res['group']['_members'][i]);
      }
      for(let i = 0; i < res['group']['_admins'].length; i++){
        this.groupMembers.push(res['group']['_admins'][i]);
      }
      this.profile_pic = res['group']['group_avatar'];
      console.log(res);
    }, (err)=>{
      console.log('Error fetched while getting group', err);
    })
  }

  changeDate() {
    this.activeDayIsOpen = false;

    // this is the month and the year that we are currently looking at
    const currentView = {year: moment(this.viewDate).year(), month: moment(this.viewDate).month()};

    // in the dates that we already fetched we look for the month/year combination of currentView
    const alreadyFetched = this.fetchedDates.filter((fetchedDate) => {
      return fetchedDate.year === currentView.year && fetchedDate.month === currentView.month;
    });

    this.loadCalendarPosts(this.selectedUser);

    //   if we got a match in the previous function
    //if (alreadyFetched.length < 1) {
      // then we fetch the posts from that month
      //this.loadCalendarPosts(this.selectedUser);
    //}
    //  if we don't we do nothing because those posts were already loaded
  }

  eventClicked({ event }: { event: MyEvent }): void {
    this.router.navigateByUrl(event.link);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;

      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  loadUserCalendarPosts(userId){
    const year = moment(this.viewDate).year();
    const month = moment(this.viewDate).month();
    this.events = [];


    const data = {
      userId: userId,
      year,
      month
    };

  
  }

  loadCalendarPosts(calendarData) {
    this.events = [];
    const year = moment(this.viewDate).year();
    const month = moment(this.viewDate).month();

    console.log(calendarData);
    this.selectedUser = calendarData;
    console.log('Selected user', this.selectedUser);

    var data = {

    };

    if(calendarData._id != 'All Team'){
      
      data = {
        userId: calendarData._id,
        groupId: this.group_id,
        year,
        month
      };
      this.profile_pic = calendarData.profile_pic;

      this.userService.getUserCalendarPosts(data)
      .subscribe((res)=>{
        console.log(res);
        // when we succefully fetched the posts we add the year/month combination to the fetched Dates
          // this way we won't fetch them again in the future
          this.fetchedDates.push({year, month});
  
          // set the newly fetched posts
          this.posts = [...this.posts, ...res['posts']];
  
          // we only want to edit the posts that were added on the last fetch
          for ( let i = (this.posts.length - res['posts'].length); i < this.posts.length; i++ ) {
  
            if ( this.posts[i].type === 'event' || this.posts[i].type === 'task') {
  
              if ( this.posts[i].type === 'event' ) {
                /*this.events[i]={
                  title: this.posts[i].content,
                  start: new Date()
                }*/
                this.events.push({
                  title: '<b>Event</b>' + this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                  start: new Date(this.posts[i].event.due_to),
                  link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                });
                this.refresh.next();
  
              }
              if ( this.posts[i].type === 'task' ) {
                /*this.events[i]={
                  title: this.posts[i].content,
                  start: new Date()
                }*/
                if(this.posts[i].task.status === 'to do'){
                  this.events.push({
                    title: this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                    start: new Date(moment(this.posts[i].task.due_to).toDate()),
                    link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                    color: colors.todo
                  });
                }
                else if(this.posts[i].task.status === 'in progress'){
                  this.events.push({
                    title: this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                    start: new Date(moment(this.posts[i].task.due_to).toDate()),
                    link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                    color: colors.working
                  });
                }
                else if(this.posts[i].task.status === 'done'){
                  this.events.push({
                    title: this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                    start: new Date(moment(this.posts[i].task.due_to).toDate()),
                    link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                    color: colors.done
                  });
                }
                this.refresh.next();
              }
  
            }
          }
  
  
      }, (err)=>{
        console.log('Error while getting user\'s calendar post', err);
      })
    }

    else{
      //this.selectedUser = calendarData;
      data = {
        groupId: this.group_id,
        year,
        month
      };

      this.profile_pic = calendarData.profile_pic;
    this._postservice.getCalendarPosts(data)
    .subscribe((res) => {
      console.log(res);
      // when we succefully fetched the posts we add the year/month combination to the fetched Dates
      // this way we won't fetch them again in the future
      this.fetchedDates.push({year, month});

      // set the newly fetched posts
      this.posts = [...this.posts, ...res['posts']];

      // we only want to edit the posts that were added on the last fetch
      for ( let i = (this.posts.length - res['posts'].length); i < this.posts.length; i++ ) {

        if ( this.posts[i].type === 'event' || this.posts[i].type === 'task') {

          if ( this.posts[i].type === 'event' ) {
            /*this.events[i]={
              title: this.posts[i].content,
              start: new Date()
            }*/
            this.events.push({
              title: '<b>Event</b>' + this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
              start: new Date(this.posts[i].event.due_to),
              link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
            });
            this.refresh.next();

          }
          if ( this.posts[i].type === 'task' ) {
            /*this.events[i]={
              title: this.posts[i].content,
              start: new Date()
            }*/
            if(this.posts[i].task.status === 'to do'){
              this.events.push({
                title: this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                start: new Date(moment(this.posts[i].task.due_to).toDate()),
                link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                color: colors.todo
              });
            }
            else if(this.posts[i].task.status === 'in progress'){
              this.events.push({
                title: this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                start: new Date(moment(this.posts[i].task.due_to).toDate()),
                link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                color: colors.working
              });
            }
            else if(this.posts[i].task.status === 'done'){
              this.events.push({
                title: this.posts[i].content.slice(0, 9).toLowerCase() + '<b>...</b>',
                start: new Date(moment(this.posts[i].task.due_to).toDate()),
                link: `/dashboard/group/${this.posts[i]._group}/post/${this.posts[i]._id}`,
                color: colors.done
              });
            }


            this.refresh.next();
          }

        }
      }


    });
    }


  }

}
