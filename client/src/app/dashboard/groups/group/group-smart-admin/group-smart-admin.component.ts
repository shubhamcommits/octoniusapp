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
    this.rules = ['Email domain'];
  }
  
  /**
   * Event handler for smart group rule
   * changes.
   * 
   * @param rule The new rule.
   */
  onRuleChange(): void {
    if (this.rule[0] === 'Email domain') {
      // populate the current workplace's email domains
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
    }
  }

  /**
   * Executed whenever a rule is deselected.
   */
  clearConditions(): void {
    this.conditions = [];
  }

}
