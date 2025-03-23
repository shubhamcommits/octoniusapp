import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Injector,
} from "@angular/core";
import { PublicFunctions } from "modules/public.functions";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

@Component({
  selector: "app-task-status",
  templateUrl: "./task-status.component.html",
  styleUrls: ["./task-status.component.scss"],
})
export class TaskStatusComponent implements OnInit {
  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) {}

  // Post Variable as the input object
  @Input() postId: string;
  @Input() groupId: string;
  @Input() userId: string;
  @Input() status: string;
  @Input() disabled: string;
  @Input() shuttleType: boolean = false;

  // Move Task Output Emitter
  @Output("status") statusEmitter = new EventEmitter();
  @Output() taskRecurrentEvent = new EventEmitter();

  // Public Functions
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {}

  /**
   * This function is used to change the status of a task post
   * @param status
   */
  changeStatus(status: string) {
    if (!this.shuttleType) {
      this.utilityService.asyncNotification(
        $localize`:@@taskStatus.pleaseWaitWeUpdateStatus:Please wait we are updating the status of the task...`,
        new Promise((resolve, reject) => {
          // Call HTTP Request to change the request
          this.publicFunctions
            .changeTaskStatus(this.postId, status, this.userId, this.groupId)
            .then((res: any) => {
              this.status = status;
              // Emit the status to other parent components
              this.statusEmitter.emit(status);

              if (!!res?.recurrentPost) {
                this.taskRecurrentEvent.emit(res?.recurrentPost);
              }

              resolve(
                this.utilityService.resolveAsyncPromise(
                  $localize`:@@taskStatus.taskMarkedAs:Task status marked as ${status}!`
                )
              );
            })
            .catch(() => {
              this.statusEmitter.emit(this.status);
              reject(
                this.utilityService.rejectAsyncPromise(
                  $localize`:@@taskStatus.unableToChangeStatus:Unable to change the status, please try again!`
                )
              );
            });
        })
      );
    } else {
      this.statusEmitter.emit(status);
    }
  }
}
