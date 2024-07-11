import { Component, OnInit, Inject, Injector } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-liked-by-dialog',
  templateUrl: './liked-by-dialog.component.html',
  styleUrls: ['./liked-by-dialog.component.scss']
})
export class LikedByDialogComponent implements OnInit {

  usersList: any = [];

  workspaceData: any;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);
  constructor(
      public utilityService: UtilityService,
      private injector: Injector,
      private mdDialogRef: MatDialogRef<LikedByDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.usersList = this.data.usersList;
  }

  closeDialog() {
    this.mdDialogRef.close();
  }
}
