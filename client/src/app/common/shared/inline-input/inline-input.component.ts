import { Component,
  Input,
  ElementRef,
  ViewChild,
  Renderer,
  forwardRef,
  OnInit, 
  EventEmitter,
  Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InlineInputComponent),
  multi: true
};

@Component({
  selector: 'app-inline-input',
  templateUrl: './inline-input.component.html',
  providers: [INLINE_EDIT_CONTROL_VALUE_ACCESSOR],
  styleUrls: ['./inline-input.component.scss']
})
export class InlineInputComponent implements ControlValueAccessor, OnInit {

  @ViewChild('inlineEditControl', {static: true}) inlineEditControl: ElementRef; // input DOM element
  @Input() label = '';  // Label value for input element
  @Input() type = 'text'; // The type of input element
  @Input() required = false; // Is input requried?
  @Input() disabled = false; // Is input disabled?
  @Input() domainObject: any; // Complete object to be updated

  @Input() workspaceId: string;
  @Input() userData;
  @Input() groupId: string;
  @Input() showAssigneeName: boolean = false;

  @Input() options: [string];

  private _value = ''; // Private variable for input value
  private preValue = ''; // The value before clicking to edit
  editing = false; // Is Component in edit mode?

  profilePicUrl = '';

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
    private renderer: Renderer,
    public utilityService: UtilityService,
    private postService: PostService
    ) {
  }

  ngOnInit() {
    if (this.domainObject.task._assigned_to) {
      this.profilePicUrl = environment.UTILITIES_USERS_UPLOADS + '/' + this.domainObject.task._assigned_to.profile_pic;
    } else {
      this.profilePicUrl = 'assets/images/user.png';
    }
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
    this.editing = false;
    // Emit the date to the other components
    this.value = new Date(dateObject.year, dateObject.month - 1, dateObject.day);
    this.saveData();
  }

  onCustomFieldChange($event: Event) {
    this.editing = false;

    // Save the data
    this.saveData();
  }

  // Start the editting process for the input element
  edit(value) {
    if (this.disabled) {
      return;
    }

    this.preValue = value;
    this.editing = true;
    // Focus on the input element just as the editing begins
    // setTimeout(_ => this.renderer.invokeElementMethod(this.inlineEditControl, 'focus', []));
  }

  getMemberDetails(memberMap: any) {
    this.editing = false;

    if (this.domainObject.type === 'task') {
      // Set the unassigned state of task to be false
      this.domainObject.task.unassigned = false;

      // Assign the value of member map to the taskAssignee variable
      for (const member of memberMap.values()) {
        this.value = member;
      }

      this.profilePicUrl = environment.UTILITIES_USERS_UPLOADS + '/' + this.value.profile_pic;

      this.saveData();
    }
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
      task: this.domainObject.task
    };

    // If type is task, then add following properties too
    if (this.domainObject.type === 'task') {

      // Adding unassigned property for previous tasks model
      if (this.domainObject.task.unassigned === 'No') {
        this.domainObject.task.unassigned = false;
      }

      // Adding unassigned property for previous tasks model
      if (this.domainObject.task.unassigned === 'Yes') {
        this.domainObject.task.unassigned = true;
      }

      // Unassigned property
      postToUpdate.unassigned = this.domainObject.task.unassigned;
      if (!postToUpdate.unassigned && this.type === 'assignee') {
        postToUpdate.assigned_to = this.value;
      }

      // Task Assigned to
      if (!postToUpdate.unassigned && this.domainObject.task._assigned_to !== null) {
        postToUpdate.assigned_to = this.domainObject.task._assigned_to._id;
      }

      // Task due date
      if (this.type === 'date') {
        postToUpdate.date_due_to = this.value;
      } else {
        postToUpdate.date_due_to = this.domainObject.task.due_to;
      }

      // Task column
      postToUpdate._column = {
        title: this.domainObject.task._column.title
      },

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

      this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
        this.postService.edit(this.domainObject._id, formData)
          .then((res) => {
            // Emit the post to other components
            // let post = res['post'];
            this.post.emit(res['post']);

            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
          });
      }));
    }
  }
}
