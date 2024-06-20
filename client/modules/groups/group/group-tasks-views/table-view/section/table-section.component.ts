import { Component, OnChanges, Input, Injector, ViewChild, Output, EventEmitter, SimpleChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-table-section',
  templateUrl: './table-section.component.html',
  styleUrls: ['./table-section.component.scss']
})
export class TableSectionComponent implements OnInit, OnChanges {

  @Input() groupData: any;
  @Input() userData: any;
  @Input() section: any;
  @Input() sections: any;
  @Input() customFields: any;
  @Input() isAdmin = false;
  @Input() isFirst = false;
  @Input() sortingBit: any;
  @Input() sortingData: any;
  @Input() filteringBit: any;
  @Input() filteringData: any;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;

  @Output() taskClonnedEvent = new EventEmitter();
  @Output() newSectionEvent = new EventEmitter();

  @ViewChild(MatAccordion, { static: true }) accordion: MatAccordion;

  tasks = [];

  unchangedTasks: any;
  
  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Property to know the selected field to add as column
  field: string;

  newColumnSelected;

  displayedColumns = ['title', 'tags', 'asignee', 'due_to', 'nsPercent', 'star'];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private postService: PostService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData =  await this.publicFunctions.getCurrentGroupDetails();
    }

    this.subSink.add(this.columnService.refresh$.subscribe((data) => {
      this.initSection();
    }));
  }

  async ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'sortingBit') {
        this.sortingBit = changes[propName].currentValue;
      }
      if (propName === 'sortingData') {
        this.sortingData = changes[propName].currentValue;
      }
      if (propName === 'filteringBit' || propName === 'filteringData') {
        this.tasks = await this.postService.filterTasks(this.unchangedTasks?.tasksList, this.filteringBit, this.filteringData, this.userData);
      }
    }

    this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
      
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  initSection() {
    this.postService.getTasksBySection(this.section?._id).then(async (res) => {
      this.tasks = res['posts'];

      if (this.groupData?.enabled_rights) {
        this.tasks = await this.postService.filterRAGTasks(this.tasks, this.groupData, this.userData);
      }

      let taskslist = [];
      if (this.tasks) {
        this.tasks.forEach(val => taskslist.push(Object.assign({}, val)));
      }
      let unchangedTasks: any = { tasksList: taskslist };
      this.unchangedTasks = JSON.parse(JSON.stringify(unchangedTasks));

      this.tasks = await this.postService.sortTasks([...this.tasks], this.sortingBit, this.sortingData);

      this.utilityService.updateIsLoadingSpinnerSource(false);
    });
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param section
   */
  getPost(post: any) {
    post.canEdit = true;
    // Adding the post to column
    this.tasks.unshift(post);

    // const doneTasks = [...section.tasks['done']];
    this.tasks = [...this.tasks];
  }

  /**
   * This function is responsible for updating the task in the UI when it changes the section
   * @param { data.post, data.oldSection} - data
   */
  // async onTaskChangeSection(data) {
  //   const post = data.post;
  //   if (post) {
  //     const oldSectionIndex = this.sections.findIndex((section) => (section._id || section) == data.oldSectionId);
  //     const sectionIndex = this.sections.findIndex((section) => (section._id || section) == (post.task._column._id || post.task._column));

  //     if (oldSectionIndex != -1 && sectionIndex != -1) {
  //       const oldIndexTask = this.sections[oldSectionIndex].tasks.findIndex((task: any) => task._id == post._id);
  //       const indexTask = this.sections[sectionIndex].tasks.findIndex((task: any) => task._id == post._id);

  //       if (oldIndexTask != -1) {
  //         this.sections[oldSectionIndex].tasks.splice(oldIndexTask, 1);
  //       }

  //       if (indexTask == -1) {
  //         this.sections[sectionIndex].tasks.unshift(post);
  //         this.sections[sectionIndex].tasks = [...this.sections[sectionIndex].tasks];
  //       }
  //     }
  //   }
  // }

  onTaskClonned(data) {
    this.getPost(data)
  }
}
