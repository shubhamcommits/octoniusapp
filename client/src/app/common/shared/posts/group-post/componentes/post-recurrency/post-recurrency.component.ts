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

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    public postService: PostService,
    private injector: Injector
  ) {}

  ngOnInit() {}

  async ngOnChanges() {}

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {
    console.log(dateObject);
    if (property === "end_date") {
      this.postData.recurrent.end_date = dateObject.toISODate();
    } else if (property === "recurrency_on") {
      this.postData.recurrent.recurrency_on = dateObject.toISODate();
    } else if (property === "periodically_on") {
      if (!this.postData?.recurrent?.specific_days) {
        this.postData.recurrent.specific_days = [];
      }
      const index = this.postData?.recurrent?.specific_days?.findIndex(
        (day) => day === dateObject
      );
      if (index >= 0) {
        this.postData.recurrent.specific_days.splice(index, 1);
      } else {
        this.postData.recurrent.specific_days.push(dateObject);
      }
    }

    this.saveRecurrency();
  }

  transformToRecurrent() {
    this.postData.is_recurrent = !this.postData.is_recurrent;
    if (this.postData.is_recurrent && !this.postData.recurrent) {
      this.resetRecurrency();
    }
    this.saveRecurrency();
  }

  async updateRecurrentFrequency(event: any): Promise<void> {
    await this.resetRecurrency();
    this.postData.recurrent.frequency = event.value;
    this.saveRecurrency();
  }
  resetRecurrency() {
    this.postData.recurrent = {
      frequency: "",
      // _parent_post: this.postData._id,
      days_of_week: [],
      end_date: null,
      recurrency_on: null,
      specific_days: [],
    };
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
    this.saveRecurrency();
  }

  isDaySelected(day: number): boolean {
    return this.postData?.recurrent?.days_of_week.includes(day);
  }

  /**
   * This function is responsible for receiving the time from @module <app-time-picker></app-time-picker>
   * @param timeObject
   */
  // getTime(timeObject: any) {
  //   this.timeEvent.emit(timeObject);
  // }

  async saveRecurrency() {
    await this.utilityService.asyncNotification(
      $localize`:@@postRecurrency.plesaeWaitWeAreUpdaing:Please wait we are updating the post...`,
      new Promise(async (resolve, reject) => {
        this.postService
          .saveRecurrency(
            this.postData?._id,
            this.postData?.is_recurrent,
            this.postData?.recurrent
          )
          .then((res) => {
            console.log(res);
            resolve(
              this.utilityService.resolveAsyncPromise(
                $localize`:@@postRecurrency.postUpdated:Post updated!`
              )
            );
          })
          .catch(() => {
            reject(
              this.utilityService.rejectAsyncPromise(
                $localize`:@@postRecurrency.unableToUpdateDetails:Unable to update the details, please try again!`
              )
            );
          });
      })
    );
  }
}
