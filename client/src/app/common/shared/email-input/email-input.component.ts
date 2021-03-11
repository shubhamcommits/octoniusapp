import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss']
})
export class EmailInputComponent implements OnInit {

  constructor(
    private utilityService: UtilityService
  ) { }


  @Input('email') email: string = '';
  @Input('placeholder') placeholder: string = '';
  @Input('label') label: string = '';

  // This observable is mapped with email field to recieve updates on change value
  emailChanged: Subject<Event> = new Subject<Event>();

  // OUTPUT EMAIL EMITTER
  @Output('outputEmail') outputEmail = new EventEmitter();

  // Unsubscribe the Observables using SubSink()
  private subSink = new SubSink();

  ngOnInit() {
  }

  /**
   * This method is binded to keyup event of email input field
   * @param $event
   */
  emailChange($event: Event) {
    this.emailChanged.next($event);
  }

  /**
   * This function handles of sending the notification to the user about the email validation
   * Uses Debounce time and subscribe to the emailChanged Observable
   */
  ngAfterViewInit(): void {
    // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.emailChanged
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe(model => {
      this.utilityService.clearAllNotifications();
      let validatedEmailState = this.utilityService.validateEmail(this.email);
        if(validatedEmailState === true){
          this.utilityService.successNotification('Correct Email Format!');
          this.outputEmail.emit(this.email);
        } else {
          this.outputEmail.emit('');
          this.utilityService.warningNotification('Kindly follow the standard format which uses user@domain nomenclature, e.g - username@example.com', 'Wrong format!')
        }
    }))
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }

}
