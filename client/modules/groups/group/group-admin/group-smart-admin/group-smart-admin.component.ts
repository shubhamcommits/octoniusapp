import { Component, OnInit, Injector} from '@angular/core';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-smart-admin',
  templateUrl: './group-smart-admin.component.html',
  styleUrls: ['./group-smart-admin.component.scss']
})
export class GroupSmartAdminComponent implements OnInit {

  // The currently selected rule and condition
  rule: string;
  condition: any;

  // Conditions populated from the DB for the dropdown
  conditions: string[];

  rules: string[];

  currentSettings: any;

  group: any;

  customFields = [];
  selectedCustomField;
  cfName = '';
  cfValue = '';

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private workspaceService: WorkspaceService,
    private groupService: GroupService,
    private utilityService: UtilityService) {}

  async ngOnInit() {
    this.rule = '';
    this.condition = '';
    this.conditions = [];
    this.rules = ['Email domain', 'Job position', 'Skills', 'Custom Fields'];
    this.currentSettings = {
      emailDomains: [],
      jobPositions: [],
      skills: [],
      customFields: []
    };

    // Fetch current group from the service
    this.group = await this.publicFunctions.getCurrentGroup();

    this.getCurrentSettings();

    this.workspaceService.getProfileCustomFields(this.group._workspace).then((res) => {
      if (res['workspace']['profile_custom_fields']) {
        res['workspace']['profile_custom_fields'].forEach(field => {
          this.customFields.push(field);
        });
      }
    });
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
    if (input.length > 0) {
      if (this.rule === 'Email domain') {
        // populate the current workspace's email domains
        this.workspaceService
          .getUniqueEmailDomains(this.group._workspace, input)
          .subscribe(
            ({ domains }) => {
              this.conditions = domains;
            },
            error => {
              console.error('Could not fetch email domains!');
              console.error(error);
            }
          );
      } else if (this.rule === 'Job position') {
        // populate the current workspace's job positions
        this.workspaceService
          .getUniqueJobPositions(this.group._workspace, input)
          .subscribe(
            ({ positions }) => this.conditions = positions,
            error => {
              console.error('Could not fetch job positions!');
              console.error(error);
            }
          );
      } else if (this.rule === 'Skills') {
        // populate the current workspace's skills
        this.workspaceService
          .getUniqueSkills(this.group._workspace, input)
          .subscribe(
            ({ skills }) => this.conditions = skills,
            error => {
              console.error('Could not fetch skills!');
              console.error(error);
            }
          );
      }
    }
  }

  /**
   * Event handler that executes whenever a new
   * rule is added.
   */
  onAddNewRule(): void {
    if (this.rule === '' || this.condition === '') {
      this.utilityService.infoNotification('Conditions must be selected.');
      return;
    }

    let data;

    if (this.rule === 'Email domain') {
      if (this.currentSettings.emailDomains.includes(this.condition)) {
        this.utilityService.infoNotification('That domain has already been added.');
        return;
      };

      // Update UI
      this.currentSettings.emailDomains.push(this.condition);

      // Setup payload for DB
      data = { type: 'email_domain', payload: this.condition };
    } else if (this.rule === 'Job position') {
      if (this.currentSettings.jobPositions.includes(this.condition)) {
        this.utilityService.infoNotification('That position has already been added.');
        return;
      };

      // Update UI
      this.currentSettings.jobPositions.push(this.condition);

      // Setup payload for DB
      data = { type: 'job_position', payload: this.condition };
    } else if (this.rule === 'Skills') {
      if (this.currentSettings.skills.includes(this.condition)) {
        this.utilityService.infoNotification('That skill has already been added.');
        return;
      };

      // Update UI
      this.currentSettings.skills.push(this.condition);

      // Setup payload for DB
      data = { type: 'skills', payload: this.condition };
    } else if (this.rule === 'Custom Fields') {
      const index = this.currentSettings.customFields.findIndex(cf => cf.name == this.condition.name);
      if (index >= 0) {
        this.utilityService.infoNotification('That field has already been added.');
        return;
      };

      // Update UI
      this.currentSettings.customFields.push(this.condition);

      // Setup payload for DB
      data = { type: 'custom_fields', payload: this.condition };
    }

    // Update DB
    this.groupService.updateSmartGroupRules(data, this.group._id).subscribe(
      res => {
        this.utilityService.successNotification('The rule has been successfully added!');
        this.rule = '';
        this.condition = '';
        this.conditions = [];
        this.autoAdd();
      },
      error => {
        this.utilityService.errorNotification('An error occurred whilst adding the rule.');
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
    this.groupService.getSmartGroupSettings(this.group._id).subscribe(
      res => {
        this.currentSettings.emailDomains = res.domains;
        this.currentSettings.jobPositions = res.positions;
        this.currentSettings.skills = res.skills;
        this.currentSettings.customFields = res.custom_fields;
      },
      error => {
        this.utilityService.errorNotification('An error occurred whilst fetching existing smart group settings.');
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
  onDeleteRule(rule: string, customFieldId?: string): void {
    this.groupService.deleteSmartGroupRule(this.group._id, rule, customFieldId).subscribe(
      res => {
        this.utilityService.successNotification('The rule has been successfully deleted!');

        // Update UI
        if (rule === 'email_domains') {
          this.currentSettings.emailDomains = [];
        } else if (rule === 'job_positions') {
          this.currentSettings.jobPositions = [];
        } else if (rule === 'skills') {
          this.currentSettings.skills = [];
        }else if (rule === 'custom_field') {
          const index = this.currentSettings.customFields.findIndex(cf => cf.name = this.cfName);
          this.currentSettings.customFields.splice(index, 1);
        }

        this.autoAdd();
      },
      error => {
        this.utilityService.errorNotification('An error occurred whilst deleting the rule.');
        console.error('Could not delete rule!');
        console.error(error);
      }
    );
  }

  customFieldSelected(cfName: string) {
    const index = this.customFields.findIndex(cf => cf.name == this.cfName);
    this.selectedCustomField = this.customFields[index];
  }

  customFieldValueSelected(cfValue: string) {
    this.condition = {
      name: this.cfName,
      value: this.cfValue
    };

    //this.onAddNewRule();
  }

  /**
   * Executes whenever a rule is added or deleted.
   * Responsible for automatically adding or removing
   * group members.
   */
  autoAdd(): void {
    const data = {
      workspaceId: this.group._workspace
    };
    this.groupService.updateSmartGroupMembers(
      this.group._id,
      data
    ).subscribe(
      res =>
      error => {
        this.utilityService.errorNotification('An error occurred whilst modifying the members of the group.');
        console.error('Could not auto add members!');
        console.error(error);
      }
    );
  }
}
