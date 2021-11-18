import { Component, OnInit, Input, ChangeDetectionStrategy, Injector, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { WorkplaceIntegrationsDialogComponent } from './workplace-integrations-dialog/workplace-integrations-dialog.component';

@Component({
  selector: 'app-workplace-integrations',
  templateUrl: './workplace-integrations.component.html',
  styleUrls: ['./workplace-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceIntegrationsComponent implements OnInit {

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any = {};

  // Router State Object - can have either 'billing' or 'general'
  @Input('routerState') routerState: string = '';

  @Output() workspaceUpdatedEvent = new EventEmitter();

  editWorkspaceName = false;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private injector: Injector
    ) { }

  ngOnInit() {
  }

  openWorkplaceIntegrationsDialog(workspaceId: string) {
    const data = {
    }
    const dialogRef = this.dialog.open(WorkplaceIntegrationsDialogComponent, {
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    /*
    const datesSavedEventSubs = dialogRef.componentInstance.datesSavedEvent.subscribe((data) => {
      this.selectedDays = [];
      data.forEach(day => {
        day.date = moment(day.date).format('YYYY-MM-DD');
        this.bookedDays.push(day);
      });

      this.refresh.next();
    });
    */
    dialogRef.afterClosed().subscribe(result => {
      //datesSavedEventSubs.unsubscribe();
    });
  }
}
