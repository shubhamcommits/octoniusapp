import { Component, Injector, Input, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Component({
  selector: 'app-recent-stories',
  templateUrl: './recent-stories.component.html',
  styleUrls: ['./recent-stories.component.scss']
})
export class RecentStoriesComponent implements OnInit {

  workspaceData;
  recentStories;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private loungeService: LoungeService
  ) { }

  async ngOnInit() {
    // Fetch current user details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    await this.loungeService.getRecentStories(this.workspaceData?._id).then(res => {
      this.recentStories = res['stories'];
    });
  }
}
