import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import moment from 'moment/moment'
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
  @Input() userData;
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

    interact('#task_' + this.task._id).resizable({
      edges: { left: true, right: true, bottom: false, top: false },
      onstart: (event) => {
        resizeLeft = event.rect.left;
        resizeRight = event.rect.right;
      },
      onmove: (event) => {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0);
        var y = (parseFloat(target.getAttribute('data-y')) || 0);

        // update the element's style
        target.style.width = event.rect.width + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;

        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
      },
      onend: (event) => {
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
          } else {
            if (decimals < 0.5) {
              offsetDay	= numDaysRound;
            } else {
              offsetDay	= numDaysRound - 1;
            }
          }

          newDate = moment(this.task.task.start_date).add(offsetDay,'days');
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
          } else {
            if (decimals < 0.5) {
              offsetDay	= numDaysRound + 1;
            } else {
              offsetDay	= numDaysRound;
            }
          }

          newDate = moment(this.task.task.end_date).add(offsetDay,'days');
          date_field = 'end_date';
        }

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
    .draggable({
      startAxis: 'xy',
      // lockAxis: 'x',
      onstart: (event) => {
        resizeLeft = event.rect.left;
        resizeRight = event.rect.right;
      },
      onmove: (event) => {
        var target = event.target
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        // translate the element
        target.style.webkitTransform =
          target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)'

        // update the posiion attributes
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
      },
      onend: (event) => {

        let offsetDay	= 0;
        const numDays = (event.rect.left - resizeLeft)/this.cellWidth;
        const numDaysRound = Math.round(numDays);
        const decimals = numDays % 1;

        if (numDays < 0) {
          if (decimals < 0 && decimals > -0.5) {
            offsetDay	= numDaysRound - 1;
          } else {
            offsetDay	= numDaysRound;
          }
        } else {
          if (decimals < 0.5) {
            offsetDay	= numDaysRound;
          } else {
            offsetDay	= numDaysRound - 1;
          }
        }

        const newStartDate =  moment(this.task.task.start_date).add(offsetDay,'days');
        const newEndDate = moment(this.task.task.end_date).add(offsetDay,'days');

        this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise(async (resolve, reject) => {
          await this.postService.saveTaskDates(this.task._id, newStartDate, 'start_date').then(res => {
            this.task = res['post'];
          }).catch(err => {
            reject(this.utilityService.rejectAsyncPromise(`Unable to update the task, please try again!`));
          });

          this.postService.saveTaskDates(this.task._id, newEndDate, 'end_date').then(res => {
            event.target.remove();
            this.taskSavedEmitter.emit(res['post']);
            resolve(this.utilityService.resolveAsyncPromise(`Task updated!`));
          }).catch(err => {
            reject(this.utilityService.rejectAsyncPromise(`Unable to update the task, please try again!`));
          });
        }));
      }
    });
/*
   .draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      autoScroll: true,
      // dragMoveListener from the dragging demo above
      onmove: (event) => {this.dragMoveListener(event)}
    })
*/
  }
}
