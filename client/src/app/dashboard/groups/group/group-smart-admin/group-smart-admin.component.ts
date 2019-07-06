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

  // The currently selected rule and condition
  rule: string;
  condition: string;

  // Conditions populated from the DB for the dropdown
  conditions: string[];

  rules: string[];


  currentSettings: object;

  constructor(private groupDataService: GroupDataService, private workspaceService: WorkspaceService,
    private snotifyService: SnotifyService, private groupService: GroupService) { }

  ngOnInit() {
    this.rule = '';
    this.condition = '';
    this.conditions = [];
    this.rules = ['Email domain', 'Job position', 'Skills'];
    this.currentSettings = {
      emailDomains: [],
      jobPositions: [],
      skills: []
    };
    this.getCurrentSettings();
  }

  /**
   * Event handler that executes every time a
   * new rule is selected.
   * 
   * @param rule The new rule.
   */
  onRuleSelect(rule: string): void {
    this.rule = rule;
  }

  /**
   * Event handler that executes every time a
   * new condition is selected.
   * 
   * @param condition The new condition.
   */
  onConditionSelect(condition: string): void {
    this.condition = condition;
  }

  /**
   * Retrieves conditions from the DB
   * based on whatever is entered by the user.
   * 
   * @param input The user's query.
   */
  search(input: string): void {
    if (this.rule === 'Email domain') {
      // populate the current workspace's email domains
      this.workspaceService
        .getUniqueEmailDomains(this.groupDataService.group._workspace, input)
        .subscribe(
          ({ domains }) => this.conditions = domains,
          error => {
            //this.snotifyService.error('An error occurred whilst fetching email domains.');
            console.error('Could not fetch email domains!');
            console.error(error);
          }
        );
    } else if (this.rule === 'Job position') {
      // populate the current workspace's job positions
      this.workspaceService
        .getUniqueJobPositions(this.groupDataService.group._workspace, input)
        .subscribe(
          ({ positions }) => this.conditions = positions,
          error => {
            //this.snotifyService.error('An error occurred whilst fetching job positions.');
            console.error('Could not fetch job positions!');
            console.error(error);
          }
        );
    } else if (this.rule === 'Skills') {
      // populate the current workspace's skills
      this.workspaceService
        .getUniqueSkills(this.groupDataService.group._workspace, input)
        .subscribe(
          ({ skills }) => this.conditions = skills,
          error => {
            //this.snotifyService.error('An error occurred whilst fetching skills.');
            console.error('Could not fetch skills!');
            console.error(error);
          }
        );
    }
  }

  /**
   * Event handler that executes whenever a new
   * rule is added.
   */
  onAddNewRule(): void {
    if (this.rule === '' || this.condition === '') {
      this.snotifyService.info('Conditions must be selected.');
      return;
    }

    if (this.rule === 'Email domain') {
      // @ts-ignore
      if (this.currentSettings.emailDomains.includes(this.condition)) {
        this.snotifyService.info('That domain has already been added.');
        return;
      };

      // Update UI
      // @ts-ignore
      this.currentSettings.emailDomains.push(this.condition);

      // Setup payload for DB
      var data = { type: 'email_domain', payload: this.condition };
    } else if (this.rule === 'Job position') {
      // @ts-ignore
      if (this.currentSettings.jobPositions.includes(this.condition)) {
        this.snotifyService.info('That position has already been added.');
        return;
      };

      // Update UI
      // @ts-ignore
      this.currentSettings.jobPositions.push(this.condition);

      // Setup payload for DB
      var data = { type: 'job_position', payload: this.condition };
    } else if (this.rule === 'Skills') {
      // @ts-ignore
      if (this.currentSettings.skills.includes(this.condition)) {
        this.snotifyService.info('That skill has already been added.');
        return;
      };

      // Update UI
      // @ts-ignore
      this.currentSettings.skills.push(this.condition);

      // Setup payload for DB
      var data = { type: 'skills', payload: this.condition };
    }

    // Update DB
    this.groupService.updateSmartGroupRules(data, this.groupDataService.groupId).subscribe(
      res => {
        this.snotifyService.success('The rule has been successfully added!');
        this.rule = '';
        this.condition = '';
        this.conditions = [];
        this.autoAdd();
      },
      error => {
        this.snotifyService.error('An error occurred whilst adding the rule.');
        console.error('Could not add new rule!');
        console.error(error);
      }
    );
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

  /**
   * Event handler that is executed when a rule is deleted.
   * 
   * @param rule The rule to delete.
   */
  onDeleteRule(rule: string): void {
    this.groupService.deleteSmartGroupRule(this.groupDataService.groupId, rule).subscribe(
      res => {
        this.snotifyService.success('The rule has been successfully deleted!');

        // Update UI
        if (rule === 'email_domains') {
          // @ts-ignore
          this.currentSettings.emailDomains = [];
        } else if (rule === 'job_positions') {
          // @ts-ignore
          this.currentSettings.jobPositions = [];
        } else if (rule === 'skills') {
          // @ts-ignore
          this.currentSettings.skills = [];
        }

        this.autoAdd();
      },
      error => {
        this.snotifyService.error('An error occurred whilst deleting the rule.');
        console.error('Could not delete rule!');
        console.error(error);
      }
    );
  }

  /**
   * Executes whenever a rule is added or deleted.
   * Responsible for automatically adding or removing
   * group members.
   */
  autoAdd(): void {
    const data = {
      workspaceId: this.groupDataService.group._workspace,
      currentSettings: this.currentSettings
    };
    this.groupService.updateSmartGroupMembers(
      this.groupDataService.groupId,
      data
    ).subscribe(
      res => //this.snotifyService.info('The members of the group have been successfully modified!'),
      error => {
        this.snotifyService.error('An error occurred whilst modifying the members of the group.');
        console.error('Could not auto add members!');
        console.error(error);
      }
    );
  }
}
