import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-edit-entity-dialog',
  templateUrl: './edit-entity-dialog.component.html',
  styleUrls: ['./edit-entity-dialog.component.scss']
})
export class EditEntityDialogComponent implements OnInit {

  @Output() entityEditedEvent = new EventEmitter();

  entityId;
  entityData: any = {};

  workspaceData;

  generalLabel = $localize`:@@editEntityDialog.general:General`;
  payrollLabel = $localize`:@@editEntityDialog.payroll:Payroll`;

  editName = false;

  currencies = [];
  countries = [];

  variableTypes = ['Number', 'Percentage'];

  createNewVariable = false;
  newVariable = {
    name: '',
    type: '',
    value: 0
  }

  constructor(
    private hrService: HRService,
    private utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<EditEntityDialogComponent>
  ) {
    this.entityId = this.data.entityId;
    this.hrService.getEntityDetails(this.entityId).then(res => {
      this.entityData = res['entity'];
    });

    this.currencies = this.hrService.getCurrencies();
    this.countries = this.hrService.getCountries();
  }

  ngOnInit() {
  }

  enableEditName() {
    this.editName = !this.editName;
  }

  saveProperty(property_name: string, value: any) {

    this.entityData[property_name] = value;
    if (value != '') {
      switch (property_name) {
        case 'name':
          this.saveEntity({ 'name': value });
          this.enableEditName();
          break;
        case 'company_name':
          this.saveEntity({ 'company_name': value });
          break;
        case 'tax_id':
          this.saveEntity({ 'tax_id': value });
          break;
        case 'address_line_1':
          this.saveEntity({ 'address_line_1': value });
          break;
        case 'address_line_2':
          this.saveEntity({ 'address_line_2': value });
          break;
        case 'city':
          this.saveEntity({ 'city': value });
          break;
        case 'zip_code':
          this.saveEntity({ 'zip_code': value });
          break;
        case 'state':
          this.saveEntity({ 'state': value });
          break;
      }
    }
  }

  changeCurrency(value: any) {
    if (value) {
      this.entityData.currency_code = value;
      this.saveEntity({ 'currency_code': value });
    }
  }

  changeCountry(value: any) {
    if (value) {
      this.entityData.country = value;
      this.saveEntity({ 'country': value });
    }
  }

  async saveEntity(propertyToSave: any) {
    this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
       this.hrService.saveEntityProperty(this.entityData?._id, propertyToSave)
        .then(async (res) => {
          this.entityEditedEvent.emit(this.entityData);
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
    }));
  }

  showNewVariableForm() {
    this.createNewVariable = !this.createNewVariable;
  }

  saveNewVariable() {
    this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
       this.hrService.createNewVariable(this.entityData?._id, this.newVariable).then(res => {
          if (!this.entityData.variables) {
            this.entityData.variables = [];
          }

          this.entityData.variables.push(this.newVariable);
          this.cancelNewVariable();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelNewVariable();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
    }));
  }

  editEntityVariable(variable: any) {
    this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
      this.hrService.editEntityVariable(this.entityData?._id, variable).then(res => {
        const index = (this.entityData.variables) ? this.entityData.variables.findIndex(v => v._id == variable._id) : -1;
        if (index >= 0) {
          this.entityData.variables[index] = variable;
        }
      
        
        // Resolve with success
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
      })
      .catch(() => {
        this.cancelNewVariable();

        reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
      });
    }));
  }

  cancelNewVariable() {
    this.newVariable = {
      name: '',
      type: '',
      value: 0
    }
    this.createNewVariable = !this.createNewVariable;
  }

  deleteEntityVariable(variableId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@setup.areYouSure:Are you sure?`, $localize`:@@setup.completelyRemoved:By doing this, the entity be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@setup.pleaseWaitDeleting:Please wait we are deleting the entity...`, new Promise((resolve, reject) => {
            this.hrService.deleteEntityVariable(this.entityData?._id, variableId).then(res => {
              const index = (this.entityData.variables) ? this.entityData.variables.findIndex(v => v._id == variableId) : -1;
              if (index >= 0) {
                this.entityData.variables.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@setup.deleted:Entity deleted!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@setup.unableDelete:Unable to delete the entity, please try again!`));
            });
          }));
        }
      });
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
