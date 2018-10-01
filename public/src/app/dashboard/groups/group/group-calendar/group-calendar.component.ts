import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { PostService } from '../../../../shared/services/post.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
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

@Component({
  selector: 'app-group-calendar',
  templateUrl: './group-calendar.component.html',
  styleUrls: ['./group-calendar.component.scss']
})
export class GroupCalendarComponent implements OnInit {

  viewDate: Date = new Date();
  view: string = 'month';
  //events = [];
  events: CalendarEvent[] = [
  ];

  posts = new Array();
  group_id;

  activeDayIsOpen: boolean = true;

  refresh: Subject<any> = new Subject();

  constructor(private ngxService: NgxUiLoaderService, private _postservice: PostService, public groupDataService: GroupDataService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.group_id = this.groupDataService.groupId;
    this.loadGroupPosts();
    this.events= this.events;
  }
  eventClicked({ event }: { event: CalendarEvent }): void {
    //console.log('Event clicked', event);
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

  loadGroupPosts() {


    this._postservice.getGroupPosts(this.group_id)
      .subscribe((res) => {
        // console.log('Group posts:', res);
        this.posts = res['posts'];
        for(var i = 0 ; i < this.posts.length; i++){
          if(this.posts[i].type == 'event' || this.posts[i].type == 'task'){

            if(this.posts[i].type == 'event'){
              /*this.events[i]={
                title: this.posts[i].content,
                start: new Date()
              }*/
              this.events.push({
                title: '<b>Event</b>'+this.posts[i].content,
                start: new Date(this.posts[i].event.due_to)
              });
              this.refresh.next();
              
            }
            if(this.posts[i].type == 'task'){
              /*this.events[i]={
                title: this.posts[i].content,
                start: new Date()
              }*/
              this.events.push({
                title: '<b>Task</b>'+this.posts[i].content,
                start: new Date(this.posts[i].task.due_to)
              });
              this.refresh.next();
            }
         
          }
        }
      // console.log('Group posts:', this.posts);
      // console.log('Events posts:', this.events);


      }, (err) => {

      });

  }

}
