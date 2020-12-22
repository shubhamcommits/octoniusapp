import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit {

  @Input() tasks;
  date:any=[]
  months:any=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor() { }

  ngOnInit() {
    
    for(var i=15; i>0; i--){
      const cueerntDate = new Date();
      console.log("cueerntDate",cueerntDate,i);
      const reqdate = new Date();
      reqdate.setDate(cueerntDate.getDate() - i);
      console.log("reqdate",reqdate,i);

      this.date.push({day:reqdate.getDate(),date:reqdate,month:this.months[reqdate.getMonth()]});
    }
    for(var i=0; i<15; i++){
      const cueerntDate = new Date();
      const reqdate = new Date();
      reqdate.setDate(cueerntDate.getDate() + i);
      this.date.push({day:reqdate.getDate(),date:reqdate,month:this.months[reqdate.getMonth()],current:true});
    }

    console.log("dates",this.date);

  }

}
