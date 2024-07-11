import { Component, OnInit, Input, ChangeDetectionStrategy, Injector, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { WorkplaceIntegrationsDialogComponent } from './workplace-integrations-dialog/workplace-integrations-dialog.component';

@Component({
  selector: 'app-workplace-integrations',
  templateUrl: './workplace-integrations.component.html',
  styleUrls: ['./workplace-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceIntegrationsComponent implements OnInit {

  @Input('workspaceData') workspaceData: any = {};
  @Input('userData') userData: any = {};
  @Input('routerState') routerState: string = '';

  @Output() workspaceUpdatedEvent = new EventEmitter();

  editWorkspaceName = false;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
    ) { }

  ngOnInit() {
  }

  openWorkplaceIntegrationsDialog() {
    const data = {
    }
    const dialogRef = this.dialog.open(WorkplaceIntegrationsDialogComponent, {
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const datesSavedEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    });

    dialogRef.afterClosed().subscribe(async result => {
      datesSavedEventSubs.unsubscribe();
      this.changeDetectorRef.detectChanges();
    });
  }
}
