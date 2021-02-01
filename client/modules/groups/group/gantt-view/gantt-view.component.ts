import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import { PostService } from 'src/shared/services/post-service/post.service';
import { DatePipe } from '@angular/common';
import { reduce } from 'rxjs/operators';
declare var LeaderLine: any;

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit, AfterViewInit {

  @Input() tasks;
  @Input() userData;
  @Input() columns: any;

  @Output() taskClonnedEvent = new EventEmitter();

  @ViewChild("myDiv") divView1: ElementRef;
  @ViewChild("myDiv2") divView2: ElementRef;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;
  //Calendaer start and end date
  datestoshow: any = { start: '2020-12-30', end: '2021-01-15' };
  //task parsed data
  tasksdata: any = [];
  //date for calendar Nav
  dates: any = [];
  //Month
  months: any = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  //container Width
  gantt_container_width: string;
  //container height
  gantt_container_height: string;
  //screen height
  screen_height:string;
  //container height
  current_date_index: any;
  //Grid column width
  step = 50;
  //Card  height
  card_height = 40;
  //Lines Array
  linesArray: any = [];

  constructor(private utilityService: UtilityService, private postService: PostService, private datePipe: DatePipe) { }

  async ngOnInit() {
    await this.parsedTasks(this.tasks);
    this.datestoshow.start = await this.min_date(this.tasksdata);
    this.datestoshow.end = await this.max_date(this.tasksdata)
    await this.generateNavDate();
    await this.add_index();
    await this.get_current_date_index()
    var ganttHeight = 100 + this.tasksdata.length * 60;
    var screenHeight = window.innerHeight - 100;

    if (ganttHeight > screenHeight) {
      this.gantt_container_height = ganttHeight + 'px';
    } else {
      this.gantt_container_height = screenHeight + 'px';
    }

    this.screen_height = screenHeight + 'px';
    console.log("screenHeight",this.screen_height);
  }

 

  ngAfterViewInit() {
    this.linesGenetate(false);
  }

  linesGenetate(ree) {
    setTimeout(() => {
      for (var i = 0; i < this.tasksdata.length; i++) {

        if (this.tasksdata[i] && this.tasksdata[i].dependency) {
          this.linesArray.push(new LeaderLine(document.getElementById(this.tasksdata[i]?.dependency), document.getElementById(this.tasksdata[i]?.id), {
            startPlug: 'disc',
            startSocket: 'right',
            endSocket: 'left',
            size: 2,
            color: '#4a90e2',
          }));
        }
      }
      document.getElementById('fixed-container-gantt').addEventListener('scroll', this.linePotionsListener.bind(this), false);
    }, 50);
  };

  linePotionsListener() {
    this.linesArray.forEach(line => {
      line.position();
    });
  }

  lineRemove() {
    document.getElementById('fixed-container-gantt').removeEventListener('scroll', this.linePotionsListener.bind(this), false);
    this.linesArray.forEach(line => {
      line.remove();
    });
    this.linesArray = [];
  }

  ngOnDestroy() {
    this.lineRemove();
  }

  //Drop event on drag
  drop(event: CdkDragDrop<string[]>) {
    var Taskindex = event.item.element.nativeElement.attributes['taskindex'].nodeValue;
    var task = this.tasksdata[event.item.element.nativeElement.attributes['taskindex'].nodeValue];
    var distance = (event.distance.x) / 50;
    var mod = (event.distance.x) % 50;

    if (distance > 0) {

      if (mod > 30) {
        var days = Math.ceil(distance);
      } else {
        var days = Math.floor(distance);
      }
    } else {

      if (mod > -30) {
        var days = Math.ceil(distance);
      } else {
        var days = Math.floor(distance);
      }
    }
    var updated_x = task.index_date + days;
    event.item.element.nativeElement.setAttribute('style', `top:0px;left:${updated_x * 50}px;width: ${event.item.element.nativeElement.style.width}`)
    var endDate = new Date(this.tasksdata[Taskindex].end);
    var newEndDate = new Date(this.tasksdata[Taskindex].end);
    newEndDate.setDate(endDate.getDate() + days);
    var startDate = new Date(this.tasksdata[Taskindex].start);
    var newStartDate = new Date(this.tasksdata[Taskindex].start);
    newStartDate.setDate(startDate.getDate() + days);
    this.tasksdata[Taskindex].index_date = updated_x;
    this.tasksdata[Taskindex].end = this.datePipe.transform(newEndDate, "yyyy-MM-dd");
    this.tasksdata[Taskindex].task.task.due_to = this.datePipe.transform(newEndDate, "yyyy-MM-dd");
    this.tasksdata[Taskindex].task.task.start_date = this.datePipe.transform(newStartDate, "yyyy-MM-dd");
    this.tasksdata[Taskindex].start = this.datePipe.transform(newStartDate, "yyyy-MM-dd");
    this.dateupdate(this.tasksdata[Taskindex], newStartDate, newEndDate, days, days, this.tasksdata[Taskindex]?._groupid);

    setTimeout(() => {
      this.linesArray.forEach(line => {
        line.position();
      });
    }, 10);

  }

  //Validating Resize.
  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 50;

    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }

  //Resize Event
  onResizeEnd(event: ResizeEvent, Taskid: string, Taskindex): void {

    if (event.edges?.right) {
      var mod = Number(event.edges?.right) % 50;

      if (event.edges?.left > 0) {

        if (mod > 30) {
          var multiple = Math.ceil(Number(event.edges?.right) / 50);
        } else {
          var multiple = Math.floor(Number(event.edges?.right) / 50);
        }
      } else {

        if (mod > -30) {
          var multiple = Math.ceil(Number(event.edges?.right) / 50);
        } else {
          var multiple = Math.floor(Number(event.edges?.right) / 50);
        }
      }
      var result = multiple * 50;
      var clientWidth = document.getElementById(Taskid).clientWidth;
      var newWidth = clientWidth + result + 4;
      document.getElementById(Taskid).style.width = newWidth + 'px';
      var endDate = new Date(this.tasksdata[Taskindex].end);
      var newEndDate = new Date(this.tasksdata[Taskindex].end);
      newEndDate.setDate(endDate.getDate() + multiple);
      this.tasksdata[Taskindex].end = this.datePipe.transform(newEndDate, "yyyy-MM-dd");
      this.tasksdata[Taskindex].task.task.due_to = this.datePipe.transform(newEndDate, "yyyy-MM-dd");
      this.dateupdate(this.tasksdata[Taskindex], this.tasksdata[Taskindex].start, newEndDate, 0, multiple, this.tasksdata[Taskindex]?._groupid);

    } else if (event.edges?.left) {
      var mod = Number(event.edges?.left) % 50;

      if (event.edges?.left > 0) {

        if (mod > 30) {
          var multiple = Math.ceil(Number(event.edges?.left) / 50);
        } else {
          var multiple = Math.floor(Number(event.edges?.left) / 50);
        }
      } else {

        if (mod > -30) {
          var multiple = Math.ceil(Number(event.edges?.left) / 50);

        } else {
          var multiple = Math.floor(Number(event.edges?.left) / 50);
        }
      }
      var result = multiple * 50;
      var offsetLeft = document.getElementById(Taskid).offsetLeft;
      var clientWidth = document.getElementById(Taskid).clientWidth;
      var newWidth = clientWidth - result + 4;
      document.getElementById(Taskid).style.width = newWidth + 'px';
      var newLeft = offsetLeft + result;
      document.getElementById(Taskid).style.left = newLeft + 'px';
      var startDate = new Date(this.tasksdata[Taskindex].start);
      var newStartDate = new Date(this.tasksdata[Taskindex].start);
      newStartDate.setDate(startDate.getDate() + multiple);
      this.tasksdata[Taskindex].task.task.start_date = this.datePipe.transform(newStartDate, "yyyy-MM-dd");
      this.tasksdata[Taskindex].start = this.datePipe.transform(newStartDate, "yyyy-MM-dd");
      this.dateupdate(this.tasksdata[Taskindex], newStartDate, this.tasksdata[Taskindex].end, multiple, 0, this.tasksdata[Taskindex]?._groupid);
    }

    setTimeout(() => {
      this.linesArray.forEach(line => {
        line.position();
      });
    }, 10);

  }

  //Update Dates
  dateupdate(task, start, end, sday, eday, groupid) {
    const startdate = this.datePipe.transform(start, "yyyy-MM-dd");
    const enddate = this.datePipe.transform(end, "yyyy-MM-dd");
    this.postService.updateGanttTasksDates(task['id'], groupid, enddate, startdate, sday, eday)
      .then((res) => {
        this.tasks = res['posts'];
        this.refreshChart();
      });;
  }

  //onupdate task
  async updateTask(updatedTask: any) {

    for (var i = 0; i < this.tasks.length; i++) {

      if (this.tasks[i]._id == updatedTask._id) {
        this.tasks[i] = updatedTask;
      } else if (this.tasks[i]._id == updatedTask?.task?._parent_task?._id) {
        var isExist = false;
        this.tasks.forEach(task => {

          if (task._id == updatedTask._id) {
            isExist = true;
          }
        });

        if (!isExist) {
          this.tasks.push(updatedTask);
        }
      }
    }
    await this.refreshChart();
  }

  //onDeleteEvent
  async onDeleteEvent(deletedTask: any) {

    for (var i = 0; i < this.tasks.length; i++) {

      if (this.tasks[i]._id == deletedTask) {
        this.tasks.splice(i, 1);
      }
    }

    await this.refreshChart();
  }

  //open model
  openFullscreenModal(postData: any,): void {
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, postData._group._id, this.columns);
    const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
      this.onDeleteEvent(data);
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateTask(data);
    });
    const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
      this.onDeleteEvent(data._id);
    });
    const taskClonnedEventSubs = dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
      this.onTaskClonned(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      deleteEventSubs.unsubscribe();
      closeEventSubs.unsubscribe();
      parentAssignEventSubs.unsubscribe();
      taskClonnedEventSubs.unsubscribe();
    });
  }

  //refresh Chart
  async refreshChart() {
    await this.parsedTasks(this.tasks);
    this.datestoshow.start = await this.min_date(this.tasksdata);
    this.datestoshow.end = await this.max_date(this.tasksdata)
    this.dates = [];
    await this.generateNavDate();
    await this.add_index();
    await this.get_current_date_index()
    var ganttHeight = 100 + this.tasksdata.length * 60;
    var screenHeight = window.innerHeight - 100;

    if (ganttHeight > screenHeight) {
      this.gantt_container_height = ganttHeight + 'px';
    } else {
      this.gantt_container_height = screenHeight + 'px';
    }

    this.lineRemove();
    // this.linesArray = [];
    this.linesGenetate(true);
  }

  //Generate the dates for Nav
  async generateNavDate() {

    if (new Date(this.datestoshow.start).getTime() > new Date().getTime()) {
      // Find duration between start and end date
      const currentDate = new Date();
      if (new Date(this.datestoshow.end).getTime() < new Date().getTime()) {
        var endDate = new Date();
      } else {
        var endDate = new Date(this.datestoshow.end);
      }

      var Difference_In_Time = endDate.getTime() - currentDate.getTime();
      var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

      if (Difference_In_Days < 26) {
        var lessdays = 26 - Difference_In_Days;
        Difference_In_Days = Difference_In_Days + lessdays;
      } else {
        Difference_In_Days = Difference_In_Days + 2
      }
      //Continer width

      this.gantt_container_width = (Difference_In_Days * this.step) + 'px';
      //Populating the dates.

      for (var i = 0; i < Difference_In_Days; i++) {
        const cueerntDate = new Date();
        const reqdate = new Date();
        reqdate.setDate(cueerntDate.getDate() + (i));
        this.dates.push({ day: reqdate.getDate(), date: reqdate, month: this.months[reqdate.getMonth()], isweekend: (reqdate.getDay() == 0 || reqdate.getDay() == 6) ? true : false });
      }
    } else {
      // Find duration between start and end date
      const currentDate = new Date(this.datestoshow.start)
      if (new Date(this.datestoshow.end).getTime() < new Date().getTime()) {
        var endDate = new Date();
      } else {
        var endDate = new Date(this.datestoshow.end);
      }
      var Difference_In_Time = endDate.getTime() - currentDate.getTime();
      var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

      if (Difference_In_Days < 26) {
        var lessdays = 26 - Difference_In_Days;
        Difference_In_Days = Difference_In_Days + lessdays;
      } else {
        Difference_In_Days = Difference_In_Days + 2
      }
      //Continer width
      this.gantt_container_width = (Difference_In_Days * this.step) + 'px';
      //Populating the dates.

      for (var i = 0; i < Difference_In_Days; i++) {
        const cueerntDate = new Date(this.datestoshow.start);
        const reqdate = new Date(this.datestoshow.start);
        reqdate.setDate(cueerntDate.getDate() + (i));
        this.dates.push({ day: reqdate.getDate(), date: reqdate, month: this.months[reqdate.getMonth()], isweekend: (reqdate.getDay() == 0 || reqdate.getDay() == 6) ? true : false });
      }
    }

  }

  //Parsing the data
  async parsedTasks(tasksdata) {

    if (tasksdata.length > 0) {
      //Sorted Tasks
      var SortedTask: any = [];

      //Child Indexd Task
      var child_index: any = [];
      //Tasks before Sorting
      var sortedBefore: any = [];

      function findchilds(index, dependencyid, rec) {

        for (var j = index + 1; j < sortedBefore.length; j++) {

          if (sortedBefore[j].task._dependency_task) {
            const parenttaskID = dependencyid;
            const idi = sortedBefore[j].task._dependency_task + '';
            const idj = parenttaskID + '';

            if (idi === idj) {

              SortedTask.push(sortedBefore[j]);

              if (sortedBefore[j].task && sortedBefore[j].task._dependent_child) {

                if (sortedBefore[j].task._dependent_child.length > 0) {
                  findchilds(index, sortedBefore[j]._id, true);
                }
              }

            }
          }
        }
      }


      function isAlready() {
        var already = false;

        //Checking Task already pused or not
        for (var k = SortedTask.length - 1; k >= 0; k--) {

          if (sortedBefore[i]._id == SortedTask[k]._id) {
            already = true;
            break;
          }
        }

        return already;
      }

      for (var a = 0; a < tasksdata.length; a++) {

        if (tasksdata[a].task._dependency_task) {
          child_index.push(tasksdata[a]);
        } else {
          sortedBefore.push(tasksdata[a]);
        }
      }
      child_index.map(child => {
        sortedBefore.push(child);
      });

      SortedTask.push(sortedBefore[0]);

      for (var i = 0; i < sortedBefore.length; i++) {
        // Check bit task is already pushed or not
        var already = isAlready();

        //If not already pushed pushing into  SortedTask array.
        if (!already) {
          SortedTask.push(sortedBefore[i]);
        }

        //Finding the child of the current task and pushing into  SortedTask array.
        if ((i < sortedBefore.length - 1) && (sortedBefore.length != SortedTask.length)) {

          findchilds(i, sortedBefore[i]._id, false);
        }

      }
      this.tasksdata = [];
      //Saving the only required fields of the task in tasksData array.

      SortedTask.map(x => {
        const startdate: any = new Date(x.task.start_date);
        const endate: any = new Date(x.task.due_to);
        var Difference_In_Time = endate.getTime() - startdate.getTime();
        var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

        if (x.task.due_to && x.task.start_date && !(x.task._parent_task)) {
          this.tasksdata.push({
            id: x._id,
            name: x.title,
            start: x.task.start_date,
            end: x.task.due_to,
            progress: '0',
            dependent_tasks: x?.task?._dependent_child,
            difference: Difference_In_Days,
            dependency_index: x?.parentIndex,
            custom_class: x?.task.status,
            _groupid: x?._group._id,
            dependency: x?.task._dependency_task,
            image: (x?._assigned_to?.length > 0) ? this.baseUrl + '/' + x._assigned_to[0].profile_pic : undefined,
            noOfParticipants: (x?._assigned_to?.length > 1) ? x?._assigned_to?.length - 1 : undefined,
            task: x
          });
        } else {
          if (x.task._dependency_task) {
            this.tasksdata.push({
              id: x._id,
              name: x.title,
              start: x.task.start_date,
              end: x.task.due_to,
              progress: '0',
              dependent_tasks: x?.task?._dependent_child,
              dependency_index: x?.parentIndex,
              difference: Difference_In_Days,
              custom_class: x?.task.status,
              _groupid: x?._group._id,
              dependency: x?.task._dependency_task,
              image: (x?._assigned_to?.length > 0) ? this.baseUrl + '/' + x._assigned_to[0].profile_pic : undefined,
              noOfParticipants: (x?._assigned_to?.length > 1) ? x?._assigned_to?.length - 1 : undefined,
              task: x
            });
          }
        }
      });
    }
  }

  //Get the Min date
  async min_date(all_dates) {
    var min_dt = all_dates[0]?.start,
      min_dtObj = new Date(all_dates[0]?.start);
    all_dates.forEach(function (dt, index) {

      if (new Date(dt.start) < min_dtObj) {
        min_dt = dt.start;
        min_dtObj = new Date(dt.start);
      }
    });
    return min_dt;
  }
  //Get the Min date
  async max_date(all_dates) {
    var max_dt = all_dates[0]?.end,
      max_dtObj = new Date(all_dates[0]?.end);
    all_dates.forEach(function (dt, index) {

      if (new Date(dt.end) > max_dtObj) {
        max_dt = dt.end;
        max_dtObj = new Date(dt.end);
      }
    });
    return max_dt;
  }

  // Find Index of date
  find_index(date) {
    var dateindex;
    this.dates.forEach((dt, index) => {
      var a = new Date(dt.date);
      var b = new Date(date);
      if (this.datePipe.transform(a, "yyyy-MM-dd") === this.datePipe.transform(b, "yyyy-MM-dd")) {
        dateindex = index;
      }
    });
    return dateindex;;
  }

  //Current date index
  async get_current_date_index() {
    this.dates.forEach((dt, index) => {
      var a = new Date(dt.date);
      var c = new Date();

      if (this.datePipe.transform(a, "yyyy-MM-dd") === this.datePipe.transform(c, "yyyy-MM-dd")) {
        this.current_date_index = index;
      }
    });
  }

  //ADD INDEX
  async add_index() {
    this.tasksdata.forEach((task, index) => {
      this.tasksdata[index].index_date = this.find_index(task.start);
    });
  }

  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }
}
