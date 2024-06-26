import { Component, OnInit, Input, Output, EventEmitter, Inject, Injector  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-edit-lounge',
  templateUrl: './edit-lounge.component.html',
  styleUrls: ['./edit-lounge.component.scss']
})
export class EditLoungeComponent implements OnInit {

  // Output Created Column
  @Output() loungeEditEvent = new EventEmitter();
  @Output() newLoungeEvent = new EventEmitter();
  @Output() closeEvent = new EventEmitter();

  lounge: any;
  categories = [];
  parent: string;

  newLoungeName: any;
  namePlaceholder = '';

  workspaceData: any = {};
  userData: any = {};

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<EditLoungeComponent>,
    private injector: Injector,
    private loungeService: LoungeService,
    public utilityService: UtilityService,
    ) { }

  async ngOnInit() {
    this.lounge = this.data.lounge;
    this.categories = this.data.categories;
    this.parent = this.data.parent;

    if (!this.lounge._parent) {
      this.lounge._parent = {_id : (this.parent) ? this.parent : ''};
    }

    this.namePlaceholder = (this.lounge.type == 'lounge')
      ? $localize`:@@editLounge.renameTheLounge:Rename the lounge`
      : $localize`:@@editLounge.renameTheCategory:Rename the category`;

      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
      this.userData = await this.publicFunctions.getCurrentUser();
  }

  /**
   * This function emits the column to the parent components
   */
  saveLounge() {
    if (this.lounge._id) {
      let properties: any = {};
      if (this.newLoungeName && this.newLoungeName != '') {
        properties.name = this.newLoungeName;
      }

      if (this.lounge?.type == 'lounge' && this.categories) {
        properties._parent = this.lounge._parent._id;
      }

      this.utilityService.asyncNotification($localize`:@@editLounge.pleaseWaitWeUpdateLounge:Please wait we are updating the lounge...`,
        new Promise(async (resolve, reject) => {
          this.loungeService.editLounge(this.lounge._id, properties).then(res => {
              this.lounge = res['lounge'];
              this.mdDialogRef.close();
              this.loungeEditEvent.emit(this.lounge);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editLounge.loungeUpdated:Lounge updated`))
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editLounge.unableToUpdate:Unable to update the lounge, please try again!`))
            });
        }));

    } else {
      const loungeParent = (this.lounge._parent._id || this.lounge._parent);
      const parent =
        (this.parent)
          ? ((this.parent == loungeParent) ? this.parent : loungeParent)
          : loungeParent;
      if (!parent || parent._id == '' || !this.newLoungeName || this.newLoungeName == '') {
        this.utilityService.errorNotification($localize`:@@editLounge.missingProperties:The element you are trying to create is missing some properties.`);
        return;
      }
      let newLounge = {
        name: this.newLoungeName,
        type: 'lounge',
        _parent: parent,
        _workspace: this.workspaceData._id,
        _posted_by: this.userData._id,
        created_date: moment().format()
      }

      this.utilityService.asyncNotification($localize`:@@editLounge.pleaseWaitWeAddLounge:Please wait we are adding the lounge...`,
        new Promise(async (resolve, reject) => {
          this.loungeService.addLounge(newLounge).then(res => {
              this.mdDialogRef.close();
              this.newLoungeEvent.emit(res['lounge']);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editLounge.loungeAdded:Lounge Added`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editLounge.unableToAdd:Unable to add the lounge, please try again!`));
            });
        }));
    }

  }

  onCloseDialog() {
    this.mdDialogRef.close();
    this.closeEvent.emit();
  }
}
