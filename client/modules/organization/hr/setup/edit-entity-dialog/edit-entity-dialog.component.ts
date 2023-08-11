import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CountryCurrencyService } from 'src/shared/services/country-currency/country-currency.service';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { EntityAddMembersDialogComponent } from '../entity-add-members-dialog/entity-add-members-dialog.component';

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
  membersLabel = $localize`:@@editEntityDialog.members:Members`;

  editName = false;

  currencies = [];

  cfTypes = ['Select', 'Number', 'Text', 'Date'];
  createNewCF = false;
  newCF = {
    _id: '',
    name: '',
    type: '',
    values: []
  }

  variableTypes = ['Number', 'Percentage'];
  createNewVariable = false;
  newVariable = {
    _id: '',
    name: '',
    type: '',
    value: 0
  }

  benefitTypes = ['Select', 'Multiselect', 'Number', 'Text', 'Date'];
  createNewBenefit = false;
  newBenefit = {
    _id: '',
    name: '',
    type: '',
    values: []
  }


  entityMembers = [];

  constructor(
    private hrService: HRService,
    private countryCurrencyService: CountryCurrencyService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<EditEntityDialogComponent>
  ) {
    this.entityId = this.data.entityId;
    this.hrService.getEntityDetails(this.entityId).then(res => {
      this.entityData = res['entity'];
    });

    this.currencies = this.countryCurrencyService.getCurrencies();
  }

  async ngOnInit() {
    await this.initMembers();
  }

  initMembers() {
    this.hrService.getEntityMembers(this.entityId).then(res => {
      this.entityMembers = res['members'];
    });
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

  /**
   * START CF
   */
  showNewCFForm() {
    this.createNewCF = !this.createNewCF;
  }

  changeCFType($event, cf) {
    cf.values = [];
  }

  saveCF() {
    this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
      if (this.newCF?._id && this.newCF?._id != '') {
        this.hrService.editEntityCF(this.entityData?._id, this.newCF).then(res => {
          const index = (this.entityData.payroll_custom_fields) ? this.entityData.payroll_custom_fields.findIndex(cfTmp => cfTmp._id == this.newCF._id) : -1;
          if (index >= 0) {
            this.entityData.payroll_custom_fields[index] = this.newCF;
          }

          this.cancelCF();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelCF();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
      } else {
        this.hrService.createNewCF(this.entityData?._id, this.newCF).then(res => {
          this.entityData = res['entity'];
          this.cancelCF();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelCF();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
      }
    }));
  }

  editEntityCF(cf: any) {
    this.newCF._id = cf._id;
    this.newCF.name = cf.name;
    this.newCF.type = cf.type;
    this.newCF.values = cf.values;

    this.showNewCFForm();
  }

  cancelCF() {
    this.newCF = {
      _id: '',
      name: '',
      type: '',
      values: []
    }
    this.createNewCF = !this.createNewCF;
  }

  deleteEntityCF(cfId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@editentitydialog.areYouSure:Are you sure?`, $localize`:@@editentitydialog.completelyRemovedCF:By doing this, the field will be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@editentitydialog.pleaseWaitDeleting:Please wait we are deleting the entity...`, new Promise((resolve, reject) => {
            this.hrService.deleteEntityCF(this.entityData?._id, cfId).then(res => {
              const index = (this.entityData.payroll_custom_fields) ? this.entityData.payroll_custom_fields.findIndex(cf => cf._id == cfId) : -1;
              if (index >= 0) {
                this.entityData.payroll_custom_fields.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editentitydialog.deleted:Entity deleted!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editentitydialog.unableDelete:Unable to delete the entity, please try again!`));
            });
          }));
        }
      });
  }

  addCFValue(cf, event: Event) {
    const newValue = event.target['value'];

    if (newValue !== '') {
      // Find the index of the field to check if the same named field exist or not
      const index = cf.values.findIndex((v: string) => v.toLowerCase() === newValue.toLowerCase());

      // If index is found, then throw error notification
      if (index !== -1) {
        this.utilityService.warningNotification($localize`:@@editentitydialog.valueAlreadyExists:Value already exists!`);
      } else {
        cf.values.push(newValue);

        event.target['value'] = '';
      }
    }
  }

  removeCFValue(cf, value: string) {
    const index = (cf.values) ? cf.values.findIndex((v: string) => v.toLowerCase() === value.toLowerCase()) : -1;
    if (index !== -1) {
      cf.values.splice(index, 1);
    }
  }
  /**
   * ENDS CF
   */

  /**
   * START VARIABLES
   */
  showNewVariableForm() {
    this.createNewVariable = !this.createNewVariable;
  }

  saveVariable() {
    this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
      if (this.newVariable?._id && this.newVariable?._id != '') {
        this.hrService.editEntityVariable(this.entityData?._id, this.newVariable).then(res => {
          const index = (this.entityData.payroll_variables) ? this.entityData.payroll_variables.findIndex(v => v._id == this.newVariable._id) : -1;
          if (index >= 0) {
            this.entityData.payroll_variables[index] = this.newVariable;
          }

          this.cancelVariable();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelVariable();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
      } else {
       this.hrService.createNewVariable(this.entityData?._id, this.newVariable).then(res => {
          // if (!this.entityData.payroll_variables) {
          //   this.entityData.payroll_variables = [];
          // }

          // this.entityData.payroll_variables.push(this.newVariable);
          this.entityData = res['entity'];
          this.cancelVariable();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelVariable();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
      }
    }));
  }

  editEntityVariable(variable: any) {
    this.newVariable._id = variable._id;
    this.newVariable.name = variable.name;
    this.newVariable.type = variable.type;
    this.newVariable.value = variable.value;

    this.showNewVariableForm();
  }

  cancelVariable() {
    this.newVariable = {
      _id: '',
      name: '',
      type: '',
      value: 0
    }
    this.createNewVariable = !this.createNewVariable;
  }

  deleteEntityVariable(variableId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@editentitydialog.areYouSure:Are you sure?`, $localize`:@@editentitydialog.completelyRemovedVariable:By doing this, the variable will be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@editentitydialog.pleaseWaitDeleting:Please wait we are deleting the entity...`, new Promise((resolve, reject) => {
            this.hrService.deleteEntityVariable(this.entityData?._id, variableId).then(res => {
              const index = (this.entityData.payroll_variables) ? this.entityData.payroll_variables.findIndex(v => v._id == variableId) : -1;
              if (index >= 0) {
                this.entityData.payroll_variables.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editentitydialog.deleted:Entity deleted!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editentitydialog.unableDelete:Unable to delete the entity, please try again!`));
            });
          }));
        }
      });
  }

  removeMemberFromEntity(memberId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@editentitydialog.areYouSure:Are you sure?`, $localize`:@@editentitydialog.removeFromEntity:By doing this, the user will be removed from the entity!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@editentitydialog.pleaseWaitDeletingMember:Please wait we are removing the member...`, new Promise((resolve, reject) => {
            this.hrService.removeMemberFromentity(this.entityData?._id, memberId).then(res => {
              const index = (this.entityMembers) ? this.entityMembers.findIndex(v => v._id == memberId) : -1;
              if (index >= 0) {
                this.entityMembers.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editentitydialog.remove:User removed!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editentitydialog.unableRemove:Unable to remove the user from the entity, please try again!`));
            });
          }));
        }
      });
  }
  /**
   * ENDS VARIABLES
   */

  /**
   * START BENEFITS
   */
  changeBenefitType($event, benefit) {
    benefit.values = [];
  }

  saveBenefit() {
    this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
      if (this.newBenefit?._id && this.newBenefit?._id != '') {
        this.hrService.editEntityBenefit(this.entityData?._id, this.newBenefit).then(res => {
          const index = (this.entityData.payroll_benefits) ? this.entityData.payroll_benefits.findIndex(benefitTmp => benefitTmp._id == this.newBenefit._id) : -1;
          if (index >= 0) {
            this.entityData.payroll_benefits[index] = this.newBenefit;
          }

          this.cancelBenefit();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelBenefit();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
      } else {
        this.hrService.createNewBenefit(this.entityData?._id, this.newBenefit).then(res => {
          this.entityData = res['entity'];
          this.cancelBenefit();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
        })
        .catch(() => {
          this.cancelBenefit();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
        });
      }
    }));
  }

  editEntityBenefit(benefit: any) {
    this.newBenefit._id = benefit._id;
    this.newBenefit.name = benefit.name;
    this.newBenefit.type = benefit.type;
    this.newBenefit.values = benefit.values;

    this.showNewBenefitForm();
  }

  showNewBenefitForm() {
    this.createNewBenefit = !this.createNewBenefit;
  }

  cancelBenefit() {
    this.newBenefit = {
      _id: '',
      name: '',
      type: '',
      values: []
    }
    this.createNewBenefit = !this.createNewBenefit;
  }

  deleteEntityBenefit(benefitId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@editentitydialog.areYouSure:Are you sure?`, $localize`:@@editentitydialog.completelyRemovedBenefit:By doing this, the benefit will be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@editentitydialog.pleaseWaitDeleting:Please wait we are deleting the entity...`, new Promise((resolve, reject) => {
            this.hrService.deleteEntityBenefit(this.entityData?._id, benefitId).then(res => {
              const index = (this.entityData.payroll_benefits) ? this.entityData.payroll_benefits.findIndex(benefit => benefit._id == benefitId) : -1;
              if (index >= 0) {
                this.entityData.payroll_benefits.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editentitydialog.deletedBenefit:Benefit deleted!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editentitydialog.unableDeleteBenefit:Unable to delete the benefit, please try again!`));
            });
          }));
        }
      });
  }

  addBenefitValue(benefit, event: Event) {
    const newValue = event.target['value'];

    if (newValue !== '') {
      // Find the index of the field to check if the same named field exist or not
      const index = benefit.values.findIndex((v: string) => v.toLowerCase() === newValue.toLowerCase());

      // If index is found, then throw error notification
      if (index !== -1) {
        this.utilityService.warningNotification($localize`:@@editentitydialog.valueAlreadyExists:Value already exists!`);
      } else {
        benefit.values.push(newValue);

        event.target['value'] = '';
      }
    }
  }

  removeBenefitValue(benefit, value: string) {
    const index = (benefit.values) ? benefit.values.findIndex((v: string) => v.toLowerCase() === value.toLowerCase()) : -1;
    if (index !== -1) {
      benefit.values.splice(index, 1);
    }
  }
  /**
   * ENDS BENEFITS
   */

  openAddMembersDialog() {
    const dialogRef = this.dialog.open(EntityAddMembersDialogComponent, {
      data: {
        entityId: this.entityId
      },
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true
    });

    const memberAddedEventSubs = dialogRef.componentInstance.memberAddedEvent.subscribe((data) => {
      this.initMembers();
    });

    dialogRef.afterClosed().subscribe(result => {
      memberAddedEventSubs.unsubscribe();
    });
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
