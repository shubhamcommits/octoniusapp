import { Component, OnInit, Input} from '@angular/core';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { WorkspaceService } from '../../../../shared/services/workspace.service';
import { SnotifyService } from 'ng-snotify';
import { GroupService } from '../../../../shared/services/group.service';

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

  currentSettings: object;

  constructor(private groupDataService: GroupDataService, private workspaceService: WorkspaceService,
    private snotifyService: SnotifyService, private groupService: GroupService) { }

  ngOnInit() {
    this.rule = '';
    this.conditions = [];
    this.selectedItems = [];
    this.rules = ['Email domain', 'Job position', 'Skills'];
    this.currentSettings = {
      emailDomains: [],
      jobPositions: [],
      skills: []
    };
    this.getCurrentSettings();
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

  /**
   * Event handler that executes whenever a new
   * rule is added.
   */
  onAddNewRule(): void {
    if (this.selectedItems.length === 0) {
      this.snotifyService.info('Conditions must be selected.');
      return;
    }

    if (this.rule[0] === 'Email domain') {
      // @ts-ignore
      if (this.currentSettings.emailDomains.includes(this.selectedItems[0])) {
        this.snotifyService.info('That domain has already been added.');
        return;
      };

      // First update UI
      // @ts-ignore
      this.selectedItems.map(domain => this.currentSettings.emailDomains.push(domain));

      // Now update DB
      const data = { type: 'email_domain', domains: this.selectedItems };
      this.groupService.updateSmartGroupRules(data, this.groupDataService.groupId).subscribe(
        res => this.snotifyService.success('The rule has been successfully added!'),
        error => {
          this.snotifyService.error('An error occurred whilst adding the rule.');
          console.error('Could not add new rule!');
          console.error(error);
        }
      );
    } else if (this.rule[0] === 'Job position') {
      // @ts-ignore
      if (this.currentSettings.jobPositions.includes(this.selectedItems[0])) {
        this.snotifyService.info('That position has already been added.');
        return;
      };

      // First update UI
      // @ts-ignore
      this.selectedItems.map(position => this.currentSettings.jobPositions.push(position));

      // Now update DB
      const data = { type: 'job_position', positions: this.selectedItems };
      this.groupService.updateSmartGroupRules(data, this.groupDataService.groupId).subscribe(
        res => this.snotifyService.success('The rule has been successfully added!'),
        error => {
          this.snotifyService.error('An error occurred whilst adding the rule.');
          console.error('Could not add new rule!');
          console.error(error);
        }
      );
    } else if (this.rule[0] === 'Skills') {
      // @ts-ignore
      if (this.currentSettings.skills.includes(this.selectedItems[0])) {
        this.snotifyService.info('That skill has already been added.');
        return;
      };

      // First update UI
      // @ts-ignore
      this.selectedItems.map(skill => this.currentSettings.skills.push(skill));

      // Now update DB
      const data = { type: 'skills', skills: this.selectedItems };
      this.groupService.updateSmartGroupRules(data, this.groupDataService.groupId).subscribe(
        res => this.snotifyService.success('The rule has been successfully added!'),
        error => {
          this.snotifyService.error('An error occurred whilst adding the rule.');
          console.error('Could not add new rule!');
          console.error(error);
        }
      );
    }
  }

  /**
   * Gets a smart group's current settings
   * on page load.
   */
  getCurrentSettings(): void {
    this.groupService.getSmartGroupSettings(this.groupDataService.groupId).subscribe(
      res => {
        // @ts-ignore
        this.currentSettings.emailDomains = res.domains;
        // @ts-ignore
        this.currentSettings.jobPositions = res.positions;
        // @ts-ignore
        this.currentSettings.skills = res.skills;
      },
      error => {
        this.snotifyService.error('An error occurred whilst fetching existing smart group settings.');
        console.error('Could not fetch existing rules!');
        console.error(error);
      }
    );
  }

}
