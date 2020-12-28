import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit {

  @Input() tasks;
  @Input() userData;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  //Calendaer start and end date
  datestoshow:any={start:'2020-12-30',end:'2021-01-15'}
  
  //task parsed data
  tasksdata:any=[]

  //date for calendar Nav
  date:any=[]

  //Month
  months:any=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  //container Width
  svg_width:string

  //container height
  svg_height:string

  //container height
  current_date_index:any

  //Grid column width
  step=50;

  //Card  height
  card_height=40;


  constructor(private utilityService: UtilityService) {}

  //onupdate task
  async updateTask(updatedTask:any){
    console.log("updateTask",updatedTask,this.tasks);
    for(var i=0;i<this.tasks.length;i++){
      if(this.tasks[i]._id == updatedTask._id){
        console.log("Am here equal");
        this.tasks[i] = updatedTask;
      }else if(this.tasks[i]._id == updatedTask?.task?._parent_task?._id){
        console.log("Am here equal  parent");
        var Exist=false;
        this.tasks.forEach(task => {
          if(task._id == updatedTask._id){
            Exist=true;
          }
        });
        if(!Exist){
          this.tasks.push(updatedTask);
        } 
      }
    }
    console.log("After updateTask",this.tasks);
    await this.refreshChart();

  }

  //onDeleteEvent
  async onDeleteEvent(deletedTask:any){
    console.log("onDeleteEvent",deletedTask,this.tasks);
    for(var i=0;i<this.tasks.length;i++){
      if(this.tasks[i]._id == deletedTask){
        console.log("Am here equal");
        this.tasks.splice(i,1);
      }
    }
    console.log("after onDeleteEvent",this.tasks);
    await this.refreshChart();
  }
  //open model
  openFullscreenModal(postData: any,): void {
    console.log('postData',postData)
      const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, postData._group._id);
      
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteEvent(data);
      });
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);

      });
      const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
        this.onDeleteEvent(data._id);
      });
      
      dialogRef.afterClosed().subscribe(result => {
        deleteEventSubs.unsubscribe();
        closeEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
      });
  }

  //refresh Chart
  async refreshChart(){
    // document.getElementById("main_container").innerHTML = "";
    console.log("this.tasks",this.tasks);
    await this.parsedTasks(this.tasks);
    this.datestoshow.start= await this.min_date(this.tasksdata);
    this.datestoshow.end= await this.max_date(this.tasksdata)
    console.log("dates points",this.datestoshow.start,this.datestoshow.end)
    this.date = [];
    await this.generateNavDate();
    await this.add_index();
    await this.get_current_date_index()
    console.log("current_date_index",this.current_date_index);
    console.log("this.tasksdata",this.tasksdata);
    this.svg_height=(100+this.tasksdata.length*60)+'px'
    console.log("this.svg_height",this.svg_height);
  }

  //Generate the dates for Nav
  async generateNavDate(){
    if(new Date(this.datestoshow.start).getTime() > new Date().getTime()){
       // Find duration between start and end date
        console.log("from calendar",this.datestoshow);
        const date1=new Date()
        const date2=new Date(this.datestoshow.end)
        var Difference_In_Time = date2.getTime() - date1.getTime(); 
        var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
        if(Difference_In_Days<26){
          var lessdays=26-Difference_In_Days;
          Difference_In_Days=Difference_In_Days+lessdays;
          console.log("Difference_In_Days",Difference_In_Days);
        }
       
        //Continer width
        this.svg_width=(Difference_In_Days*this.step)+'px';

        console.log("this.svg_width",this.svg_width);

        //Populating the dates.
       
        console.log("calendar dates before",this.date);
        for(var i=0; i<Difference_In_Days; i++){
          const cueerntDate = new Date();
          // console.log("cueerntDate",cueerntDate,this.datestoshow.start);
          const reqdate = new Date();
          reqdate.setDate(cueerntDate.getDate()+(i));
          console.log("reqdate",);
          this.date.push({day:reqdate.getDate(),date:reqdate,month:this.months[reqdate.getMonth()],isweekend:(reqdate.getDay()==0 || reqdate.getDay()==6 )?true:false});
        }

        console.log("calendar dates",this.date);
    } else {
      // Find duration between start and end date
      console.log("from calendar",this.datestoshow);
      const date1=new Date(this.datestoshow.start)
      const date2=new Date(this.datestoshow.end)
      var Difference_In_Time = date2.getTime() - date1.getTime(); 
      var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
      if(Difference_In_Days<26){
        var lessdays=26-Difference_In_Days;
        Difference_In_Days=Difference_In_Days+lessdays;
        console.log("Difference_In_Days",Difference_In_Days);
      }

      //Continer width
      this.svg_width=(Difference_In_Days*this.step)+'px';

      console.log("this.svg_width",this.svg_width);

      //Populating the dates.
      for(var i=0; i<Difference_In_Days; i++){
        const cueerntDate = new Date(this.datestoshow.start);
        // console.log("cueerntDate",cueerntDate,this.datestoshow.start);
        const reqdate = new Date(this.datestoshow.start);
        reqdate.setDate(cueerntDate.getDate()+(i));
        console.log("reqdate",);
        this.date.push({day:reqdate.getDate(),date:reqdate,month:this.months[reqdate.getMonth()],isweekend:(reqdate.getDay()==0 || reqdate.getDay()==6 )?true:false});
      }

      console.log("calendar dates",this.date);
    }
   
  }

  //Parsing the data
  async parsedTasks(tasksdata){

    if(tasksdata.length > 0){

      //Sorted Tasks
      var SortedTask: any=[];

      //Child Indexd Task
      var child_index:any =[];

      //Tasks before Sorting
      var sortedBefore:any = [];


      for(var a =0 ; a < tasksdata.length ; a++) {

          if(tasksdata[a].task._parent_task) {

              child_index.push(tasksdata[a]);

          } else {

              sortedBefore.push(tasksdata[a]);
          }
      }
      
      child_index.map(child => {

          sortedBefore.push(child);
      });

      // Tasks before Sorting
      console.log("sortedBefore",sortedBefore);


      SortedTask.push(sortedBefore[0]);

      for(var i= 0; i < sortedBefore.length; i++) {
        // C heck bit task is already pushed or not  
        var already=false;

        //Checking Task already pused or not
        for(var k =SortedTask.length-1; k >=0 ; k--) {

          if(sortedBefore[i]._id==SortedTask[k]._id) {
                  already=true;
          }
        }
          
        //If not already pushed pushing into  SortedTask array.
        if(!already){

          SortedTask.push(sortedBefore[i]);
        }

        //Finding the child of the current task and pushing into  SortedTask array.
        if(i < sortedBefore.length-1) {                  
          for(var j =i+1 ; j < sortedBefore.length ; j++) {
            if(sortedBefore[j].task._parent_task) {
              const parenttaskID=sortedBefore[j].task._parent_task;
              const idi = sortedBefore[i]._id+'';
              const idj = parenttaskID._id+'';
              if(idi===idj) {
                SortedTask.push(sortedBefore[j]);
              }
            }
          }
        }
      }
      this.tasksdata=[];
      
      //Saving the only required fields of the task in tasksData array.
      SortedTask.map(x => {
          const startdate:any=new Date(x.task.start_date);
          const endate:any=new Date(x.task.due_to);
          var Difference_In_Time = endate.getTime() - startdate.getTime(); 
          var Difference_In_Days = Math.floor(Difference_In_Time / (1000 * 3600 * 24));    
          if(x.task.due_to && x.task.start_date){
              this.tasksdata.push({
                  id:x._id,
                  name:x.title,
                  start:x.task.start_date,
                  end:x.task.due_to,
                  progress:'0',
                  difference:Difference_In_Days,
                  custom_class: x?.task.status,
                  image:(x?._assigned_to?.length>0)?this.baseUrl+'/'+x._assigned_to[0].profile_pic:undefined,
                  noOfParticipants:(x?._assigned_to?.length>1)?x?._assigned_to?.length-1:undefined,
                  dependencies:(x.task._parent_task)?x.task._parent_task._id:'',
                  task: x
              })
          }
      });
    } else {
      console.log("no data to show");
    }

  }

  //Get the Min date
  async min_date(all_dates) {
    var min_dt = all_dates[0]?.start,
    min_dtObj = new Date(all_dates[0]?.start);
    all_dates.forEach(function(dt, index) {
      if ( new Date( dt.start ) < min_dtObj) {
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
    all_dates.forEach(function(dt, index) {
      if ( new Date( dt.end ) > max_dtObj) {
        max_dt = dt.end;
        max_dtObj = new Date(dt.end);
      }
    });
    return max_dt;
  }

  // Find Index of date
   find_index(date){
    var dateindex;
    console.log("date",date);
    this.date.forEach((dt,index)=> {
     var a = new Date(dt.date);
     var b = new Date(date);
    //  console.log("date time",a.getDate()+a.getMonth()+a.getFullYear() , b.getDate()+b.getMonth()+b.getFullYear());
     if(a.getDate()+a.getMonth()+a.getFullYear() == b.getDate()+b.getMonth()+b.getFullYear()){
        console.log("amaasafs",date)
        dateindex=index;
      }

    });

    return dateindex;;
  }

  //Current date index
  async get_current_date_index(){
   
    this.date.forEach((dt,index)=> {
     var a = new Date(dt.date);
     var c = new Date();

    //  console.log("current Date",a.getDate()+a.getMonth()+a.getFullYear(), c.getDate()+c.getMonth()+c.getFullYear())
     if(a.getDate()+a.getMonth()+a.getFullYear() == c.getDate()+c.getMonth()+c.getFullYear()){
        console.log("cusdfsdfr",c);
        this.current_date_index=index;
      }
    });

  }



  //ADD INDEX
  async add_index(){
    this.tasksdata.forEach((task,index) => {
      console.log("find_index",this.find_index(task.start));
      this.tasksdata[index].index_date=this.find_index(task.start);
    });
  }

  async ngOnInit() {
    console.log("this.tasks",this.tasks);
    await this.parsedTasks(this.tasks);
    this.datestoshow.start= await this.min_date(this.tasksdata);
    this.datestoshow.end= await this.max_date(this.tasksdata)
    await this.generateNavDate();
    await this.add_index();
    await this.get_current_date_index()
    console.log("current_date_index",this.current_date_index);
    console.log("this.tasksdata",this.tasksdata);    var ganttHeight=100+this.tasksdata.length*60;
    var screenHeight=window.innerHeight-100;
    console.log("Chart height",ganttHeight,screenHeight)
    if(ganttHeight>screenHeight){
      this.svg_height=ganttHeight+'px';
    } else {
      this.svg_height=screenHeight+'px';
    }
    console.log("this.svg_height",this.svg_height);
  }

}
