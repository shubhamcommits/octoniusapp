import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-entity',
  templateUrl: './new-entity.component.html',
  styleUrls: ['./new-entity.component.scss']
})
export class NewEntityComponent implements OnInit {

  @Output() entityCreatedEvent = new EventEmitter();

  workspaceId;

  entityName: string = '';

  constructor(
    private hrService: HRService,
    private utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<NewEntityComponent>
  ) {
    this.workspaceId = this.data.workspaceId;
  }

  ngOnInit() {
  }

  createEntity() {
    if (this.entityName != '') {
      this.hrService.create(this.workspaceId, this.entityName).then(res => {
        this.entityCreatedEvent.emit(res['entity']);
        this.mdDialogRef.close();
      });
    } else {
      this.utilityService.errorNotification($localize`:@@newEntity.enterName:Kindly enter an entity name.`);
    }
  }

  cancel() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
