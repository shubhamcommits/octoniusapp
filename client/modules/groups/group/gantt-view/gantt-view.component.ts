import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit {

  @Input() tasks;
  //Calendaer start and end date
  datestoshow:any={start:'2020-12-30',end:'2021-01-15'}
  
  //date for calendar Nav
  date:any=[]

  //Month
  months:any=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  //container Width
  svg_width:any

  //Grid column width
  step=50;

  //Card  height
  card_height=40;


  constructor() {}

  //Generate the dates for Nav
  generateNavDate(){
    
    // Find duration between start and end date
    console.log("from calendar",this.datestoshow);
    const date1=new Date(this.datestoshow.start)
    const date2=new Date(this.datestoshow.end)
    var Difference_In_Time = date2.getTime() - date1.getTime(); 
    var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
    
    console.log("Difference_In_Days",Difference_In_Days);

    //Continer width
    this.svg_width=Difference_In_Days*this.step;

    console.log("this.svg_width",this.svg_width);

    //Populating the dates.
    for(var i=0; i<=Difference_In_Days; i++){
      const cueerntDate = new Date(this.datestoshow.start);
      const reqdate = new Date(this.datestoshow.start);
      reqdate.setDate(cueerntDate.getDate()+i);
      this.date.push({day:reqdate.getDate(),date:reqdate,month:this.months[reqdate.getMonth()]});
    }

    console.log("calendar dates",this.date);
  }

  //Parsing the data


  //Get the Min date
  min_date(all_dates) {
    var min_dt = all_dates[0],
    min_dtObj = new Date(all_dates[0]);
    all_dates.forEach(function(dt, index) {
      if ( new Date( dt ) < min_dtObj) {
        min_dt = dt;
        min_dtObj = new Date(dt);
      }
    });
    return min_dt;
  }

  //Get the Min date
  max_date(all_dates) {
    var max_dt = all_dates[0],
    max_dtObj = new Date(all_dates[0]);
    all_dates.forEach(function(dt, index) {
      if ( new Date( dt ) > max_dtObj) {
        max_dt = dt;
        max_dtObj = new Date(dt);
      }
    });
    return max_dt;
  }

  ngOnInit() {
    this.generateNavDate();
    console.log("this.tasks",this.tasks);
    console.log(this.min_date(['2015-02-01', '2015-02-02', '2015-01-03']));
    console.log(this.max_date(['2015/02/01', '2015/02/02', '2015/01/03']));

  }

}
