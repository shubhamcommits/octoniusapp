import { Component, OnInit, Input, Output, EventEmitter, Inject, Injector  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

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
    private loungeService: LoungeService
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

      this.loungeService.editLounge(this.lounge._id, properties).then(res => {
        this.lounge = res['lounge'];
        this.mdDialogRef.close();
        this.loungeEditEvent.emit(this.lounge);
      });

    } else {

      let newLounge = {
        name: this.newLoungeName,
        type: 'lounge',
        _parent: (!this.parent) ? this.lounge._parent : this.parent,
        _workspace: this.workspaceData._id,
        _posted_by: this.userData._id,
        created_date: moment().format()
      }

      this.loungeService.addLounge(newLounge).then(res => {
        this.mdDialogRef.close();
        this.newLoungeEvent.emit(res['lounge']);
      });
    }

  }

  onCloseDialog() {
    this.mdDialogRef.close();
    this.closeEvent.emit();
  }
}
