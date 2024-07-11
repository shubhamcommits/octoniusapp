import { Component, OnInit, Inject, Output, EventEmitter, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-confluence-import-dialog',
  templateUrl: './confluence-import-dialog.component.html',
  styleUrls: ['./confluence-import-dialog.component.scss']
})
export class ConfluenceImportDialogComponent implements OnInit {

  @Output() spacesImportedEvent = new EventEmitter();

  groupData;
  workspaceData;

  spaces: any = [];

  spacesToExport = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private libraryService: LibraryService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private mdDialogRef: MatDialogRef<ConfluenceImportDialogComponent>
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);
    
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    await this.getUserConfluenceSpaces();
  }

  async getUserConfluenceSpaces() {
    if (!this.workspaceData?.integrations?.is_atlassia_connected
        || !this.workspaceData?.integrations?.atlassia_url || this.workspaceData?.integrations?.atlassia_url == ''
        || !this.workspaceData?.integrations?.atlassia_token || this.workspaceData?.integrations?.atlassia_token == '') {
      return this.utilityService.errorNotification($localize`:@@confluenceImportDialog.provideDomainToken:Please provide a Domain and a Token!`)
    }

    await this.libraryService.getUserConfluenceSpaces(this.workspaceData?._id).then(res => {
      this.spaces = res['spaces'];
    });

    // Starts the spinner
    this.isLoading$.next(false);
  }

  spaceSelected(spaceKey: string) {
    if (!this.spacesToExport) {
      this.spacesToExport = [];
    }

    const index = this.spacesToExport.findIndex(space => space == spaceKey);
    if (index < 0) {
      this.spacesToExport.push(spaceKey);
    } else {
      this.spacesToExport.splice(index, 1)
    }
  }

  exportSelectedSpaces() {
    // Starts the spinner
    this.isLoading$.next(true);

    if (!this.workspaceData?.integrations?.is_atlassia_connected
        || !this.workspaceData?.integrations?.atlassia_url || this.workspaceData?.integrations?.atlassia_url == ''
        || !this.workspaceData?.integrations?.atlassia_token || this.workspaceData?.integrations?.atlassia_token == ''
        || !this.spacesToExport || this.spacesToExport.length == 0) {
      return this.utilityService.errorNotification($localize`:@@confluenceImportDialog.provideDomainTokenKeys:Please provide a Domain, a Token, and Spaces Keys to export!`)
    }

    this.libraryService.exportConfluenceSpaces(this.spacesToExport, this.workspaceData?._id, this.groupData?._id).then(res => {
      this.closeDialog(res['collections']);
    });
  }

  closeDialog(collections?: any) {
    this.spacesImportedEvent.emit(collections);

    // Starts the spinner
    this.isLoading$.next(false);

    this.mdDialogRef.close();
  }
}
