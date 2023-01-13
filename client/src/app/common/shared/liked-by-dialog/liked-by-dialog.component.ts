import { Component, OnInit, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';

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
      private injector: Injector,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private mdDialogRef: MatDialogRef<LikedByDialogComponent>
    ) {}

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.usersList = this.data.usersList;
  }

  closeDialog() {
    this.mdDialogRef.close();
  }
}
