import { Component, OnInit, Injector } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-myspace-tasks',
  templateUrl: './myspace-tasks.component.html',
  styleUrls: ['./myspace-tasks.component.scss']
})
export class MyspaceTasksComponent implements OnInit {

  constructor(
    private injector: Injector,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {
    this.utilityService.startForegroundLoader();
    return this.utilityService.stopForegroundLoader();
  }

  async getTodayTasks() {
    let userService = this.injector.get(UserService);
    userService.getUserTodayTasks()
    .then((res)=>{
      return res['tasks']
    })
    .catch(()=>{
      return [];
    })
  }

}
