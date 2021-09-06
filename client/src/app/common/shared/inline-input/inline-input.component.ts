import { Component,
  Input,
  ElementRef,
  ViewChild,
  Renderer2,
  forwardRef,
  OnChanges,
  EventEmitter,
  Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InlineInputComponent),
  multi: true
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'MMM DD, YYYY',
  },
  display: {
    dateInput: 'MMM DD, YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-inline-input',
  templateUrl: './inline-input.component.html',
  providers: [
    INLINE_EDIT_CONTROL_VALUE_ACCESSOR,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [ MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS ]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  styleUrls: ['./inline-input.component.scss']
})
export class InlineInputComponent implements ControlValueAccessor, OnChanges {

  @ViewChild('inlineEditControl', {static: true}) inlineEditControl: ElementRef; // input DOM element

  @Input() label = '';  // Label value for input element
  @Input() type = 'text'; // The type of input element
  @Input() required = false; // Is input requried?
  @Input() disabled = false; // Is input disabled?
  @Input() domainObject: any; // Complete object to be updated
  @Input() styleClass = '';
  @Input() groupId: string;
  @Input() options: [string];
  @Input() customFieldName='';
  @Input() customFieldInputType = false;

  customFieldValue = '';

  private _value = ''; // Private variable for input value
  private preValue = ''; // The value before clicking to edit

  editing = false; // Is Component in edit mode?

  dateStyleClass = '';

  public onChange: any = Function.prototype; // Trascend the onChange event
  public onTouched: any = Function.prototype; // Trascend the onTouch event
  public onFocusout: any = Function.prototype; // Trascend the onTouch event

  // Post Event Emitter - Emits the post to the other components
  @Output() post = new EventEmitter();

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

  constructor(
    element: ElementRef,
    private renderer: Renderer2,
    public utilityService: UtilityService,
    private postService: PostService
    ) {
  }

  ngOnChanges() {
    if (this.type === 'customField') {
      if (!this.domainObject.task.custom_fields) {
        this.domainObject.task.custom_fields = new Map<string, string>()
      }
      if (!this.domainObject.task.custom_fields[this.customFieldName]) {
        this.customFieldValue = '';
      } else {
        this.customFieldValue = this.domainObject.task.custom_fields[this.customFieldName];
      }
    }

    this.dateStyleClass = 'input-date ' +  this.styleClass;
  }

  // Required for ControlValueAccessor interface
  writeValue(value: any) {
    this._value = value;
  }

  // Required forControlValueAccessor interface
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  // Required forControlValueAccessor interface
  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  // Required forControlValueAccessor interface
  public registerOnFocusout(fn: () => {}): void {
    this.onFocusout = fn;
  }

  // Do stuff when the input element loses focus
  focusout($event: Event) {
    this.editing = false;
  }

  // Do stuff when the input element loses focus
  onBlur($event: Event) {
    this.editing = false;

    // Save the data
    this.saveData();
  }

  /**
   * Do stuff when the date element change
   * @param dateObject
   */
  onModelChange(dateObject: any) {
    this.value = dateObject.value;
    this.updateDate(this.value, 'due_date');
  }

  async updateDate(date, property) {
    await this.utilityService.asyncNotification($localize`:@@inlineInput.pleaseWaitUpdatingContent:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      if (property === 'due_date') {
        this.postService.changeTaskDueDate(this.domainObject._id, moment(date).format('YYYY-MM-DD'))
          .then((res) => {
            // Emit the post to other components
            this.post.emit({post: res['post']});

            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@inlineInput.dateUpdated:Date updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@inlineInput.unableToUpdateDate:Unable to update the date, please try again!`));
          });
      } else if(property === 'start_date') {
        this.postService.saveTaskDates(this.domainObject._id, moment(date).format('YYYY-MM-DD'), property)
          .then((res) => {
            this.domainObject = res['post'];
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@inlineInput.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@inlineInput.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }
    }));
  }

  onCustomFieldChange($event: Event) {
    this.editing = false;

    this.domainObject.task.custom_fields[this.customFieldName] = this.customFieldValue;

    this.utilityService.asyncNotification($localize`:@@inlineInput.pleaseWaitUpdatingContent:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.saveCustomField(this.domainObject._id, this.customFieldName, this.customFieldValue, this.groupId)
        .then((res) => {
          // Emit the post to other components
          this.post.emit({post: res['post'], cfTrigger: {name: this.customFieldName, value: this.customFieldValue}});

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@inlineInput.cFUpdated:${this.customFieldName} updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@inlineInput.unableToUpdateCF:Unable to update ${this.customFieldName}, please try again!`));
        });
    }));
  }

  // Start the editting process for the input element
  edit(value) {
    if (this.disabled) {
      return;
    }

    this.preValue = value;
    this.editing = true;
  }

  saveData() {

    // Prepare the normal  object
    const postToUpdate: any = {
      title: this.domainObject.title,
      type: this.domainObject.type,
      content: this.domainObject.quillData ? JSON.stringify(this.domainObject.quillData.contents) : this.domainObject.content,
      _content_mentions: this.domainObject._content_mentions,
      tags: this.domainObject.tags,
      _read_by: this.domainObject._read_by,
      task: this.domainObject.task,
      assigned_to: (this.domainObject._assigned_to) ? this.domainObject._assigned_to : [],
      start_date: this.domainObject.task.start_date
    };

    // If type is task, then add following properties too
    if (this.domainObject.type === 'task') {

      // Task due date
      if (this.type === 'date') {
        postToUpdate.date_due_to = this.value;
      } else {
        postToUpdate.date_due_to = this.domainObject.task.due_to;
      }

      if (this.domainObject.task && this.domainObject.task._column) {
        // Task column
        postToUpdate._column = this.domainObject.task._column._id || this.domainObject.task._column;
      }

      // Task status
      postToUpdate.status = this.domainObject.task.status;

      // Create FormData Object
      let formData = new FormData();

      // Append Post Data
      formData.append('post', JSON.stringify(postToUpdate));

      // Append all the file attachments
      if (this.domainObject.files !== null && this.domainObject.files.length !== 0) {
        for (let index = 0; index < this.domainObject.files.length; index++) {
          formData.append('attachments', this.domainObject.files[index], this.domainObject.files[index]['name']);
        }
      }

      this.utilityService.asyncNotification($localize`:@@inlineInput.pleaseWaitUpdatingContent:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.postService.edit(this.domainObject._id, formData)
          .then((res) => {
            // Emit the post to other components
            this.post.emit({post: res['post']});

            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@inlineInput.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@inlineInput.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
    }
  }

  getPriorityClass(priority: string) {
    return 'list-card-title inline-edit label-priority ' + priority.toLocaleLowerCase();
  }
}
