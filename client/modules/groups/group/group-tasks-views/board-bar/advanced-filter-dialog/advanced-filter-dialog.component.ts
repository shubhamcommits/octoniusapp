import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-advanced-filter-dialog',
  templateUrl: './advanced-filter-dialog.component.html',
  styleUrls: ['./advanced-filter-dialog.component.scss']
})
export class AdvancedFilterDialogComponent implements OnInit {

  customFields = [];
  cfValues = [];

  cfName;
  cfValue;

  groupData;

  @Output() customFieldEvent = new EventEmitter();

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<AdvancedFilterDialogComponent>
  ) { }

  async ngOnInit() {
    this.groupData = this.data.groupData;
    this.cfName = this.data.cf.name;
    this.cfValue = this.data.cf.value;

    await this.groupService.getGroupCustomFields(this.groupData._id).then((res) => {
      res['group']['custom_fields'].forEach(field => {
        if (!field.input_type) {
          field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
          this.customFields.push(field);
        }
      });
    });

    this.customFields.sort((cf1, cf2) => (cf1.title > cf2.title) ? 1 : -1);

    this.cfValues = this.getCustomFieldValues(this.cfName);
  }

  customFieldSelected(cfName) {
    this.cfValues = this.getCustomFieldValues(cfName);
  }

  getCustomFieldValues(cfName) {
    const cf = this.customFields.find((element) => {
      if (element.name == cfName) {
        return element;
      }
    });
    return cf?.values || [];
  }

  filter() {
    this.customFieldEvent.emit({name: this.cfName, value: this.cfValue});
    this.mdDialogRef.close();
  }

  cancel() {
    this.cfName = '';
    this.cfValue = '';
    this.cfValues = [];

    this.customFieldEvent.emit({name: '', value: ''});
    this.mdDialogRef.close();
  }
}
