import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-kanban-boards',
  templateUrl: './group-kanban-boards.component.html',
  styleUrls: ['./group-kanban-boards.component.scss']
})
export class GroupKanbanBoardsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService
  ) { }

  columns: any = []

  // Current Group Data
  groupData: any;

  // Subsink Object
  subSink = new SubSink();

  async ngOnInit() {

    // Fetch current group from the service
    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }))

    this.columns.push({
      title: 'to do',
      taskCount: 0,
      tasks: []
    })
  }

  getColumn(column: any) {

    let index = this.columns.findIndex((col: any)=> col.title.toLowerCase() === column.title.toLowerCase())

    if(index != -1 ){
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }
    else
      this.columns.push(column)
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
  }

}
