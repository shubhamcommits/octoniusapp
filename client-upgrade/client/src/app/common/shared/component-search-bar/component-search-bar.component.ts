import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-component-search-bar',
  templateUrl: './component-search-bar.component.html',
  styleUrls: ['./component-search-bar.component.scss']
})
export class ComponentSearchBarComponent implements OnInit {

  constructor(private injector: Injector) { }

  // Placeholder for the input bar
  @Input('placeholder') placeholder: string = '';

  // Type are 'workspace', 'group', 'skill'
  @Input('type') type: string;

  // Incase the type is 'workspace'
  @Input('workspaceId') workspaceId?: string;

  // Incase the type is 'group'
  @Input('groupId') groupId?: string;

  // User Data Object
  @Input('userData') userData: any = {};

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
  }

  async userSearchQuery(query: Event) {
    try {
      console.log(query.target['value']);
      let results = await this.searchWorkspaceMembers(this.workspaceId, query.target['value']);
      console.log(results);
    } catch (err) {
      this.publicFunctions.catchError(err);
    }
  }

  async searchWorkspaceMembers(workspaceId: string, query: string) {
    try {
      return new Promise(async (resolve) => {
        let workspaceService = this.injector.get(WorkspaceService);
        let test = await workspaceService.searchWorkspaceMembers(workspaceId, query)
        console.log(test);
      })

    } catch (err) {
      this.publicFunctions.catchError(err);
    }
  }
}
