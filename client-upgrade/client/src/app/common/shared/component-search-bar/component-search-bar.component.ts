import { Component, OnInit, Input, Injector } from '@angular/core';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-component-search-bar',
  templateUrl: './component-search-bar.component.html',
  styleUrls: ['./component-search-bar.component.scss']
})
export class ComponentSearchBarComponent implements OnInit {

  constructor(private injector: Injector) { }

  @Input('placeholder') placeholder: string = '';
  @Input('workspaceId') workspaceId?: string;

  private publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {

  }

  async userSearchQuery(query: Event){
    try{
      console.log(query.target['value']);
      let results = await this.searchWorkspaceMembers(this.workspaceId, query.target['value']);
      console.log(results);
    } catch(err){
      this.publicFunctions.catchError(err);
    }
  }

  async searchWorkspaceMembers(workspaceId: string, query: string){
    try{
        return new Promise(async (resolve)=>{
          let workspaceService = this.injector.get(WorkspaceService);
          let test = await workspaceService.searchWorkspaceMembers(workspaceId, query)
          console.log(test);
        })
        
    } catch(err){
      this.publicFunctions.catchError(err);
    }
  }

}
