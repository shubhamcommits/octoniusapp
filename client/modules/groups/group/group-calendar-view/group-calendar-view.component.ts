import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, Injector, Input, Output, EventEmitter } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment/moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';

// Define Set of hexcodes of colors
const colors: any = {
  todo: { primary: '#fd7714', secondary: '#fd7714' },
  working: { primary: '#0bc6a0', secondary: '#0bc6a0' },
  done: { primary: '#4a90e2', secondary: '#4a90e2' },
  event: { primary: '#005FD5', secondary: '#005FD5' }
}

@Component({
  selector: 'app-group-calendar-view',
  templateUrl: './group-calendar-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./group-calendar-view.component.scss']
})
export class GroupCalendarViewComponent implements OnInit {

  // Fetch groupId from router snapshot
  @Input() groupId

  @Input() tasks:any;

  @Input() isIdeaModuleAvailable;

  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  // Calendar Posts
  posts: any;

  // Current Post Object
  post: any;

  // Current User Data
  userData: any;

  // Current Group Data
  groupData: any;

  // Timeline of events and tasks
  timeline: any = []

  // Events arrays
  events: any = []

  columns;

  // Define the month view
  view: CalendarView = CalendarView.Month

  // Calendar Views
  CalendarView = CalendarView

  // View Date
  viewDate: Date = moment().toDate();

  // Modal Data to add the event and action
  modalData: {
    action: string;
    event: CalendarEvent;
  }

  // Action Lists
  actions: CalendarEventAction[] = [
    {
      label: '<span class="material-icons">create</span>',
      a11yLabel: $localize`:@@groupCalendarView.edit:Edit`,
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent($localize`:@@groupCalendarView.editd:Edited`, event);
      }
    },
    {
      label: '<span class="material-icons">delete</span>',
      a11yLabel: $localize`:@@groupCalendarView.delete:Delete`,
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent($localize`:@@groupCalendarView.deleted:Deleted`, event);
      }
    }
  ]

  // Refresh Subject
  refresh: Subject<any> = new Subject()

  // Open the current active day automatically
  activeDayIsOpen: boolean = true;

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    public dialog: MatDialog) { }

  async ngOnInit() {

    this.publicFunctions.getAllColumns(this.groupId).then(data => this.columns = data);

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current group
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.loadTimeline();
  }

  async loadTimeline() {
    // Fetch Posts from the server
    this.posts = await this.publicFunctions.getCalendarPosts(moment(this.viewDate).year(), moment(this.viewDate).month(), this.groupId);

    // Timeline array
    this.timeline = [...this.posts.events, ...this.posts.tasks];

    // Prepare timeline array and make the events
    this.prepareTimeline(this.timeline);
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This Function selects the color on the basis of the post type and their current status
   * @param post
   */
  selectColor(post: any) {

    // Define the color
    let color = colors.done;

    // If post type is event
    if (post.type === 'event')
      color = colors.event

    // If post type is task
    else if (post.type === 'task') {

      // If task status is 'to do'
      if (post.task.status === 'to do')
        color = colors.todo

      // If task status is 'in progress'
      else if (post.task.status === 'in progress')
        color = colors.working

      // If task status is 'done'
      else if (post.task.done === 'done')
        color = colors.done
    }

    return color;
  }

  /**
   * This function is responsible for preparing the calendar events
   * @param timeline
   */
  prepareTimeline(timeline: Array<any>) {
    timeline.forEach((post: any) => {

      // Evaluate color for the post
      let color = this.selectColor(post);

      // Adding to calendar events
      this.events.push({
        start: moment(moment.utc(post.event.due_to || post.task.due_to).format('YYYY-MM-DD')).toDate(),
        title: `${post.title}`,
        color: color,
        allDay: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        },
        draggable: false,
        post: post
      })
    })

    // Update the status of subject to next()
    this.refresh.next();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent($localize`:@@groupCalendarView.droppedResized:Dropped or resized`, event);
  }

  handleEvent(action: string, event: any): void {
    this.modalData = { event, action };

    // Set the Value of post to the event post propery
    this.post = event.post
    let dialogRef;
    if (this.post) {
      const canOpen = !this.groupData?.enabled_rights || this.post?.canView || this.post?.canEdit;
      if (this.post.type === 'task' && !this.post.task._parent_task) {
        dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post._id, this.groupData._id, this.isIdeaModuleAvailable, canOpen, this.columns);
      } else {
        if (this.post.task._parent_task && !this.post.task._parent_task._id) {
          this.publicFunctions.getPost(this.post.task._parent_task).then(post => {
            this.post.task._parent_task = post;
          });
        }
        dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post._id, this.groupData._id, this.isIdeaModuleAvailable, canOpen);
      }
    }

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateEvent(data);
      });
      const taskClonnedEventSubs = dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
        this.onTaskClonned(data);
      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        taskClonnedEventSubs.unsubscribe();
      });
    }
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: $localize`:@@groupCalendarView.newEvent:New event`,
        start: moment().startOf('day').toDate(),
        end: moment().endOf('day').toDate(),
        color: colors.red,
        draggable: false,
        resizable: {
          beforeStart: true,
          afterEnd: true
        }
      }
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  updateEvent(event) {
    this.events.forEach((ev, index) => {
      if (ev.post._id === event._id) {
        // Evaluate color for the event
        let color = this.selectColor(event);

        // Adding to calendar events
        this.events.push({
          start: moment(moment.utc(event.event.due_to || event.task.due_to).format('YYYY-MM-DD')).toDate(),
          title: `${event.title}`,
          color: color,
          allDay: true,
          resizable: {
            beforeStart: true,
            afterEnd: true
          },
          draggable: false,
          post: event
        });
        this.events.splice(index, 1);
        this.refresh.next();
        return;
      }
    });

  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  /**
   * This function is responsible for closing the modals
   */
  closeModal() {
    this.utilityService.closeAllModals()
  }

  /**
   * This function is responsible for changing the task status and updating the UI
   * @param status
   */
  changeTaskStatus(status: any){

    // Find the Index of the timeline event postId which matches the post in current view
    let index = this.events.findIndex((event) => event.post._id === this.post._id)

    if (index != -1) {

      // Select the color on the basis of the current view of post
      let color = this.selectColor(this.post)

      // Updates the color of that particular timeline event
      this.events[index].color = color;
    }

  }

  ngOnDestroy(){
    this.refresh.complete()
  }

  openCreatePostDialog(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
    });
  }

  /**
   * This function is responsible for emitting the post object to other components
   * @param post
   */
  getPost(post: any) {
    this.events = [
      ...this.events,
      {
        title: post.title,
        start: moment(moment.utc(post.event.due_to).format('YYYY-MM-DD')).startOf('day').toDate(),
        end: moment(moment.utc(post.event.due_to).format('YYYY-MM-DD')).endOf('day').toDate(),
        color: colors.red,
        draggable: false,
        resizable: {
          beforeStart: true,
          afterEnd: true
        }
      }
    ];
  }

  onTaskClonned(data) {
    this.ngOnInit();
  }
}
