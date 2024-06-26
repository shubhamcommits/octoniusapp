import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ThemeService } from 'ng2-charts';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { SearchService } from 'src/shared/services/search-service/search.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-search-task-dialog',
  templateUrl: './search-task-dialog.component.html',
  styleUrls: ['./search-task-dialog.component.scss']
})
export class SearchTaskDialogComponent implements OnInit {

  @Output() taskSelectedEvent = new EventEmitter();

  userId;
  parentTaskId;

  userGroups = [];  
  
  postTitle: string = '';
  groupId;

  taskSearchResult = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    public utilityService: UtilityService,
    private searchService: SearchService,
    private postService: PostService,
    private mdDialogRef: MatDialogRef<SearchTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.userId = this.data.userId;
    this.parentTaskId = this.data.parentTaskId;
  }

  async ngOnInit() {
    this.publicFunctions.getAllUserGroups(this.userId)// using the userId because it is not needed in the endpoint.
      .then(async (groups: any) => {
        this.userGroups = groups.sort((g1, g2) => (g1.group_name.toLowerCase() > g2.group_name.toLowerCase()) ? 1 : -1);
      });
  }

  async search() {
    this.searchService.searchTasksForNS(this.postTitle, this.groupId).then((res: any) => {
        if (res.results.length > 0) {
          this.taskSearchResult = res.results;
        }
      });
  }

  selectTask(post) {
    this.postService.setParentTask(post?._id, this.parentTaskId).then(res => {
      this.taskSelectedEvent.emit(post);
      this.closeDialog();
    });
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
