import { Component, OnInit, Input} from '@angular/core';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { WorkspaceService } from '../../../../shared/services/workspace.service';
import { SnotifyService } from 'ng-snotify';

@Component({
  selector: 'group-smart-admin',
  templateUrl: './group-smart-admin.component.html',
  styleUrls: ['./group-smart-admin.component.scss']
})
export class GroupSmartAdminComponent implements OnInit {
  @Input() group;
  rule: string;

  conditions: string[];
  rules: string[];

  selectedItems: string[];

  constructor(private groupDataService: GroupDataService, private workspaceService: WorkspaceService,
    private snotifyService: SnotifyService) { }

  ngOnInit() {
    this.rule = '';
    this.conditions = [];
    this.selectedItems = [];
    this.rules = ['Email domain', 'Job position', 'Skills'];
  }
  
  /**
   * Event handler for smart group rule
   * changes.
   * 
   * @param rule The new rule.
   */
  onRuleChange(): void {
    if (this.rule[0] === 'Email domain') {
      // populate the current workspace's email domains
      this.workspaceService
        .getUniqueEmailDomains(this.groupDataService.group._workspace)
        .subscribe(
          ({ domains }) => this.conditions = domains,
          error => {
            this.snotifyService.error('An error occurred whilst fetching email domains.');
            console.error('Could not fetch email domains!');
            console.error(error);
          }
        );
    } else if (this.rule[0] === 'Job position') {
      // populate the current workspace's job positions
      this.workspaceService
        .getUniqueJobPositions(this.groupDataService.group._workspace)
        .subscribe(
          ({ positions }) => this.conditions = positions,
          error => {
            this.snotifyService.error('An error occurred whilst fetching job positions.');
            console.error('Could not fetch job positions!');
            console.error(error);
          }
        );
    } else if (this.rule[0] === 'Skills') {
      // populate the current workspace's skills
      this.workspaceService
        .getUniqueSkills(this.groupDataService.group._workspace)
        .subscribe(
          ({ skills }) => this.conditions = skills,
          error => {
            this.snotifyService.error('An error occurred whilst fetching skills.');
            console.error('Could not fetch skills!');
            console.error(error);
          }
        );
    }
  }

  /**
   * Executed whenever a rule is deselected.
   */
  clearConditions(): void {
    this.conditions = [];
  }

}
