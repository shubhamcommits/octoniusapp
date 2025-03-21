import { Component, Injector, Input, OnChanges, OnInit } from "@angular/core";
import { PublicFunctions } from "modules/public.functions";
import { PostService } from "src/shared/services/post-service/post.service";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { DateTime } from "luxon";

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

  frequencies = [
    { value: "daily", title: $localize`:@@postRecurrency.daily:Daily` },
    { value: "weekly", title: $localize`:@@postRecurrency.weekly:Weekly` },
    { value: "monthly", title: $localize`:@@postRecurrency.monthly:Monthly` },
    { value: "yearly", title: $localize`:@@postRecurrency.yearly:Yearly` },
    {
      value: "custom",
      title: $localize`:@@postRecurrency.especificDays:Especific Days`,
    },
    // { value: "periodically", title: $localize`:@@postRecurrency.periodically:Periodically`" },
  ];

  today = DateTime.now();

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
    } else if (property === "custom_on") {
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

  transformToRecurrent($event) {
    if ($event.source.disabled) {
      return;
    }

    this.postData.is_recurrent = !this.postData.is_recurrent;
    if (this.postData.is_recurrent && !this.postData.recurrent) {
      this.resetRecurrency();
    }
    this.saveRecurrency();
  }

  async updateRecurrentFrequency(event: any): Promise<void> {
    await this.resetRecurrency();
    this.postData.recurrent.frequency = event.value;
    if (event.value == "daily") {
      this.postData.recurrent.days_of_week = [1, 2, 3, 4, 5, 6, 7];
    } else if (event.value == "weekly") {
      this.postData.recurrent.days_of_week = [DateTime.now().weekday];
    } else {
      this.postData.recurrent.days_of_week = [];
    }
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

  onTheseDaysCheckSelected($event) {
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

  onTheseDaysRadioSelected($event) {
    if (!!$event.value) {
      this.postData.recurrent.days_of_week = [$event.value];
    } else {
      this.postData.recurrent.days_of_week = [];
    }
    this.saveRecurrency();
  }

  isDaySelected(day: number): boolean {
    return this.postData?.recurrent?.days_of_week.includes(day);
  }

  getWeeklyDaySelected(): number {
    return this.postData?.recurrent?.days_of_week[0];
  }

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

  checkOverdue() {
    return this.publicFunctions.checkOverdue(this.postData);
  }
}
