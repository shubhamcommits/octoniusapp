import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

import interact from 'interactjs';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit, AfterViewInit {

  @Input() task;
  @Input() cellWidth;

  @Output() taskSavedEmitter = new EventEmitter();

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  showImg = true;

  constructor(
    private postService: PostService,
    private utilityService: UtilityService){
  }

  ngOnInit() {
    this.initInteractjs();
  }

  ngAfterViewInit() {
    this.showImg = document.getElementById(this.task._id).offsetWidth > 140;
  }

  initInteractjs() {
    const position = { x: 0, y: 0 };

    let resizeRight = 0;
    let resizeLeft = 0;
    let initialX = 0;

    interact('#task_' + this.task._id).resizable({
      edges: { left: true, right: true, bottom: false, top: false },
      onstart: (event) => {
        resizeLeft = event.rect.left;
        resizeRight = event.rect.right;
        initialX = (parseFloat(event.target.getAttribute('data-x')) || 0);
      },
      onmove: (event) => {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0);
        var y = (parseFloat(target.getAttribute('data-y')) || 0);

        // update the element's style
        target.style.width = event.rect.width + 'px';
        // target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        // y += event.deltaRect.top

        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        // target.setAttribute('data-y', y)
        // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
      },
      onend: (event) => {
        var target = event.target;
        var x = initialX;
        var y = (parseFloat(target.getAttribute('data-y')) || 0);

        let offsetDay	= 0;
        let date_field = '';
        let newDate;
        if (event.edges.left) {
          const numDays = (event.rect.left - resizeLeft)/this.cellWidth;
          const numDaysRound = Math.round(numDays);
          const decimals = numDays % 1;

          if (numDays < 0) {
            if (decimals < 0 && decimals > -0.5) {
              offsetDay	= numDaysRound - 1;
            } else {
              offsetDay	= numDaysRound;
            }
            x += (offsetDay * this.cellWidth);
          } else {
            if (decimals < 0.5) {
              offsetDay	= numDaysRound;
            } else {
              offsetDay	= numDaysRound - 1;
            }
            x -= (offsetDay * this.cellWidth);
          }

          newDate = this.addDaysToDate(new Date(this.task.task.start_date), offsetDay);
          date_field = 'start_date';
        }

        if (event.edges.right) {
          const numDays = (event.rect.right - resizeRight)/this.cellWidth;
          const numDaysRound = Math.round(numDays);
          const decimals = numDays % 1;

          if (numDays < 0) {
            if (decimals < 0 && decimals > -0.5) {
              offsetDay	= numDaysRound;
            } else {
              offsetDay	= numDaysRound + 1;
            }
            x += (offsetDay * this.cellWidth);
          } else {
            if (decimals < 0.5) {
              offsetDay	= numDaysRound + 1;
            } else {
              offsetDay	= numDaysRound;
            }
            x -= (offsetDay * this.cellWidth);
          }

          newDate = this.addDaysToDate(new Date(this.task.task.end_date), offsetDay);
          date_field = 'end_date';
        }

        initialX = 0;
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

        this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
          this.postService.saveTaskDates(this.task._id, newDate, date_field).then(res => {
            this.taskSavedEmitter.emit(res['post']);
            resolve(this.utilityService.resolveAsyncPromise(`Task updated!`));
          }).catch(err => {
            reject(this.utilityService.rejectAsyncPromise(`Unable to update the task, please try again!`));
          });
        }));
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 }
        })
      ],
      inertia: true
    })
    /*
    .draggable({
      startAxis: 'x',
      lockAxis: 'x',
      listeners: {
        start (event) {
          console.log(event);
          console.log(event.type, event.target)
        },
        move (event) {
          position.x += event.dx
          position.y += event.dy
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
        },
      }
    });
    */
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
}
