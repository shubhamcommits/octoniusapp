import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LibraryService } from 'src/shared/services/library-service/library.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit, OnDestroy {

  public workspaceData: any = {};
  public userData: any = {};
  public groupData: any= {};

  isManager: boolean = false;

  collections = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private libraryService: LibraryService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'group'
    });

    this.libraryService.getCollectionsByGroup(this.groupData?._id).then(res => {
      this.collections = res['collections'];
    });

    this.isManager = this.isManagerUser();

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  ngOnDestroy(){
    this.isLoading$.complete();
  }

  onCollectionEmiter(collections: any) {
    if (collections && collections.length > 0) {
      this.collections = this.collections.concat(collections);
    }
  }

  isManagerUser() {
    return this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';
  }
}
