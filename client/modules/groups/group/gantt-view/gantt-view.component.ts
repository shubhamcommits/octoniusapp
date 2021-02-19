import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import { PostService } from 'src/shared/services/post-service/post.service';
import { DatePipe } from '@angular/common';
import { reduce } from 'rxjs/operators';
import moment from 'moment/moment'
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

  //projects data
  projectsdata:any = [];
  //date for calendar Nav
  dates: any = [];
  //Month
  months: any = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  //container Width
  gantt_container_width: string;
  //header Width
  gantt_header_width: string;
  //container height
  gantt_container_height: string;
  //screen height
  screen_height:string;
  //container height
  current_date_index: any;
  selectedProjectIndex:number = 0;
  //Grid column width
  step = 50;
  //Card  height
  card_height = 40;
  //Lines Array
  tasksStartingHeight = 0;
  linesArray: any = [];

  constructor(private utilityService: UtilityService, private postService: PostService, private datePipe: DatePipe) { }

  async ngOnInit() {
    
    await this.parsedTasks(this.tasks);
    this.datestoshow.start = await this.min_date(this.tasksdata);
    this.datestoshow.end = await this.max_date(this.tasksdata)
    await this.generateNavDate();
    await this.add_index();
    await this.parsedProjects(this.columns);
    await this.taskAfterDueDate();
    console.log("tasks oninit",this.tasksdata,this.projectsdata);
    await this.get_current_date_index()
    var ganttHeight = (100 + this.tasksdata.length * 60) + (this.tasksStartingHeight);
    var screenHeight = window.innerHeight - 100;

    if (ganttHeight > screenHeight) {
      this.gantt_container_height = (ganttHeight+100) + 'px';
    } else {
      this.gantt_container_height = (screenHeight+100) + 'px';
    }
    this.screen_height = screenHeight + 'px';
    document.getElementsByTagName("body")[0].style.overflow = 'hidden';
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

      this.projectsdata.forEach(project => {
        for (let i = 0; i < project.tasks.length; i++) {
          if (project.tasks[i] && project.tasks[i].dependency) {
            this.linesArray.push(new LeaderLine(document.getElementById(project.tasks[i]?.dependency), document.getElementById(project.tasks[i]?.id), {
              startPlug: 'disc',
              startSocket: 'right',
              endSocket: 'left',
              size: 2,
              color: '#4a90e2',
            }));
          }
        }
      });

      document.getElementById('fixed-container-gantt').addEventListener('scroll', this.linePotionsListener.bind(this), false);
    }, 50);
  };

  linePotionsListener() {
    this.screen_height = (window.innerHeight - 100) + 'px';
    this.linesArray.forEach(line => {
      const linesAll = document.getElementsByClassName('leader-line');
      for (let index = 0; index < linesAll.length; index++) {
        const viewboxvalue = linesAll[index].attributes['viewBox'].nodeValue;
        const values=viewboxvalue.split(" ");
        const left = 130;
        const top = 260;
        if(Number(values[0])<left || Number(values[1]<top )){
          linesAll[index].setAttribute('style','display:none');
        } else {
          linesAll[index].setAttribute('style',`left:${values[0]}px;top: ${values[1]}px; width: ${values[2]}px; height: ${values[3]}px;`);
        }
        
      }
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
    if(event.item.element.nativeElement.attributes['projectindex']){
      var projectId = event.item.element.nativeElement.attributes['projectindex'].nodeValue;
    }
    if(projectId){
      var project = this.projectsdata[projectId];
      var Taskindex = event.item.element.nativeElement.attributes['taskindex'].nodeValue;
      var task = project.tasks[Taskindex];
    } else {
      var Taskindex = event.item.element.nativeElement.attributes['taskindex'].nodeValue;
      var task = this.tasksdata[event.item.element.nativeElement.attributes['taskindex'].nodeValue];
    }
    
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
    if(projectId){
      var newEndDate = moment.utc(this.projectsdata[projectId].tasks[Taskindex].end,'YYYY-MM-DD').add(days,'days',);
      var newStartDate = moment.utc(this.projectsdata[projectId].tasks[Taskindex].start,'YYYY-MM-DD').add(days,'days');
      this.projectsdata[projectId].tasks[Taskindex];
      this.projectsdata[projectId].tasks[Taskindex].index_date = updated_x;
      this.projectsdata[projectId].tasks[Taskindex].end = newEndDate.format("YYYY-MM-DD");
      this.projectsdata[projectId].tasks[Taskindex].task.task.due_to = newEndDate.format("YYYY-MM-DD");
      this.projectsdata[projectId].tasks[Taskindex].task.task.start_date = newStartDate.format("YYYY-MM-DD")
      this.projectsdata[projectId].tasks[Taskindex].start = newStartDate.format("YYYY-MM-DD")
      this.dateupdate(this.projectsdata[projectId].tasks[Taskindex], newStartDate.format("YYYY-MM-DD"), newEndDate.format("YYYY-MM-DD"), days, days, this.projectsdata[projectId].tasks[Taskindex]?._groupid);

    }else{
      var newEndDate = moment.utc(this.tasksdata[Taskindex].end,'YYYY-MM-DD').add(days,'days',);
      var newStartDate = moment.utc(this.tasksdata[Taskindex].start,'YYYY-MM-DD').add(days,'days');
      this.tasksdata[Taskindex].index_date = updated_x;
      this.tasksdata[Taskindex].end = newEndDate.format("YYYY-MM-DD");
      this.tasksdata[Taskindex].task.task.due_to = newEndDate.format("YYYY-MM-DD");
      this.tasksdata[Taskindex].task.task.start_date = newStartDate.format("YYYY-MM-DD")
      this.tasksdata[Taskindex].start = newStartDate.format("YYYY-MM-DD")
      this.dateupdate(this.tasksdata[Taskindex], newStartDate.format("YYYY-MM-DD"), newEndDate.format("YYYY-MM-DD"), days, days, this.tasksdata[Taskindex]?._groupid);
    }
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
  onResizeEnd(event: ResizeEvent, Taskid: string, Taskindex:number,projectIndex?:number): void {

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
      if(projectIndex>=0){
        var newEndDate = moment.utc(this.projectsdata[projectIndex].tasks[Taskindex].end,"YYYY-MM-DD").add(multiple,'days');
        this.projectsdata[projectIndex].tasks[Taskindex].end = newEndDate.format("YYYY-MM-DD");
        this.projectsdata[projectIndex].tasks[Taskindex].task.task.due_to = newEndDate.format("YYYY-MM-DD");
        this.dateupdate(this.projectsdata[projectIndex].tasks[Taskindex], this.projectsdata[projectIndex].tasks[Taskindex].start, newEndDate.format("YYYY-MM-DD"), 0, multiple, this.projectsdata[projectIndex].tasks[Taskindex]?._groupid);

      }else{
        var newEndDate = moment.utc(this.tasksdata[Taskindex].end,"YYYY-MM-DD").add(multiple,'days');
        this.tasksdata[Taskindex].end = newEndDate.format("YYYY-MM-DD");
        this.tasksdata[Taskindex].task.task.due_to = newEndDate.format("YYYY-MM-DD");
        this.dateupdate(this.tasksdata[Taskindex], this.tasksdata[Taskindex].start, newEndDate.format("YYYY-MM-DD"), 0, multiple, this.tasksdata[Taskindex]?._groupid);
      }
      

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
      if(projectIndex>=0){
        var newStartDate = moment.utc(this.projectsdata[projectIndex].tasks[Taskindex].start,"YYYY-MM-DD").add(multiple,'days');
        this.projectsdata[projectIndex].tasks[Taskindex].task.task.start_date = newStartDate.format("YYYY-MM-DD");
        this.projectsdata[projectIndex].tasks[Taskindex].start = newStartDate.format("YYYY-MM-DD");
        this.dateupdate(this.projectsdata[projectIndex].tasks[Taskindex], newStartDate.format("YYYY-MM-DD"), this.projectsdata[projectIndex].tasks[Taskindex].end, multiple, 0, this.projectsdata[projectIndex].tasks[Taskindex]?._groupid);
      }else{
        var newStartDate = moment.utc(this.tasksdata[Taskindex].start,"YYYY-MM-DD").add(multiple,'days');
        this.tasksdata[Taskindex].task.task.start_date = newStartDate.format("YYYY-MM-DD");
        this.tasksdata[Taskindex].start = newStartDate.format("YYYY-MM-DD");
        this.dateupdate(this.tasksdata[Taskindex], newStartDate.format("YYYY-MM-DD"), this.tasksdata[Taskindex].end, multiple, 0, this.tasksdata[Taskindex]?._groupid);
      }
     
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
    this.columns.forEach(column => {
      if(updatedTask?.task?._column?._id == column._id){
        column.tasks.push(updatedTask);
      }
    });
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
    this.datestoshow.end = await this.max_date(this.tasksdata);
    this.dates = [];
    await this.generateNavDate();
    await this.add_index();
    await this.parsedProjects(this.columns);
    await this.taskAfterDueDate();
    console.log("tasks refresh",this.tasksdata,this.projectsdata);
    await this.get_current_date_index()
    var ganttHeight = (100 + this.tasksdata.length * 60) + (this.tasksStartingHeight);
    var screenHeight = window.innerHeight - 100;

    if (ganttHeight > screenHeight) {
      this.gantt_container_height = (ganttHeight+100) + 'px';
    } else {
      this.gantt_container_height = (screenHeight+100) + 'px';
    }
    this.screen_height = screenHeight + 'px';
    document.getElementsByTagName("body")[0].style.overflow = 'hidden';

    this.lineRemove();
    // this.linesArray = [];
    this.linesGenetate(true);
  }

  //Generate the dates for Nav
  async generateNavDate() {
    if (moment(moment.utc(this.datestoshow.start).format("YYYY-MM-DD")).isAfter(moment().format("YYYY-MM-DD"))) {
      // Find duration between start and end date
      const currentDate = moment().format('YYYY-MM-DD');
      
      if (moment(moment.utc(this.datestoshow.end).format("YYYY-MM-DD")).isBefore(moment().format('YYYY-MM-DD'))) {
        var endDate = moment();
      } else {
        var endDate = moment.utc(this.datestoshow.end);
      }

      var Difference_In_Days = endDate.diff(currentDate,'days');
      
      if (Difference_In_Days < 26) {
        var lessdays = 26 - Difference_In_Days;
        Difference_In_Days = Difference_In_Days + lessdays;
      } else {
        Difference_In_Days = Difference_In_Days + 2
      }
      //Continer width

      this.gantt_container_width = (Difference_In_Days * this.step) + 'px';
      //Populating the dates.
      if(Difference_In_Days * this.step > this.columns.length*350){
        this.gantt_header_width = (Difference_In_Days * this.step) + 'px';
      } else {
        this.gantt_header_width = (this.columns.length*350) + 'px';
      }

      for (var i = 0; i < Difference_In_Days; i++) {
        const reqdate =  moment(moment(),"YYYY-MM-DD").add(i,'days');
        this.dates.push({ day: reqdate.date(), date: reqdate, month: this.months[reqdate.month()], isweekend: (reqdate.day() == 0 || reqdate.day() == 6) ? true : false });
      }
    } else {
      // Find duration between start and end date
      const currentDate = moment(moment.utc(this.datestoshow.start).format("YYYY-MM-DD"))
      if (moment(moment.utc(this.datestoshow.end).format("YYYY-MM-DD")).isBefore(moment().format("YYYY-MM-DD"))) {
        var endDate = moment();
      } else {
        var endDate = moment.utc(this.datestoshow.end);
      }
      var Difference_In_Days = moment.utc(endDate).diff(currentDate,'days');

      // var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

      if (Difference_In_Days < 26) {
        var lessdays = 26 - Difference_In_Days;
        Difference_In_Days = Difference_In_Days + lessdays;
      } else {
        Difference_In_Days = Difference_In_Days + 2
      }
      //Continer width
      this.gantt_container_width = (Difference_In_Days * this.step) + 'px';

      if(Difference_In_Days * this.step > this.columns.length*350){
        this.gantt_header_width = (Difference_In_Days * this.step) + 'px';
      } else {
        this.gantt_header_width = (this.columns.length*350) + 'px';
      }

      //Populating the dates.

      for (var i = 0; i < Difference_In_Days; i++) {
        const reqdate = moment.utc(this.datestoshow.start,"YYYY-MM-DD").add(i,'days');
        this.dates.push({ day: reqdate.date(), date: reqdate, month: this.months[reqdate.month()], isweekend: (reqdate.day() == 0 || reqdate.day() == 6) ? true : false });
      }
    }

  }

  scroll(id: string,index:number) {
    this.selectedProjectIndex = index;
    const el=document.getElementById(id);
    if(el){
      const elTop = Number(el.style.top.substring(0,el.style.top.length-2))-110;
      const elLeft = Number(el.style.left.substring(0,el.style.left.length-2));
      document.getElementById('fixed-container-gantt').scrollTo({top: elTop,
        left: elLeft,
        behavior: 'smooth'});

    }
   
}

  async parsedProjects(columnsData:any){

    let index=0;
    this.projectsdata=[];
    let tasktobedeleted:any=[];
    columnsData.forEach(column => {
      if(column.due_date && column.start_date && column.project_type){
        const newColumnsData = {
          data:column,
          differencedays: moment(column?.due_date).diff(column?.start_date,'days'),
          startingIndex: this.find_index(moment(column.start_date).format("YYYY-MM-DD")),
          noOfTasks:column?.tasks?.length || 0,
          id:column._id,
          startheight: index===0?100:((60*this.projectsdata[index-1].tasks.length)+(this.projectsdata[index-1].startheight)+160),
          tasks:[],
          taskAfterDueDate:undefined,
          taskAfterDueDateStart:this.find_index(moment(column.due_date).format("YYYY-MM-DD"))
        }

        for (let i = 0; i < this.tasksdata.length; i++) {
          if(this.tasksdata[i]?.projectId+'' == column._id+''){
             newColumnsData.tasks.push(this.tasksdata[i]);
             tasktobedeleted.push(this.tasksdata[i].id);
           }  
        }
        this.projectsdata.push(newColumnsData);
        index++;
      }
    });
    
    tasktobedeleted.forEach(userID => {
      let deleted=0;
      this.tasksdata.forEach(task => {
        if(userID == task.id){
          this.tasksdata.splice(deleted,1);
        }
        deleted++;
      });
    });

    if(this.projectsdata.length>0){
      const last_project = this.projectsdata[this.projectsdata.length-1];
      this.tasksStartingHeight = (last_project.startheight)+(60*last_project.noOfTasks+100);
    }
  }

  async taskAfterDueDate(){
    for (let index = 0; index < this.projectsdata.length; index++) {
      for (let i = 0; i < this.projectsdata[index].tasks.length; i++) {
        if(moment(moment.utc(this.projectsdata[index].tasks[i].end).format("YYYY-MM-DD")).isAfter(moment.utc(this.projectsdata[index].data.due_date).format("YYYY-MM-DD")))
        {
          this.projectsdata[index].taskAfterDueDate = moment(moment.utc(this.projectsdata[index].tasks[i].end).format("YYYY-MM-DD")).diff(moment.utc(this.projectsdata[index].data.due_date).format("YYYY-MM-DD"),'days');
        }  
      }
      
    }
  }

  //Parsing the data
  async parsedTasks(tasksdata:any) {

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
        const startdate: any = moment(moment.utc(x.task.start_date).format("YYYY-MM-DD"));
        const endate: any = moment(moment.utc(x.task.due_to).format("YYYY-MM-DD"));
        var Difference_In_Days = moment(endate).diff(startdate,'days');
        // var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

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
            projectId:(x?.task?._column._id)?x?.task?._column._id:x?.task?._column,
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
              projectId:x?.task?._column,
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
      min_dtObj = moment.utc(all_dates[0]?.start);
    all_dates.forEach(function (dt, index) {

      if (moment.utc(dt.start).isBefore(min_dtObj)) {
        min_dt = dt.start;
        min_dtObj = moment.utc(dt.start);
      }
    });

    this.columns.forEach(column => {
      if (moment.utc(column.start_date).isBefore(min_dtObj)) {
        min_dt = column.start_date;
        min_dtObj = moment.utc(column.start_date);
      }
    });
    return min_dt;
  }
  //Get the Min date
  async max_date(all_dates) {
    var max_dt = all_dates[0]?.end,
      max_dtObj = moment.utc(all_dates[0]?.end);
    all_dates.forEach(function (dt, index) {

      if (moment.utc(dt.end).isAfter(max_dtObj)) {
        max_dt = dt.end;
        max_dtObj = moment.utc(dt.end);
      }
    });

    this.columns.forEach(column => {
      if (moment.utc(column.due_date).isAfter(max_dtObj)) {
        max_dt = column.due_date;
        max_dtObj = moment.utc(column.due_date);
      }
    });

    return max_dt;
  }

  // Find Index of date
  find_index(date) {
    var dateindex;
    this.dates.forEach((dt, index) => {
      var a = moment(dt.date);
      var b = moment(moment.utc(date).format("YYYY-MM-DD"));
      if (a.format("YYYY-MM-DD") === b.format("YYYY-MM-DD")) {
        dateindex = index;
      }
    });
    return dateindex;;
  }

  //Current date index
  async get_current_date_index() {
    this.dates.forEach((dt, index) => {
      var a = moment(dt.date);
      var c = moment();

      if (a.format("YYYY-MM-DD") === c.format("YYYY-MM-DD")) {
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
  formateDate(date: any, format: string){
    return date ? moment.utc(date).format(format) : '';
  }
}
