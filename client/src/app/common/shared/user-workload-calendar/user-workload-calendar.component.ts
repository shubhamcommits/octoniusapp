import { Component, OnInit, Input, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-user-workload-calendar',
  templateUrl: './user-workload-calendar.component.html',
  styleUrls: ['./user-workload-calendar.component.scss'],
})
export class UserWorkloadCalendarComponent implements OnInit {

  @Input() userId;

  userData;
  isCurrentUser = false;
  workspaceData;
  userHasManager = false;
  entityData;

  selectedDays: any = [];
  today = DateTime.now();
  startDate;
  endDate;
  holidaysInYear: any = [];
  pastHolidays: any = [];

  createNewHoliday = false;
  outOfOfficeReason = ['Holidays', 'Sick', 'Personal'];
  newHoliday = {
    _id: '',
    start_date: DateTime.now(),
    end_date: DateTime.now(),
    type: 'holidays',
    num_days: 0,
    _approval_manager: '',
    description: ''
  };
  errorCode = '';

  totalUsedHolidays = 0;
  pendingUsedHolidays = 0;
  totalUsedSickDays = 0;
  pendingUsedSickDays = 0;
  totalUsedPersonalDays = 0;
  pendingUsedPersonalDays = 0;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private userService: UserService,
    private hrService: HRService,
    private utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog
    ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.isCurrentUser = (this.userData._id == this.userId);
    this.hrService.getEntityDetails((this.userData?.hr?._entity?._id || this.userData?.hr?._entity)).then(res => {
      this.entityData = res['entity'];
    });

    this.today = DateTime.now();
    const firstDay = this.today.startOf('month');
    const lastDay = this.today.endOf('month');
    await this.getOutOfOfficeDays(firstDay.toISO(), lastDay.toISO());

    await this.initNewHoliday();
  }

  async getOutOfOfficeDays(from: any, to: any) {
    await this.userService.getOutOfTheOfficeDays(this.userId, from, to).then(res => {
      // this.holidaysInMonth = res['holidaysInMonth'];
      this.holidaysInYear = res['holidaysInYear'];
      this.pastHolidays = res['pastHolidays'];

      // if (!!this.holidaysInMonth) {
      //   this.bookedDays = [];
      //   for (let i = 0; i < this.holidaysInMonth.length; i++) {
      //     const holiday = this.holidaysInMonth[i];
      //     var date = DateTime.fromISO(holiday.start_date).startOf('day');
      //     while (date < DateTime.fromISO(holiday.end_date)) {
      //       const index = this.bookedDays.findIndex((bookedDay) => DateTime.fromJSDate(bookedDay.date).equals(date))
      //       if (index < 0) {
      //         this.bookedDays.push({
      //           date: date.toJSDate(),
      //           type: holiday.type || 'holidays',
      //           approved: holiday?.status || 'pending'
      //         });
      //       }
      //       date = date.plus({ days: 1 });
      //     }
      //   }
      // }

      if (!!this.holidaysInYear) {
        const doIndex = (!!this.entityData && !!this.entityData.payroll_days_off) ? this.entityData.payroll_days_off.findIndex((dayOff: any) => dayOff.year === DateTime.now().year) : -1;
        let dayOff;
        if (doIndex >= 0) {
            dayOff = this.entityData.payroll_days_off[doIndex];
        }

        if (!dayOff) {
          dayOff = {
            holiday: 0,
            sick: 0,
            personal_days: 0
          }
        }

        if (!this.userData.hr.entity_extra_days_off) {
          this.userData.hr.entity_extra_days_off = {
            holidays: 0,
            sick: 0,
            personal_days: 0
          }
        }

        for (let i = 0; i < this.holidaysInYear.length; i++) {
          const holiday = this.holidaysInYear[i];

          if ((holiday.status == 'approved' || holiday.status == 'pending')) {
            if (holiday.type == 'holidays') {
              this.totalUsedHolidays += holiday.num_days;
            } else if (holiday.type == 'sick') {
              this.totalUsedSickDays += holiday.num_days;
            } else if (holiday.type == 'personal') {
              this.totalUsedPersonalDays += holiday.num_days;
            }
          }
        }

        this.pendingUsedHolidays = (dayOff.holidays + this.userData.hr.entity_extra_days_off.holidays) - this.totalUsedHolidays;
        this.pendingUsedSickDays = (dayOff.sick + this.userData.hr.entity_extra_days_off.sick) - this.totalUsedSickDays;
        this.pendingUsedPersonalDays = (dayOff.personal_days + this.userData.hr.entity_extra_days_off.personal_days) - this.totalUsedPersonalDays;
      }
    });
  }

  async initNewHoliday() {

    let manager;
    let managerId;
    if (!!this.workspaceData.manager_custom_field) {
      managerId = this.userData?.profile_custom_fields[this.workspaceData.manager_custom_field]
      this.userHasManager = !!managerId;
    } else {
      const index = (!!this.workspaceData?.profile_custom_fields) ? this.workspaceData?.profile_custom_fields.findIndex(cf => (cf.name == 'manager' && cf.user_type)) : -1;
      managerId = this.userData?.profile_custom_fields['manager'];
      this.userHasManager =  (index >= 0) && !!managerId;
    }

    if (this.userHasManager) {
      manager = await this.publicFunctions.getOtherUser(managerId)
        .catch(err => {
          this.userHasManager = false;
          this.utilityService.infoNotification($localize`:@@userWorkloadCalendar.managerNoActive:Your manager is no longer active in Octonius, please select a new one.`, $localize`:@@userWorkloadCalendar.noManager:No Manager`);
        });
    } else if(this.userData?.role == 'manager' || this.userData?.role == 'owner') {
      manager = this.userData;
    }

    this.newHoliday = {
      _id: '',
      start_date: DateTime.now(),
      end_date: DateTime.now(),
      type: 'holidays',
      num_days: 0,
      _approval_manager: manager,
      description: ''
    };
  }

  showNewHolidayForm() {
    this.createNewHoliday = true;
  }

  cancelHoliday() {
    this.initNewHoliday();

    this.createNewHoliday = false;
  }

  editHolidays(holiday: any) {
    this.newHoliday._id = holiday._id;
    this.newHoliday.start_date = DateTime.fromISO(holiday.start_date);
    this.newHoliday.end_date = DateTime.fromISO(holiday.end_date);
    this.newHoliday.type = holiday.type;
    this.newHoliday.num_days = holiday.num_days;
    this.newHoliday._approval_manager = holiday._manager;
    this.newHoliday.description = holiday.description;

    this.showNewHolidayForm();
  }

  saveDayOff() {
    this.utilityService.asyncNotification($localize`:@@userWorkloadCalendar.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
      if (this.newHoliday?._id && this.newHoliday?._id != '') {
        this.userService.editHoliday(this.userData?._id, this.newHoliday).then(res => {
          const index = (this.holidaysInYear) ? this.holidaysInYear.findIndex(hol => hol._id == this.newHoliday._id) : -1;
          if (index >= 0) {
            this.holidaysInYear[index] = this.newHoliday;
          }

          this.cancelHoliday();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.holidayUpdated:Holiday updated!`));
          // window.location.reload();
        })
        .catch((error) => {
          this.cancelHoliday();
          this.errorCode = error.error.message;
          reject(this.utilityService.rejectAsyncPromise($localize`:@@userWorkloadCalendar.unableToUpdateHoliday:Unable to update the holiday, please try again!`));
        });
      } else {
        this.userService.createHoliday(this.userData?._id, this.newHoliday).then(res => {
          this.holidaysInYear.push(res['holiday']);
          this.cancelHoliday();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.holidayCreated:Holiday created!`));
          // window.location.reload();
        })
        .catch((error) => {
          this.cancelHoliday();
          this.errorCode = error.error.message;
          reject(this.utilityService.rejectAsyncPromise(error.error.message));
        });
      }
    }));
  }

  removeHolidays(holidayId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@userWorkloadCalendar.areYouSure:Are you sure?`, $localize`:@@userWorkloadCalendar.completelyRemoved:By doing this, the year will be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@userWorkloadCalendar.pleaseWaitDeleting:Please wait we are deleting the holiday...`, new Promise((resolve, reject) => {
            this.userService.deleteHoliday(holidayId).then(res => {
              const index = (this.holidaysInYear) ? this.holidaysInYear.findIndex(hol => hol._id == holidayId) : -1;
              if (index >= 0) {
                this.holidaysInYear.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.deleted:Holiday deleted!`));
              // window.location.reload();
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@userWorkloadCalendar.unableDeleteHoliday:Unable to delete the holiday, please try again!`));
            });
          }));
        }
      });
  }

  calculateNumHolidays(property: string, date) {
    if (property === 'start_date') {
      this.newHoliday.start_date = date;
    }
    if (property === 'end_date') {
      this.newHoliday.end_date = date;
    }

    if (this.newHoliday.end_date >= this.newHoliday.start_date) {
      this.userService.getNumHolidays(this.userData?._id, this.newHoliday.start_date, this.newHoliday.end_date, this.newHoliday.type).then(res => {
        this.newHoliday.num_days = res['numDays'];
        this.errorCode = res['code'];
      });
    }
  }

  selectManager(user: any) {
    this.newHoliday._approval_manager = user;
  }

  canCreate() {
    return !!this.newHoliday._approval_manager
      && !!this.newHoliday.type
      && !!this.newHoliday.start_date
      && !!this.newHoliday.end_date
      && !!this.newHoliday.description
      && !this.errorCode
  }

  // clearDates() {
  //   this.selectedDays = [];
  //   this.daysToCancel = [];
  //   this.refresh.next();
  // }

  formateDate(date: any) {
    if (!!date && (date instanceof DateTime)) {
      return date.toLocaleString(DateTime.DATE_SHORT);
    }
    return this.utilityService.formateDate(date, DateTime.DATE_SHORT);
  }
}
