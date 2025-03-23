import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Output,
  EventEmitter,
  Injector,
  OnChanges,
  Renderer2,
} from "@angular/core";
import { environment } from "src/environments/environment";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { ResizeEvent } from "angular-resizable-element";
import { PostService } from "src/shared/services/post-service/post.service";
import { DatePipe } from "@angular/common";
import { PublicFunctions } from "modules/public.functions";
import { DateTime } from "luxon";
import { DatesService } from "src/shared/services/dates-service/dates.service";

declare var LeaderLine: any;

@Component({
  selector: "app-timeline-view",
  templateUrl: "./timeline-view.component.html",
  styleUrls: ["./timeline-view.component.scss"],
})
export class TimelineViewComponent implements OnChanges, AfterViewInit {
  @Input() userData;
  @Input() sections: any;
  @Input() isIdeaModuleAvailable;
  @Input() isShuttleTasksModuleAvailable;
  @Input() workspaceId;

  @ViewChild("myDiv") divView1: ElementRef;
  @ViewChild("myDiv2") divView2: ElementRef;

  tasks;

  groupData: any;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  //Calendaer start and end date
  datesToShow: any = { start: "2020-12-30", end: "2021-01-15" };
  //task parsed data
  tasksDataList: any = [];

  //projects data
  projectsdata: any = [];
  //date for calendar Nav
  dates: any = [];
  //Month
  months: any = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  //container Width
  timeline_container_width: string;
  //header Width
  timeline_header_width: string;
  //container height
  timeline_container_height: string;
  //screen height
  screen_height: string;
  //container height
  current_date_index: any;

  // selected project  index bit
  selectedProjectIndex: number = -1;
  //Grid column width
  step = 50;
  //Card  height
  card_height = 40;
  //Lines Array
  tasksStartingHeight = 0;
  linesArray: any = [];

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private postService: PostService,
    private datePipe: DatePipe,
    private renderer: Renderer2,
    private el: ElementRef,
    private injector: Injector
  ) {}

  ngOnChanges() {
    this.initView();
  }

  ngAfterViewInit() {
    this.linesGenetate();
  }

  ngOnDestroy() {
    this.lineRemove();
  }

  async initView() {
    // Fetch the current group
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.tasks = await this.publicFunctions.getPosts(
      this.groupData?._id,
      "task"
    );
    if (this.groupData.shuttle_type && this.isShuttleTasksModuleAvailable) {
      const shuttleTasks = await this.publicFunctions.getShuttleTasks(
        this.groupData?._id
      );
      this.tasks = this.tasks.concat(shuttleTasks);
    }

    if (this.groupData?.enabled_rights) {
      await this.postService.filterRAGTasks(
        this.tasks,
        this.groupData,
        this.userData
      );
    }

    this.sections?.forEach((section: any) => {
      section.tasks = [];
    });

    // Sort the tasks into their respective columns
    await this.sortTasksInSections(this.sections, this.tasks);

    this.refreshChart();
  }

  sortTasksInSections(sections: any, tasks: any) {
    if (!!sections) {
      sections.forEach(async (section: any) => {
        // Feed the tasks into that column which has matching property _column with the section title
        section.tasks = await tasks
          .filter(
            (post: any) =>
              (post.task._column &&
                (post.task._column._id || post.task._column) == section._id) ||
              (post.task.shuttle_type &&
                post.task.shuttles &&
                post.task.shuttles.findIndex(
                  (shuttle) =>
                    (shuttle._shuttle_section._id ||
                      shuttle._shuttle_section) == section._id
                ) >= 0)
          )
          .sort(function (t1, t2) {
            if (t1.task.status != t2.task.status) {
              return t1.task.status == "done" ? 1 : -1;
            }
            return t2.title - t1.title;
          });

        // Calculate number of done tasks
        section.numDoneTasks = section.tasks.filter(
          (post) => post?.task?.status?.toLowerCase() == "done"
        ).length;
      });
    }
  }

  linesGenetate() {
    setTimeout(() => {
      for (var i = 0; i < this.tasksDataList.length; i++) {
        if (this.tasksDataList[i] && this.tasksDataList[i].dependency) {
          if (typeof this.tasksDataList[i].dependency == "object") {
            this.tasksDataList[i].dependency.forEach((dependency) => {
              this.linesArray.push(
                new LeaderLine(
                  document.getElementById(dependency),
                  document.getElementById(this.tasksDataList[i]?.id),
                  {
                    startPlug: "disc",
                    startSocket: "right",
                    endSocket: "left",
                    size: 2,
                    color: "#4a90e2",
                  }
                )
              );
            });
          } else {
            this.linesArray.push(
              new LeaderLine(
                document.getElementById(this.tasksDataList[i]?.dependency),
                document.getElementById(this.tasksDataList[i]?.id),
                {
                  startPlug: "disc",
                  startSocket: "right",
                  endSocket: "left",
                  size: 2,
                  color: "#4a90e2",
                }
              )
            );
          }
        }
      }

      this.projectsdata.forEach((project) => {
        for (let i = 0; i < project.tasks.length; i++) {
          if (project.tasks[i] && project.tasks[i].dependency) {
            if (typeof project.tasks[i].dependency == "object") {
              project.tasks[i]?.dependency?.forEach((dependency) => {
                if (
                  document.getElementById(dependency) &&
                  document.getElementById(project.tasks[i]?.id)
                ) {
                  this.linesArray.push(
                    new LeaderLine(
                      document.getElementById(dependency),
                      document.getElementById(project.tasks[i]?.id),
                      {
                        startPlug: "disc",
                        startSocket: "right",
                        endSocket: "left",
                        size: 2,
                        color: "#4a90e2",
                      }
                    )
                  );
                }
              });
            } else {
              if (
                document.getElementById(project.tasks[i]?.dependency) &&
                document.getElementById(project.tasks[i]?.id)
              ) {
                this.linesArray.push(
                  new LeaderLine(
                    document.getElementById(project.tasks[i]?.dependency),
                    document.getElementById(project.tasks[i]?.id),
                    {
                      startPlug: "disc",
                      startSocket: "right",
                      endSocket: "left",
                      size: 2,
                      color: "#4a90e2",
                    }
                  )
                );
              }
            }
          }
        }
      });

      document
        .getElementById("fixed-container-timeline")
        ?.addEventListener(
          "scroll",
          this.linePotionsListener.bind(this),
          false
        );
    }, 50);
  }

  linePotionsListener() {
    this.screen_height = window.innerHeight - 100 + "px";
    this.linesArray.forEach((line) => {
      const linesAll = document.getElementsByClassName("leader-line");
      for (let index = 0; index < linesAll.length; index++) {
        const viewboxvalue = linesAll[index].attributes["viewBox"].nodeValue;
        const values = viewboxvalue.split(" ");
        const left = 130;
        const top = 260;
        if (Number(values[0]) < left || Number(values[1] < top)) {
          linesAll[index].setAttribute("style", "display:none");
        } else {
          linesAll[index].setAttribute(
            "style",
            `left:${values[0]}px;top: ${values[1]}px; width: ${values[2]}px; height: ${values[3]}px;`
          );
        }
      }
      line.position();
    });
  }

  lineRemove() {
    document
      .getElementById("fixed-container-timeline")
      ?.removeEventListener(
        "scroll",
        this.linePotionsListener.bind(this),
        false
      );
    this.linesArray.forEach((line) => {
      line.remove();
    });
    this.linesArray = [];
  }

  //Drop event on drag
  drop(event: CdkDragDrop<string[]>) {
    if (event.item.element.nativeElement.attributes["projectindex"]) {
      var projectId =
        event.item.element.nativeElement.attributes["projectindex"].nodeValue;
    }
    if (projectId) {
      var project = this.projectsdata[projectId];
      var Taskindex =
        event.item.element.nativeElement.attributes["taskindex"].nodeValue;
      var task = project.tasks[Taskindex];
    } else {
      var Taskindex =
        event.item.element.nativeElement.attributes["taskindex"].nodeValue;
      var task =
        this.tasksDataList[
          event.item.element.nativeElement.attributes["taskindex"].nodeValue
        ];
    }

    var distance = event.distance.x / 50;
    var mod = event.distance.x % 50;

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
    event.item.element.nativeElement.setAttribute(
      "style",
      `top:0px;left:${updated_x * 50}px;width: ${
        event.item.element.nativeElement.style.width
      }`
    );
    if (projectId) {
      var newEndDate = DateTime.fromISO(
        this.projectsdata[projectId].tasks[Taskindex].end
      ).plus({ days: days });
      var newStartDate = DateTime.fromISO(
        this.projectsdata[projectId].tasks[Taskindex].start
      ).plus({ days: days });
      this.projectsdata[projectId].tasks[Taskindex];
      this.projectsdata[projectId].tasks[Taskindex].index_date = updated_x;
      this.projectsdata[projectId].tasks[Taskindex].end = newEndDate;
      this.projectsdata[projectId].tasks[Taskindex].task.task.due_to =
        newEndDate;
      this.projectsdata[projectId].tasks[Taskindex].task.task.start_date =
        newStartDate;
      this.projectsdata[projectId].tasks[Taskindex].start = newStartDate;
      this.dateupdate(
        this.projectsdata[projectId].tasks[Taskindex],
        newStartDate,
        newEndDate,
        days,
        days,
        this.projectsdata[projectId].tasks[Taskindex]?._groupid
      );
    } else {
      var newEndDate = DateTime.fromISO(this.tasksDataList[Taskindex].end).plus(
        { days: days }
      );
      var newStartDate = DateTime.fromISO(
        this.tasksDataList[Taskindex].start
      ).plus({ days: days });
      this.tasksDataList[Taskindex].index_date = updated_x;
      this.tasksDataList[Taskindex].end = newEndDate;
      this.tasksDataList[Taskindex].task.task.due_to = newEndDate;
      this.tasksDataList[Taskindex].task.task.start_date = newStartDate;
      this.tasksDataList[Taskindex].start = newStartDate;
      this.dateupdate(
        this.tasksDataList[Taskindex],
        newStartDate,
        newEndDate,
        days,
        days,
        this.tasksDataList[Taskindex]?._groupid
      );
    }
    setTimeout(() => {
      this.linesArray.forEach((line) => {
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
      event.rectangle.width < MIN_DIMENSIONS_PX
    ) {
      return false;
    }
    return true;
  }

  //Resize Event
  onResizeEnd(
    event: ResizeEvent,
    Taskid: string,
    Taskindex: number,
    projectIndex?: number
  ): void {
    if (event.edges?.right) {
      let right = Number(event.edges?.right);
      let left = Number(event.edges?.left);
      var mod = right % 50;

      if (left > 0) {
        if (mod > 30) {
          var multiple = Math.ceil(right / 50);
        } else {
          var multiple = Math.floor(right / 50);
        }
      } else {
        if (mod > -30) {
          var multiple = Math.ceil(right / 50);
        } else {
          var multiple = Math.floor(right / 50);
        }
      }
      var result = multiple * 50;
      var clientWidth = document.getElementById(Taskid).clientWidth;
      var newWidth = clientWidth + result + 4;
      document.getElementById(Taskid).style.width = newWidth + "px";
      if (projectIndex >= 0) {
        var newEndDate = DateTime.fromISO(
          this.projectsdata[projectIndex].tasks[Taskindex].end
        ).plus({ days: multiple });
        this.projectsdata[projectIndex].tasks[Taskindex].end = newEndDate;
        this.projectsdata[projectIndex].tasks[Taskindex].task.task.due_to =
          newEndDate;
        this.dateupdate(
          this.projectsdata[projectIndex].tasks[Taskindex],
          this.projectsdata[projectIndex].tasks[Taskindex].start,
          newEndDate,
          0,
          multiple,
          this.projectsdata[projectIndex].tasks[Taskindex]?._groupid
        );
      } else {
        var newEndDate = DateTime.fromISO(
          this.tasksDataList[Taskindex].end
        ).plus({ days: multiple });
        this.tasksDataList[Taskindex].end = newEndDate;
        this.tasksDataList[Taskindex].task.task.due_to = newEndDate;
        this.dateupdate(
          this.tasksDataList[Taskindex],
          this.tasksDataList[Taskindex].start,
          newEndDate,
          0,
          multiple,
          this.tasksDataList[Taskindex]?._groupid
        );
      }
    } else if (event.edges?.left) {
      let left = Number(event.edges?.left);
      var mod = left % 50;
      if (left > 0) {
        if (mod > 30) {
          var multiple = Math.ceil(left / 50);
        } else {
          var multiple = Math.floor(left / 50);
        }
      } else {
        if (mod > -30) {
          var multiple = Math.ceil(left / 50);
        } else {
          var multiple = Math.floor(left / 50);
        }
      }
      var result = multiple * 50;
      var offsetLeft = document.getElementById(Taskid).offsetLeft;
      var clientWidth = document.getElementById(Taskid).clientWidth;
      var newWidth = clientWidth - result + 4;
      document.getElementById(Taskid).style.width = newWidth + "px";
      var newLeft = offsetLeft + result;
      document.getElementById(Taskid).style.left = newLeft + "px";
      if (projectIndex >= 0) {
        var newStartDate = DateTime.fromISO(
          this.projectsdata[projectIndex].tasks[Taskindex].start
        ).plus({ days: multiple });
        this.projectsdata[projectIndex].tasks[Taskindex].task.task.start_date =
          newStartDate;
        this.projectsdata[projectIndex].tasks[Taskindex].start = newStartDate;
        this.dateupdate(
          this.projectsdata[projectIndex].tasks[Taskindex],
          newStartDate,
          this.projectsdata[projectIndex].tasks[Taskindex].end,
          multiple,
          0,
          this.projectsdata[projectIndex].tasks[Taskindex]?._groupid
        );
      } else {
        var newStartDate = DateTime.fromISO(
          this.tasksDataList[Taskindex].start
        ).plus({ days: multiple });
        this.tasksDataList[Taskindex].task.task.start_date = newStartDate;
        this.tasksDataList[Taskindex].start = newStartDate;
        this.dateupdate(
          this.tasksDataList[Taskindex],
          newStartDate,
          this.tasksDataList[Taskindex].end,
          multiple,
          0,
          this.tasksDataList[Taskindex]?._groupid
        );
      }
    }

    setTimeout(() => {
      this.linesArray.forEach((line) => {
        line.position();
      });
    }, 10);
  }

  //Update Dates
  async dateupdate(task, start, end, sday, eday, groupid) {
    const isShuttleTasksModuleAvailable =
      await this.publicFunctions.isShuttleTasksModuleAvailable();
    const isIndividualSubscription =
      await this.publicFunctions.checkIsIndividualSubscription();
    const startdate = this.datePipe.transform(start, "yyyy-MM-dd");
    const enddate = this.datePipe.transform(end, "yyyy-MM-dd");
    this.postService
      .updateGanttTasksDates(
        task["id"],
        groupid,
        enddate,
        startdate,
        sday,
        eday,
        isShuttleTasksModuleAvailable,
        isIndividualSubscription
      )
      .then((res) => {
        this.tasks = res["posts"];

        this.refreshChart();
      });
  }

  //onupdate task
  async updateTask(updatedTask: any) {
    for (var i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i]._id == updatedTask._id) {
        this.tasks[i] = updatedTask;
      } else if (this.tasks[i]._id == updatedTask?.task?._parent_task?._id) {
        var isExist = false;
        this.tasks.forEach((task) => {
          if (task._id == updatedTask._id) {
            isExist = true;
          }
        });

        if (!isExist) {
          this.tasks.push(updatedTask);
        }
      }
    }
    this.sections.forEach((section) => {
      if (updatedTask?.task?._column?._id == section._id) {
        section.tasks.push(updatedTask);
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
  openFullscreenModal(postData: any): void {
    const canOpen =
      !this.groupData?.enabled_rights || postData?.canView || postData?.canEdit;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(
      postData,
      this.groupData._id,
      canOpen,
      this.sections
    );
    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe(
        (data) => {
          this.onDeleteEvent(data);
        }
      );
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(
        (data) => {
          this.updateTask(data);
        }
      );
      const parentAssignEventSubs =
        dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
          this.onDeleteEvent(data._id);
        });
      const taskClonnedEventSubs =
        dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
          this.onTaskClonned(data);
        });
      const taskRecurrentEventSubs =
        dialogRef.componentInstance.taskRecurrentEvent.subscribe((data) => {
          this.onTaskClonned(data);
        });

      dialogRef.afterClosed().subscribe((result) => {
        deleteEventSubs.unsubscribe();
        closeEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
        taskClonnedEventSubs.unsubscribe();
      });
    }
  }

  //refresh Chart
  async refreshChart() {
    await this.parsedTasks(this.tasks);
    this.datesToShow.start = await this.min_date(this.tasksDataList);
    this.datesToShow.end = await this.max_date(this.tasksDataList);
    this.dates = [];
    await this.generateNavDate();
    await this.add_index();
    await this.parsedProjects(this.sections);
    await this.taskAfterDueDate();

    await this.get_current_date_index();
    var timelineHeight =
      100 + this.tasksDataList.length * 60 + this.tasksStartingHeight;
    var screenHeight = window.innerHeight - 100;

    if (timelineHeight > screenHeight) {
      this.timeline_container_height = timelineHeight + 100 + "px";
    } else {
      this.timeline_container_height = screenHeight + 100 + "px";
    }
    this.screen_height = screenHeight + "px";
    document.getElementsByTagName("body")[0].style.overflow = "hidden";

    await this.lineRemove();

    // this.renderer.listen(this.el.nativeElement, 'load', () => {
    await this.linesGenetate();
    // });
  }

  //Generate the dates for Nav
  async generateNavDate() {
    const datesService = this.injector.get(DatesService);

    if (datesService.isBefore(DateTime.now(), this.datesToShow.start)) {
      // Find duration between start and end date

      if (datesService.isBefore(this.datesToShow.end, DateTime.now())) {
        var endDate = DateTime.now();
      } else {
        var endDate = this.datesToShow.end;
      }

      var Difference_In_Days = endDate.diff(DateTime.now(), "days").days;

      if (Difference_In_Days < 26) {
        var lessdays = 26 - Difference_In_Days;
        Difference_In_Days = Difference_In_Days + lessdays;
      } else {
        Difference_In_Days = Difference_In_Days + 2;
      }
      //Continer width

      this.timeline_container_width = Difference_In_Days * this.step + "px";
      //Populating the dates.
      if (Difference_In_Days * this.step > this.sections.length * 350) {
        this.timeline_header_width = Difference_In_Days * this.step + "px";
      } else {
        this.timeline_header_width = this.sections.length * 350 + "px";
      }

      for (var i = 0; i < Difference_In_Days; i++) {
        const reqdate = DateTime.now().plus({ days: i });
        this.dates.push({
          day: reqdate.day,
          date: reqdate,
          month: this.months[reqdate.month - 1],
          isweekend: reqdate.day == 0 || reqdate.day == 6 ? true : false,
        });
      }
    } else {
      // Find duration between start and end date
      if (datesService.isBefore(this.datesToShow.end, DateTime.now())) {
        var endDate = DateTime.now();
      } else {
        var endDate = this.datesToShow.end;
      }

      var Difference_In_Days = endDate.diff(
        this.datesToShow.start,
        "days"
      ).days;

      if (Difference_In_Days < 26) {
        var lessdays = 26 - Difference_In_Days;
        Difference_In_Days = Difference_In_Days + lessdays;
      } else {
        Difference_In_Days = Difference_In_Days + 2;
      }
      //Continer width
      this.timeline_container_width = Difference_In_Days * this.step + "px";

      if (Difference_In_Days * this.step > this.sections.length * 350) {
        this.timeline_header_width = Difference_In_Days * this.step + "px";
      } else {
        this.timeline_header_width = this.sections.length * 350 + "px";
      }

      //Populating the dates.

      for (var i = 0; i < Difference_In_Days; i++) {
        const reqdate = this.datesToShow.start.plus({ days: i });
        this.dates.push({
          day: reqdate.day,
          date: reqdate,
          month: this.months[reqdate.month - 1],
          isweekend: reqdate.day == 0 || reqdate.day == 6 ? true : false,
        });
      }
    }
  }

  scroll(id: string, index: number) {
    this.selectedProjectIndex = index;
    const el = document.getElementById(id);
    if (el) {
      const elTop =
        Number(el.style.top.substring(0, el.style.top.length - 2)) - 110;
      const elLeft = Number(
        el.style.left.substring(0, el.style.left.length - 2)
      );
      document
        .getElementById("fixed-container-timeline")
        .scrollTo({ top: elTop, left: elLeft, behavior: "smooth" });
    }
  }

  async parsedProjects(columnsData: any) {
    let index = 0;
    this.projectsdata = [];
    let tasktobedeleted: any = [];
    columnsData.forEach((column) => {
      if (column?.due_date && column?.start_date && column?.project_type) {
        const newColumnsData = {
          data: column,
          differencedays: DateTime.fromISO(column?.due_date).diff(
            DateTime.fromISO(column?.start_date),
            "days"
          ).days,
          startingIndex: this.find_index(DateTime.fromISO(column?.start_date)),
          noOfTasks: column?.tasks?.length || 0,
          id: column._id,
          _id: column._id,
          startheight:
            index === 0
              ? 100
              : 60 * this.projectsdata[index - 1].tasks.length +
                this.projectsdata[index - 1].startheight +
                160,
          tasks: [],
          taskAfterDueDate: undefined,
          taskAfterDueDateStart: this.find_index(
            DateTime.fromISO(column?.due_date)
          ),
          start_date: DateTime.fromISO(column?.start_date),
          due_date: DateTime.fromISO(column?.due_date),
          canEdit: column?.canEdit,
        };

        for (let i = 0; i < this.tasksDataList.length; i++) {
          if (this.tasksDataList[i]?.projectId + "" == column._id + "") {
            newColumnsData.tasks.push(this.tasksDataList[i]);
            tasktobedeleted.push(this.tasksDataList[i].id);
          }
        }
        this.projectsdata.push(newColumnsData);
        index++;
      }
    });

    tasktobedeleted.forEach((userID) => {
      let deleted = 0;
      this.tasksDataList.forEach((task) => {
        if (userID == task.id) {
          this.tasksDataList.splice(deleted, 1);
        }
        deleted++;
      });
    });

    if (this.projectsdata.length > 0) {
      const last_project = this.projectsdata[this.projectsdata.length - 1];
      this.tasksStartingHeight =
        last_project.startheight + (60 * last_project.noOfTasks + 100);
    }
  }

  async taskAfterDueDate() {
    const datesService = this.injector.get(DatesService);
    for (let index = 0; index < this.projectsdata.length; index++) {
      for (let i = 0; i < this.projectsdata[index].tasks.length; i++) {
        if (
          datesService.isBefore(
            DateTime.fromISO(this.projectsdata[index].data.due_date),
            DateTime.fromISO(this.projectsdata[index].tasks[i].end)
          )
        ) {
          this.projectsdata[index].taskAfterDueDate = DateTime.fromISO(
            this.projectsdata[index].tasks[i].end
          ).diff(
            DateTime.fromISO(this.projectsdata[index].data.due_date),
            "days"
          ).days;
        }
      }
    }
  }

  //Parsing the data
  async parsedTasks(tasksdata: any) {
    if (!!tasksdata) {
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

            if (typeof sortedBefore[j].task._dependency_task == "object") {
              if (sortedBefore[j].task._dependency_task?.length > 0) {
                for (
                  let index = 0;
                  index < sortedBefore[j].task._dependency_task.length;
                  index++
                ) {
                  const idi = sortedBefore[j].task._dependency_task[index] + "";
                  const idj = parenttaskID + "";

                  if (idi === idj) {
                    if (!isAlready(sortedBefore[j]._id)) {
                      SortedTask.push(sortedBefore[j]);
                    }

                    if (
                      sortedBefore[j].task &&
                      sortedBefore[j].task._dependent_child
                    ) {
                      if (sortedBefore[j].task._dependent_child.length > 0) {
                        findchilds(index, sortedBefore[j]._id, true);
                      }
                    }
                  }
                }
              }
            } else {
              const idi = sortedBefore[j].task._dependency_task + "";
              const idj = parenttaskID + "";

              if (idi === idj) {
                if (!isAlready(sortedBefore[j]._id)) {
                  SortedTask.push(sortedBefore[j]);
                }

                if (
                  sortedBefore[j].task &&
                  sortedBefore[j].task._dependent_child
                ) {
                  if (sortedBefore[j].task._dependent_child.length > 0) {
                    findchilds(index, sortedBefore[j]._id, true);
                  }
                }
              }
            }
          }
        }
      }

      function isAlready(id: any) {
        // return already;
        const index = SortedTask
          ? SortedTask.findIndex((t) => t._id == id)
          : -1;
        return index >= 0;
      }

      for (var a = 0; a < tasksdata.length; a++) {
        if (tasksdata[a].task._dependency_task) {
          child_index.push(tasksdata[a]);
        } else {
          sortedBefore.push(tasksdata[a]);
        }
      }
      child_index.map((child) => {
        sortedBefore.push(child);
      });

      SortedTask.push(sortedBefore[0]);

      for (var i = 0; i < sortedBefore.length; i++) {
        // Check bit task is already pushed or not
        var already = isAlready(sortedBefore[i]._id);

        //If not already pushed pushing into  SortedTask array.
        if (!already) {
          SortedTask.push(sortedBefore[i]);
        }

        //Finding the child of the current task and pushing into  SortedTask array.
        if (
          i < sortedBefore.length - 1 &&
          sortedBefore.length != SortedTask.length
        ) {
          findchilds(i, sortedBefore[i]._id, false);
        }
      }
      this.tasksDataList = [];
      //Saving the only required fields of the task in tasksData array.

      SortedTask.map((sortedTask) => {
        const startdate: any = DateTime.fromISO(sortedTask.task.start_date);
        const endate: any = DateTime.fromISO(sortedTask.task.due_to);
        var Difference_In_Days = endate.diff(startdate, "days").days;

        //if a task have start and end date and it is not a sub task.
        if (
          sortedTask.task.due_to &&
          sortedTask.task.start_date &&
          !sortedTask.task._parent_task
        ) {
          this.tasksDataList.push({
            id: sortedTask._id,
            name: sortedTask.title,
            start: sortedTask.task.is_milestone
              ? DateTime.fromISO(sortedTask.task?.due_to)
              : DateTime.fromISO(sortedTask.task.start_date),
            end: DateTime.fromISO(sortedTask.task.due_to),
            is_milestone: sortedTask.task.is_milestone,
            progress: "0",
            dependent_tasks: sortedTask?.task?._dependent_child,
            difference: sortedTask.task.is_milestone ? 0 : Difference_In_Days,
            dependency_index: sortedTask?.parentIndex,
            custom_class: sortedTask?.task.status,
            _groupid: sortedTask?._group._id || sortedTask?._group,
            dependency: sortedTask?.task._dependency_task,
            image:
              sortedTask?._assigned_to?.length > 0
                ? this.baseUrl +
                  "/" +
                  this.workspaceId +
                  "/" +
                  sortedTask._assigned_to[0].profile_pic
                : undefined,
            noOfParticipants:
              sortedTask?._assigned_to?.length > 1
                ? sortedTask?._assigned_to?.length - 1
                : undefined,
            projectId: sortedTask?.task?._column
              ? sortedTask?.task?._column._id || sortedTask?.task?._column
              : "",
            canEdit: sortedTask.canEdit,
            task: sortedTask,
          });
        } else {
          if (sortedTask.task.due_to && sortedTask?.task?.is_milestone) {
            this.tasksDataList.push({
              id: sortedTask._id,
              name: sortedTask.title,
              start: sortedTask.task.is_milestone
                ? DateTime.fromISO(sortedTask.task?.due_to)
                : DateTime.fromISO(sortedTask.task.start_date),
              end: DateTime.fromISO(sortedTask.task.due_to),
              is_milestone: sortedTask?.task?.is_milestone,
              progress: "0",
              dependent_tasks: sortedTask?.task?._dependent_child,
              dependency_index: sortedTask?.parentIndex,
              difference: sortedTask.task.is_milestone ? 0 : Difference_In_Days,
              custom_class: sortedTask?.task.status,
              _groupid: sortedTask?._group._id || sortedTask?._group,
              dependency: sortedTask?.task._dependency_task,
              image:
                sortedTask?._assigned_to?.length > 0
                  ? this.baseUrl +
                    "/" +
                    this.workspaceId +
                    "/" +
                    sortedTask._assigned_to[0].profile_pic
                  : undefined,
              noOfParticipants:
                sortedTask?._assigned_to?.length > 1
                  ? sortedTask?._assigned_to?.length - 1
                  : undefined,
              projectId: sortedTask?.task?._column
                ? sortedTask?.task?._column._id || sortedTask?.task?._column
                : "",
              canEdit: sortedTask.canEdit,
              task: sortedTask,
            });
          }
        }
      });
    }
  }

  //Get the Min date
  async min_date(all_dates) {
    const datesService = this.injector.get(DatesService);
    var min_dt = all_dates[0]?.start,
      min_dtObj = all_dates[0]?.start;
    all_dates.forEach((dt, index) => {
      if (datesService.isBefore(dt.start, min_dtObj)) {
        min_dt = dt.start;
        min_dtObj = dt.start;
      }
    });

    this.sections.forEach((column) => {
      if (
        datesService.isBefore(DateTime.fromISO(column.start_date), min_dtObj)
      ) {
        min_dt = DateTime.fromISO(column.start_date);
        min_dtObj = DateTime.fromISO(column.start_date);
      }
    });
    return min_dt;
  }
  //Get the Min date
  async max_date(all_dates) {
    const datesService = this.injector.get(DatesService);
    var max_dt = all_dates[0]?.end,
      max_dtObj = all_dates[0]?.end;
    all_dates.forEach((dt, index) => {
      if (datesService.isBefore(max_dtObj, dt.end)) {
        max_dt = dt.end;
        max_dtObj = dt.end;
      }
    });

    this.sections.forEach((column) => {
      if (datesService.isBefore(max_dtObj, DateTime.fromISO(column.due_date))) {
        max_dt = DateTime.fromISO(column.due_date);
        max_dtObj = DateTime.fromISO(column.due_date);
      }
    });

    return max_dt;
  }

  // Find Index of date
  find_index(date) {
    const datesService = this.injector.get(DatesService);
    return !!this.dates
      ? this.dates.findIndex((dt) => datesService.isSameDay(dt.date, date))
      : -1;
  }

  //Current date index
  async get_current_date_index() {
    const datesService = this.injector.get(DatesService);
    this.dates.forEach((dt, index) => {
      var c = DateTime.now();

      if (datesService.isSameDay(dt.date, c)) {
        this.current_date_index = index;
      }
    });
  }

  //ADD INDEX
  async add_index() {
    this.tasksDataList.forEach((task, index) => {
      this.tasksDataList[index].index_date = this.find_index(task.start);
    });
  }

  async onTaskClonned(data) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    await this.initView();

    // Return the function via stopping the loader
    return this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  formateDate(date: any, format: string) {
    const datesService = this.injector.get(DatesService);
    return datesService.formateDate(date, format);
  }

  newTask(post: any, projectId: string) {
    post.canEdit = true;
    // Adding the post to column
    const index = this.projectsdata
      ? this.projectsdata.findIndex((project) => project.id == projectId)
      : -1;
    post.task.start_date = this.projectsdata[index].start_date;
    post.task.due_date = this.projectsdata[index].start_date.plus({ days: 1 });
    post.id = post._id;
    this.dateupdate(
      post,
      post.task.start_date,
      post.task.due_date,
      1,
      1,
      this.groupData?._id
    );
  }
}
