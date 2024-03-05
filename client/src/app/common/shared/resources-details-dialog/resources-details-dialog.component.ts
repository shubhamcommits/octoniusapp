import { Component, EventEmitter, Inject, Injector, LOCALE_ID, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { ResourcesGroupService } from 'src/shared/services/resources-group-service /resources-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-resources-details-dialog',
  templateUrl: './resources-details-dialog.component.html',
  styleUrls: ['./resources-details-dialog.component.scss']
})
export class ResourcesDetailsDialogComponent implements OnInit {

  @Output() newResourceEvent = new EventEmitter();
  @Output() editedResourceEvent = new EventEmitter();
  @Output() removeResourceEvent = new EventEmitter();

  resourceId;
  newResource: any = {
    title: '',
    description: '',
    total_stock: 0,
    used_stock: 0,
    _group: null,
    custom_fields: new Map<string, string>()
  };
  
  resourceData: any;

  editResource = false;
  
  customFields = [];
  selectedCFValues = [];

  groupData;
  userData: any;
  workspaceData: any;

  chartReady = false;

  doughnutChartLabels = [];
  doughnutChartData = [0];
  doughnutChartType = 'doughnut';
  doughnutChartOptions = {
    cutoutPercentage: 75,
    responsive: true,
    legend: {
      display: false
    }
  };
  doughnutChartColors = [{
    backgroundColor: [
      '#2AA578'
    ]
  }];
  doughnutChartPlugins = [];

  qrCodeUrl = environment.clientUrl;

  cfSearchText = '';
  cfSearchPlaceholder = $localize`:@@resourcesDetailsDialog.cfSearchPlaceholder:Search`;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private resourcesGroupService: ResourcesGroupService,
    private utilityService: UtilityService,
    private injector: Injector,
    private mdDialogRef: MatDialogRef<ResourcesDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    this.resourceId = (!!this.data) ? this.data.resourceId : null;
  }

  async ngOnInit() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }
    if (!this.groupData) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }
    if (!this.workspaceData) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    if (!!this.resourceId) {
      this.initResourceToEdit();
    } else {
      this.initNewResource();
    }

    this.qrCodeUrl = environment.clientUrl;
    if (environment.production) {
      this.qrCodeUrl += '/' + this.locale;
    }
    
    this.qrCodeUrl += '/dashboard/work/groups/resource/id=' + this.resourceData?._id;
  }

  async initNewResource() {
    this.newResource = {
      title: '',
      description: '',
      total_stock: 0,
      used_stock: 0,
      _group: this.groupData,
      custom_fields: new Map<string, string>()
    };

    await this.initCustomFields();
  }

  initResourceToEdit() {
    this.resourcesGroupService.getResourceDetails(this.resourceId).then(res => {
        this.initEditResource(res['resource']);

        this.utilityService.resolveAsyncPromise($localize`:@@resourcesDetailsDialog.resourceCreated:Resource created!`);
      })
      .catch(()=> this.utilityService.rejectAsyncPromise($localize`:@@resourcesDetailsDialog.unexpectedErrorCreatingResource:An unexpected error occurred while creating the resource, please try again!`));
  }

  async initEditResource(resourceData: any) {
    this.resourceData = resourceData;

    await this.initCustomFields();
    await this.initGraphic();
  }

  async initCustomFields() {
    let customFieldsTmp = this.groupData?.resources_custom_fields;

    if (!customFieldsTmp) {
      await this.resourcesGroupService.getGroupResourcesCustomFields(this.resourceData?._group?._id || this.resourceData?._group).then((res) => {

        if (!!res['group']['resources_custom_fields']) {
          res['group']['resources_custom_fields'].forEach(field => {
            if (!field.input_type) {
              field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
            }
            this.customFields.push(field);
          });
        }
      });
    } else {
      this.customFields = [];
      
      customFieldsTmp.forEach(field => {
        if (!field.input_type) {
          field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
        }
        this.customFields.push(field);

        if (!!this.resourceData) {
          if (!this.resourceData?.custom_fields) {
            this.resourceData.custom_fields = new Map<string, string>();
          }
          
          if (!this.resourceData?.custom_fields[field.name]) {
            this.resourceData.custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            this.selectedCFValues[field.name] = this.resourceData.custom_fields[field.name];
          }
        }
      });
    }
  }

  async initGraphic() {
    if (!this.resourceData) {
      this.doughnutChartPlugins = [{
        beforeDraw(chart) {
          const ctx = chart.ctx;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

          ctx.font = '25px Nunito';
          ctx.fillStyle = '#9d9fa1';

          ctx.fillText('No Stock', centerX, centerY);
        }
      }];
    }


    /* Chart Setup */
    this.doughnutChartLabels = [$localize`:@@resourcesDetailsDialog.totalStock:Total stock`, $localize`:@@resourcesDetailsDialog.usedStock:Used stock`];
    this.doughnutChartData = [this.resourceData.total_stock, this.resourceData.used_stock];
    this.doughnutChartColors = [{
      backgroundColor: ['#005fd5', '#fbb732']
    }];

    this.chartReady = true;
  }

  createResource() {
    this.utilityService.asyncNotification($localize`:@@resourcesDetailsDialog.pleaseWaitWeCreateResource:Please wait, while we are creating the resource for you...`, new Promise((resolve, reject) => {
      this.resourcesGroupService.createResource(this.newResource).then(res => {
          this.newResourceEvent.emit(res['resource']);
          this.initNewResource();
          this.initEditResource(res['resource'])
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@resourcesDetailsDialog.resourceCreated:Resource created!`))
        })
        .catch(()=> reject(this.utilityService.rejectAsyncPromise($localize`:@@resourcesDetailsDialog.unexpectedErrorCreatingResource:An unexpected error occurred while creating the resource, please try again!`)));
      }));
  }

  deleteResource() {
    this.removeResourceEvent.emit(this.resourceData?._id);
  }

  onResouceEditedEmitter(resource: any) {
    this.resourceData = resource;
    this.editedResourceEvent.emit(this.resourceData);
  }

  onUpdated(propertyData: any) {
    this.utilityService.asyncNotification($localize`:@@resourcesDetailsDialog.pleaseWaitsavingSettings:Please wait we are saving the new resource...`,
      new Promise((resolve, reject) => {
        this.resourcesGroupService.saveResouceProperty(this.resourceData?._id, propertyData)
          .then(()=> {
            this.editedResourceEvent.emit(this.resourceData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@resourcesDetailsDialog.resourceSaved:Resource saved!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@resourcesDetailsDialog.unableToSave:Unable to save the resource, please try again!`)))
      }));
  }

  saveNewResourceCustomField(customFieldValue: string, customFieldName: string) {
    if (!this.newResource.custom_fields) {
      this.newResource.custom_fields = new Map<string, string>();
    }

    this.newResource.custom_fields[customFieldName] = customFieldValue;
  }

  onCustomFieldChange(event: Event, customFieldName: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveInputCustomField(event: Event, customFieldName: string) {
    const customFieldValue = event.target['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  getCFDate(dateObject: any, cfTitle: string) {
    this.saveCustomField(cfTitle, dateObject.toDate());
  }

  saveCustomField(customFieldName: string, customFieldValue: string) {
    this.utilityService.asyncNotification($localize`:@@resourcesDetailsDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.resourcesGroupService.saveCustomField(this.resourceData?._id, customFieldName, customFieldValue)
        .then(async (res) => {
          this.selectedCFValues[customFieldName] = customFieldValue;
          this.resourceData.custom_fields[customFieldName] = customFieldValue;

          this.editedResourceEvent.emit(this.resourceData);

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@resourcesDetailsDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@resourcesDetailsDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  saveAsImage(parent: any) {
    let parentElement = parent.qrcElement.nativeElement.querySelector("canvas").toDataURL("image/png");

    if (parentElement) {
      // converts base 64 encoded image to blobData
      let blobData = this.convertBase64ToBlob(parentElement)
      // saves as image
      const blob = new Blob([blobData], { type: "image/png" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      // name of the file
      link.download = "angularx-qrcode"
      link.click()
    }
  }

  private convertBase64ToBlob(Base64Image: string) {
    // split into two parts
    const parts = Base64Image.split(";base64,")
    // hold the content type
    const imageType = parts[0].split(":")[1]
    // decode base64 string
    const decodedData = window.atob(parts[1])
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length)
    // insert all character code into uint8array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i)
    }
    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType })
  }

  isValidResource() {
    return (!!this.newResource && !!this.newResource?.title && this.newResource?.description && !!this.newResource?.total_stock && !!this.newResource?.used_stock);
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

  formateDate(date) {
    return (date) ? moment.utc(date).add('1', 'day').format("MMM D, YYYY") : '';
  }

  getBalanceClass() {
    let percentage = (!!this.resourceData.total_stock) ? ((this.resourceData.total_stock - (this.resourceData.used_stock || 0)) * 100) / this.resourceData.total_stock : 0;
    return (percentage <= 5) ? 'danger' : (percentage <= 20) ? 'warning' : 'ok' ;
  }
}
