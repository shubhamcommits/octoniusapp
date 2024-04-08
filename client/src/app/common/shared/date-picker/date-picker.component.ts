import { Component, OnChanges, Output, EventEmitter, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR} from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateTime } from 'luxon';
// import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

// const moment = _rollupMoment || _moment;

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  providers: [
    INLINE_EDIT_CONTROL_VALUE_ACCESSOR,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [ MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS ]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnChanges {

  @Input('selectedDate') selectedDate: any;
  @Input() upperLimit: any;
  @Input() lowerLimit: any;
  @Input() styleClass;
  @Input() canEdit = true;
  @Input() showInput = true;
  
  // Output date event emitter
  @Output('date') date = new EventEmitter();
  
  private _value = ''; // Private variable for input value
  
  public onChange: any = Function.prototype; // Trascend the onChange event
  
  constructor(private utilityService: UtilityService) { }

  ngOnChanges() {
    this._value = this.formateDate(this.selectedDate);
  }

  // Control Value Accessors for ngModel
  get value(): any {
    return this._value;
  }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  // Required forControlValueAccessor interface
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  /**
   * This function is binded to the event change of @constant model
   * @param dateObject
   */
  emitDate(dateObject: any) {
    // Emit the date to the other components
    this.date.emit(DateTime.fromJSDate(dateObject.value.toDate()))
  }

  /**
   * This function is resppnsible to filter the date to disable if they are out of range of valid dates.
   * @param dateObject
   */
  myDateFilter = (d:Date): boolean => {
    if (!!this.upperLimit && DateTime.fromISO(this.upperLimit).isvalid) {
      //checking for the upper bound -> i.e start_date can not greate than due_date.
      return this.isBefore(d, this.upperLimit);
    } else if (!!this.lowerLimit && DateTime.fromISO(this.lowerLimit).isvalid) {
      //checking for the lower bound -> i.e due_date can not smaller than start_date.
      return this.isBefore(d, this.lowerLimit);
    } else {
      return true;
    }
  }

  isBefore(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf('day').toMillis() < day2.startOf('day').toMillis();
      } else {
        return DateTime.fromISO(day1).startOf('day').toMillis() > DateTime.fromISO(day2).startOf('day').toMillis();
      }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
      return false;
    }
  }

  formateDate(date: any) {
    return this.utilityService.formateDate(date);
  }
}
