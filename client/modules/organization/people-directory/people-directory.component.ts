import { Component, OnInit, Injector, AfterContentChecked } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { SearchService } from 'src/shared/services/search-service/search.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-people-directory',
  templateUrl: './people-directory.component.html',
  styleUrls: ['./people-directory.component.scss']
})
export class PeopleDirectoryComponent implements OnInit, AfterContentChecked {

  workspaceData;

  searchQuery = '';
  showAdvancedFilters: boolean = false;
  advancedFilters: any = {
    skills: [],
    cfName: '',
    cfValue: ''
  };
  customFields = [];
  selectedCustomField;
  searchedUsers = [];

  isLoading$;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
    private searchService: SearchService,
    private injector: Injector
  ) { }

  async ngOnInit() {

    this.utilityService.updateIsLoadingSpinnerSource(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.customFields = (this.workspaceData && this.workspaceData?.profile_custom_fields) ? this.workspaceData?.profile_custom_fields : [];

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  ngOnDestroy(){
    this.subSink.unsubscribe();
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  search() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.searchedUsers = [];

    if ((!this.searchQuery || this.searchQuery == '' || this.searchQuery == " ")
        && this.advancedFilters.skills.length == 0
        && (this.advancedFilters.cfName == '' || this.advancedFilters.cfValue == ' ')) {
      this.utilityService.updateIsLoadingSpinnerSource(false);
      return;
    }

    this.searchUsers(this.searchQuery);
  }

  /**
   * User Query Starts
   */
  searchUsers(userQuery){
    try {
      this.searchService.getSearchResults(userQuery, 'users', this.advancedFilters).then((res: any) => {
        if (res.results.length > 0) {
          const result = res.results.filter((restult) => this.searchedUsers.every((user) => user._id !== restult._id));
          result.forEach(user => {
            this.searchedUsers.push(user);
          });
        }
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
    } catch (error) {
      this.publicFunctions.sendError(error);
      this.utilityService.updateIsLoadingSpinnerSource(false);
    }
  }
  /**
   * User Query Ends
   */

  addNewSkill(skill) {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.advancedFilters?.skills?.push(skill);

    this.search();
  }

  removeSkill(index) {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.advancedFilters?.skills?.splice(index, 1);

    this.search();
  }

  clear() {
    this.searchQuery = '';
    this.showAdvancedFilters = false;
    this.advancedFilters = {
      skills: [],
      cfName: '',
      cfValue: ''
    };
    this.searchedUsers = [];
    this.customFields = [];
    this.selectedCustomField = null;
  }

  selectCFName(event: any) {
    this.advancedFilters.cfName = event.value;
    this.advancedFilters.cfValue = '';
    const index = (this.customFields) ? this.customFields.findIndex(cf => cf.name == this.advancedFilters.cfName) : -1;
    if (index >= 0) {
      this.selectedCustomField = this.customFields[index];
    }
  }

  selectCFValue(event: any) {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.advancedFilters.cfValue = event.value;

    this.search();
  }
}
