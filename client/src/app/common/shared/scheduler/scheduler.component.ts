import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { ResizeEvent } from 'angular-resizable-element';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

import interact from 'interactjs';

@Component({
  selector: 'scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {

  @Input() tasks;
  @Input() columns = [];
  @Input() groupData;
  @Input() userData;

  renderedTasks = [];

  enumMonths = [];													// List of objects describing all months within the view.
  enumDays = [];													// List of objects describing all days within the view.

  linesFill = []; // Empty the lines filling map

  nbLines = 5;
  currDate;
  viewStart;
  viewEnd;

  gridWidth; // Width of the rendered grid
  viewPeriod;	// Number of days in period of the view
  cellWidth; // Width of the days cells of the grid
  taskHeight = 50; // Height of events elements in pixels
  taskMargin = 10; // Margin above events elements for spacing
  formatMonth = 'MMMM yyyy';		// The JS date format for the month display in header
  formatDayLong = 'EEEE MMMM dd';	// The JS date format for the long display of dates (see https://docs.angularjs.org/api/ng/filter/date)
  // dayStartHour = 8;				// The hour number at which the day begins (default 08:00)
  // dayEndHour = 20;				// The hour number at which the day ends (default 20:00)

  constructor(
    public datepipe: DatePipe,
    private postService: PostService,
    private utilityService: UtilityService
    ) {

  }

  ngOnInit() {
    this.currDate = this.addDaysToDate(new Date(), 0);

    this.viewStart = this.addDaysToDate(this.currDate, -7);
    this.viewEnd = this.addDaysToDate(this.currDate, 14);

    this.renderView();

//    this.initInteractjs();
  }

  /*
  * (Re)Compute the view: grid and rendered tasks
  */
  renderView() {

    this.enumMonths = [];
    this.enumDays = [];

    this.linesFill = [];

    this.gridWidth = (document.getElementsByClassName('timelineContainer')[0]as HTMLElement).offsetWidth;
    this.viewPeriod = this.daysInPeriod(this.viewStart, this.viewEnd, false);
    this.cellWidth = this.gridWidth / (this.viewPeriod + 1);
    var lastMonth = -1, monthNumDays = 1, nbMonths = 0;

    for (var d = 0; d <= this.viewPeriod; d++) {

      var dayDate = this.addDaysToDate(this.viewStart, d);
      var today = (this.currDate.getTime() === dayDate.getTime());
      var isLastOfMonth = (this.daysInMonth(dayDate) === dayDate.getDate());

      for (var l = 1; l <= this.nbLines; l++) {
        this.linesFill[l] = [];
        for (var ld = 0; ld <= this.viewPeriod; ld++)
          this.linesFill[l].push(false);
      }

      // Populate the list of all days
      this.enumDays.push({
        num: this.datepipe.transform(dayDate, 'dd'),
        offset: d,
        date: dayDate,
        time: dayDate.getTime(),
        title: this.datepipe.transform(dayDate, this.formatDayLong),
        nbTasks: 0,
        today: today,
        isLastOfMonth: isLastOfMonth,
        // enumHours: this.listHoursInDay()
      });

      // Populate the list of all months
      monthNumDays += 1;
      if (lastMonth != dayDate.getMonth()) {
        this.enumMonths.push({
          num: dayDate.getMonth(),
          name: this.datepipe.transform(dayDate, this.formatMonth)
        });
        lastMonth = dayDate.getMonth();
        monthNumDays = 1;
        nbMonths += 1;
      }
      if (this.enumMonths[nbMonths-1]) {
        this.enumMonths[nbMonths-1].numDays = monthNumDays;
      }
    }

    this.renderTasks();
  }

  renderTasks() {
    this.tasks.forEach((task) => {
      var eStart	= new Date(task.task.start_date).getTime(),
          eEnd	= new Date(task.task.end_date).getTime(),
          viewRealStart	= new Date(this.viewStart.getTime()),
          viewRealEnd		= new Date(this.viewEnd.getTime());
      viewRealStart.setHours(0); viewRealStart.setMinutes(0); viewRealStart.setSeconds(0);
      viewRealEnd.setHours(23); viewRealEnd.setMinutes(59); viewRealEnd.setSeconds(59);
      var vStart	= viewRealStart.getTime(),
        vEnd	= viewRealEnd.getTime();
      if (eStart < vStart && eEnd < vStart) // Do not render task if it's totally BEFORE the view's period
        return true;
      if (eStart > vEnd) // Do not render task if it's AFTER the view's period
        return true;

      // Calculate the left and width offsets for the task's element
      var offsetDays	= -this.daysInPeriod(new Date(task.task.start_date), this.viewStart, true);
      var taskLength = this.daysInPeriod(new Date(task.task.end_date), new Date(task.task.start_date), false) + 1;
      var taskWidth	= taskLength * this.cellWidth;
      var offsetLeft	= Math.floor(offsetDays * this.cellWidth);

      var daysExceed	= 0;
      var extraClass	= task.type;// + ' current ';

      // If the task's START date is BEFORE the current displayed view
      if (offsetDays < 0) {
        offsetLeft = 0;				// to stick the element to extreme left
        daysExceed = -offsetDays;	// to trim the total element's width
        // extraClass += 'overLeft ';	// to decorate the element's left boundary
      }
      // If the task's END date is AFTER the current displayed view
      if (eEnd > vEnd) {
        daysExceed = this.daysInPeriod(this.viewEnd, new Date(task.task.end_date), false);
        // extraClass += 'overRight ';	// to decorate the element's right boundary
      }
      // If the task's END date is BEFORE TODAY (to illustrate the fact it's in the past)
      if (eEnd < this.currDate)
        // extraClass += 'past ';

      // If the task is CURRENTLY active (over today)
      /*
      if (eStart <= this.currDate && eEnd >= this.currDate) {
        extraClass += 'current ';	// to illustrate the fact it's currently active
      }
      */

      // Add some classes to the element
      task.task.extraClasses = extraClass;

      // Store the number of tasks in enumDays array, and calculate the line (Y-axis) for the task
      task.task.line = 0;
      for (var n = 0; n < taskLength; n++) {
        var D = this.addDaysToDate(new Date(task.task.start_date), n);
        // var thisDay = $filter('filter')(this.enumDays, {time: D.getTime()}, true)[0];
        var thisDay = this.enumDays.filter(day => day === D.getTime())[0];
        if (!thisDay) continue;
        thisDay.nbTasks += 1;

        var dayFilled = false;
        this.linesFill.forEach((thisLine, numLine) => {
          if (thisLine[thisDay.offset] === false && !dayFilled) {
            thisLine[thisDay.offset] = thisDay.num + ': ' + task.title;
            dayFilled = true;
            task.task.line = Math.max(task.task.line, numLine-1);
            this.linesFill[task.task.line + 1][thisDay.offset] = thisDay.num + ': ' + task.task.title;
          }
        });
      }

      // Place and scale the task's element in DOM
      task.task.locScale = {
        'left': Math.floor(offsetLeft)+'px',
        'width': (taskWidth - (daysExceed * this.cellWidth))+'px',
        'top': (task.task.line * (this.taskHeight + this.taskMargin))+'px',
        'height': this.taskHeight+'px'
      };

      // Actually RENDER the task on the timeline
      this.renderedTasks.push(task);
    });
  }

  /**
   * Count the number of days between two dates
   *
   * @param {DATE} date1 Start date for period
   * @param {DATE} date2 End date for period
   * @param {BOOLEAN} wantDiff True to allow negative numbers in result
   * @returns {INT} Number of days in period between date1 and date2
   */
  daysInPeriod(date1, date2, wantDiff?) {
    var one_day	= 1000*60*60*24;
    date1.setHours(12); date1.setMinutes(0); date1.setSeconds(0); date1.setMilliseconds(0);
    date2.setHours(12); date2.setMinutes(0); date2.setSeconds(0); date2.setMilliseconds(0);
    var result	= (date2.getTime() - date1.getTime()) / one_day;
    return (wantDiff) ? result : Math.abs(result);
  }

  /**
   * Add some days to a date object
   *
   * @param {DATE} date Original date
   * @param {INT} days Number of days to add to the date
   * @returns {DATE} The resulting date object, normalized to noon (12:00:00.000)
   */
  addDaysToDate(date, days) {
    var mdate = new Date(date.getTime());
    mdate.setTime( mdate.getTime()+ days * 1000*60*60*24 );
    mdate.setHours(12); mdate.setMinutes(0); mdate.setSeconds(0); mdate.setMilliseconds(0);
    return mdate;
  }

  /**
   * Count the number of days in the month of a date
   *
   * @param {DATE} date The date to check the month of
   * @returns {INT} Number of days in the month of date
   */
  daysInMonth(date) {
    return new Date(date.getYear(), date.getMonth()+1, 0).getDate();
  }

  /**
   * Function to get the list of all hours within a working day (between dayStartHour & dayEndHour)
   *
   * @returns {ARRAY} The list of all hours within a working day
   */
  /*
  listHoursInDay() {
    var enumHours = [];
    for (var h = this.dayStartHour; h < (this.dayEndHour +1); h++)
      enumHours.push({ num: h, title: ('00' + h).substr(-2) });
    return enumHours;
  }
  */

  /*
  * Offset view to previous day
  */
  prevDay(){
    this.viewStart = this.addDaysToDate(this.viewStart, -1);
    this.viewEnd	= this.addDaysToDate(this.viewEnd, -1);
    this.renderView();
  };

  /*
  * Offset view to next day
  */
  nextDay(){
    this.viewStart = this.addDaysToDate(this.viewStart, 1);
    this.viewEnd	= this.addDaysToDate(this.viewEnd, 1);
    this.renderView();
  };

  /*
  * Zoom IN view (-1 day on each side)
  */
  zoomIn(step){
    /*
    if (this.daysInPeriod(this.viewStart, this.viewEnd) <= 2) {
      .throwError(2, "Aborting view draw: reached minimum days to show.");
      return;
    }
    */
    this.viewStart  = this.addDaysToDate(this.viewStart, +step);
    this.viewEnd	 = this.addDaysToDate(this.viewEnd, -step);
    this.renderView();
  };

  /*
  * Zoom OUT view (+1 day on each side)
  */
  zoomOut(step){
    /*
    if (this.daysInPeriod(this.viewStart, this.viewEnd) >= 365) {
      this.throwError(2, "Aborting view draw: reached maximum days to show.");
      return;
    }
    */
    this.viewStart  = this.addDaysToDate(this.viewStart, -step);
    this.viewEnd	 = this.addDaysToDate(this.viewEnd, +step);
    this.renderView();
  };

  /*
  * Center view to current day (defaults -7, +14 days)
  */
  centerView(daysBefore, daysAfter){
    if (typeof daysBefore === 'undefined') daysBefore = 7;
    if (typeof daysAfter === 'undefined') daysAfter = 14;
    this.viewStart  = this.addDaysToDate(new Date(), -daysBefore);
    this.viewEnd	 = this.addDaysToDate(new Date(), daysAfter);
    this.renderView();
  };

  /*
  * Offset view to next X days
  */
  nextCustom(days){
    if (typeof days === 'undefined') days = 15;
    this.viewStart = this.addDaysToDate(this.viewStart, days);
    this.viewEnd	= this.addDaysToDate(this.viewEnd, days);
    this.renderView();
  };

  /*
  * Offset view to previous X days
  */
  prevCustom(days){
    if (typeof days === 'undefined') days = 15;
    this.viewStart = this.addDaysToDate(this.viewStart, -days);
    this.viewEnd	= this.addDaysToDate(this.viewEnd, -days);
    this.renderView();
  };

/*
  initInteractjs() {
    interact('.dropTarget').dropzone({
        ondrop: function (event) {
          console.log(event.relatedTarget.id + ' was dropped into ' + event.target.id);
        }
      });
  }
*/

  taskSaved(task) {
    const indexTask = this.tasks.findIndex((post: any) => task._id === post._id);
    if (indexTask !== -1) {
      this.tasks[indexTask]= task;
    }
    this.renderView();
  }
}
