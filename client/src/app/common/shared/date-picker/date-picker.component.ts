import { Component, OnInit, Output, EventEmitter, Input, forwardRef } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NG_VALUE_ACCESSOR} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

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
export class DatePickerComponent implements OnInit {

  constructor() { }

  // Date Model Variable
  // model: NgbDateStruct;

  @Input('dueDate') dueDate: Date;

  // Output date event emitter
  @Output('date') date = new EventEmitter();

  private _value = ''; // Private variable for input value

  public onChange: any = Function.prototype; // Trascend the onChange event

  ngOnInit() {
    /*
    if (this.dueDate){
      this.selectedDate = this.dueDate;
    }
    else{
      this.selectedDate = new Date();
    }
    */
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
  emitDate(dateObject: any){

    // Emit the date to the other components
    // this.selectedDate = new Date(dateObject.year, dateObject.month - 1, dateObject.day)
    this.date.emit(dateObject.value)
  }

}
