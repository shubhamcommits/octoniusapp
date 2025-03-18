import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { PublicFunctions } from "modules/public.functions";
import { PostService } from "src/shared/services/post-service/post.service";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { DatesService } from "src/shared/services/dates-service/dates.service";

@Component({
  selector: "app-post-recurrency",
  templateUrl: "./post-recurrency.component.html",
  styleUrls: ["./post-recurrency.component.scss"],
})
export class PostRecurrencyComponent implements OnInit, OnChanges {
  @Input() userData: any;
  @Input() postData: any;
  @Input() groupData: any;
  @Input() canEdit;

  // @Output() startDateEvent = new EventEmitter();
  // @Output() dueDateEvent = new EventEmitter();
  // @Output() timeEvent = new EventEmitter();

  // startDate: any;
  // dueDate: any;
  // dueTime: any = {
  //   hour: 1,
  //   minute: 30,
  // };

  frequencies = [
    { value: "daily", title: "Daily" },
    { value: "weekly", title: "Weekly" },
    { value: "monthly", title: "Monthly" },
    { value: "yearly", title: "Yearly" },
    { value: "periodically", title: "Periodically" },
  ];

  canEditDates: boolean = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private postService: PostService,
    private datesService: DatesService,
    private injector: Injector
  ) {}

  ngOnInit() {}

  async ngOnChanges() {
    // this.canEditDates = await this.canUserEditDates();
  }

  // canUserEditDates() {
  //   const isGroupManager =
  //     this.groupData && this.groupData._admins
  //       ? this.groupData?._admins.findIndex(
  //           (admin: any) => (admin?._id || admin) == this.userData?._id
  //         ) >= 0
  //       : false;
  //   const isPostOwner =
  //     this.postData &&
  //     this.postData?._posted_by &&
  //     this.postData?._posted_by?._id
  //       ? this.postData?._posted_by?._id == this.userData?._id
  //       : this.postData?._posted_by &&
  //         this.postData?._posted_by == this.userData?._id
  //       ? true
  //       : false;

  //   return (
  //     (this.canEdit && !this.groupData?.freeze_dates) ||
  //     (this.canEdit &&
  //       this.groupData?.freeze_dates &&
  //       (isGroupManager || isPostOwner))
  //   );
  // }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {
    if (property === "end_date") {
      this.postData.recurrent.end_date = dateObject.toISODate();
      console.log(
        "Recurrent task end date set to: ",
        this.postData?.recurrent?.end_date
      );
    } else if (property === "recurrency_on") {
      this.postData.recurrent.recurrency_on = dateObject.toISODate();
      console.log(
        "Recurrent task recurrency_on set to: ",
        this.postData?.recurrent?.recurrency_on
      );
    } else if (property === "periodically_on") {
      const index = this.postData.recurrent.specific_days.findIndex(
        (day) => day === dateObject.toISODate()
      );
      if (index >= 0) {
        this.postData.recurrent.specific_days.splice(index, 1);
      } else {
        this.postData.recurrent.specific_days.push(dateObject.toISODate());
      }

      console.log(
        "Recurrent task periodically_on set to: ",
        this.postData?.recurrent?.periodically_on
      );
    }
  }

  /**
   * This function is responsible to update the date if the date is valid.
   * @param date
   * @param property
   */
  // async updateDate(date, property) {
  //   await this.utilityService.asyncNotification(
  //     $localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`,
  //     new Promise(async (resolve, reject) => {
  //       if (property === "due_date") {
  //         const isShuttleTasksModuleAvailable =
  //           await this.publicFunctions.isShuttleTasksModuleAvailable();
  //         const isIndividualSubscription =
  //           await this.publicFunctions.checkIsIndividualSubscription();

  //         this.postService
  //           .changeTaskDueDate(
  //             this.postData?._id,
  //             date,
  //             isShuttleTasksModuleAvailable,
  //             isIndividualSubscription
  //           )
  //           .then((res) => {
  //             this.postData = res["post"];
  //             // this.dueDate = moment(this.postData?.task?.due_to);
  //             this.dueDateEvent.emit(date);
  //             // Resolve with success
  //             resolve(
  //               this.utilityService.resolveAsyncPromise(
  //                 $localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`
  //               )
  //             );
  //           })
  //           .catch(() => {
  //             reject(
  //               this.utilityService.rejectAsyncPromise(
  //                 $localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`
  //               )
  //             );
  //           });
  //       } else if (property === "start_date") {
  //         this.postService
  //           .saveTaskDates(this.postData?._id, date, property)
  //           .then((res) => {
  //             this.postData = res["post"];
  //             // this.startDate = moment(this.postData?.task?.start_date);
  //             this.startDateEvent.emit(date);
  //             // Resolve with success
  //             resolve(
  //               this.utilityService.resolveAsyncPromise(
  //                 $localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`
  //               )
  //             );
  //           })
  //           .catch(() => {
  //             reject(
  //               this.utilityService.rejectAsyncPromise(
  //                 $localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`
  //               )
  //             );
  //           });
  //       }
  //     })
  //   );
  // }

  transformToRecurrent() {
    this.postData.is_recurrent = !this.postData.is_recurrent;
    if (this.postData.is_recurrent && !this.postData.recurrent) {
      this.postData.recurrent = {
        frequency: "",
        days_of_week: [],
      };
    }
    console.log("Recurrent task set to: ", this.postData?.is_recurrent);
  }

  updateRecurrentFrequency(event: any): void {
    this.postData.recurrent.frequency = event.value;
    console.log(
      "Recurrent task frecuency set to: ",
      this.postData?.recurrent?.frequency
    );
  }

  onTheseDaysSelected($event) {
    if ($event.checked) {
      this.postData.recurrent.days_of_week.push($event.source.name);
    } else {
      this.postData.recurrent.days_of_week =
        this.postData.recurrent.days_of_week.filter(
          (day) => day !== $event.source.name
        );
    }
    console.log(
      "Recurrent task days set to: ",
      this.postData.recurrent.days_of_week
    );
  }

  isDaySelected(day: string): boolean {
    return this.postData?.recurrent?.days_of_week.includes(day);
  }

  /**
   * This function is responsible for receiving the time from @module <app-time-picker></app-time-picker>
   * @param timeObject
   */
  // getTime(timeObject: any) {
  //   this.timeEvent.emit(timeObject);
  // }
}
