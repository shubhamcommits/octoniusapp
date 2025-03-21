import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { NewCRMContactDialogComponent } from "../../new-crm-contact-dialog/new-crm-contact-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { PublicFunctions } from "modules/public.functions";
import { CRMService } from "src/shared/services/crm-service/crm.service";
import { Sort } from "@angular/material/sort";

@Component({
  selector: "app-crm-company-contacts",
  templateUrl: "./crm-company-contacts.component.html",
  styleUrls: ["./crm-company-contacts.component.scss"],
})
export class CRMCompanyContactsComponent implements OnInit {
  @Input() companyData;
  @Input() contacts;

  userData;
  workspaceData;

  isAdmin = false;

  ///////// CONTACT TABLE STARTS /////////
  sortedContacts;
  displayedContactsColumns: string[] = [
    "name",
    "company",
    "position",
    "phone",
    "email",
    "link",
    "star",
  ];
  crmContactsCustomFieldsToShow = [];

  newContactColumnSelected;
  crmContactCustomFields = [];
  ///////// CONTACT TABLE ENDS /////////

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private crmService: CRMService,
    public dialog: MatDialog,
    private injector: Injector
  ) {}

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.initContactTable();

    this.isAdmin = this.isAdminUser();
  }

  async initContactTable() {
    await this.loadContactCustomFieldsToShow();

    this.contacts = [...this.contacts];

    this.sortedContacts = this.contacts.slice();
  }

  loadContactCustomFieldsToShow() {
    if (
      !!this.workspaceData &&
      !!this.workspaceData.crm_custom_fields_to_show
    ) {
      if (!this.crmContactsCustomFieldsToShow) {
        this.crmContactsCustomFieldsToShow = [];
      }

      this.workspaceData.crm_custom_fields_to_show.forEach((field) => {
        const cf = this.getContactCustomField(field);
        const indexCRMCFToShow = !!this.crmContactsCustomFieldsToShow
          ? this.crmContactsCustomFieldsToShow.findIndex(
              (cf) => cf.name === field
            )
          : -1;
        // Push the Column
        if (cf && indexCRMCFToShow < 0 && cf.type == "contact") {
          this.crmContactsCustomFieldsToShow.push(cf);

          if (this.displayedContactsColumns.length - 1 >= 0) {
            const indexDisplayedColumns = !!this.displayedContactsColumns
              ? this.displayedContactsColumns.findIndex(
                  (col) => col === field.name
                )
              : -1;
            if (indexDisplayedColumns < 0) {
              this.displayedContactsColumns.splice(
                this.displayedContactsColumns.length - 1,
                0,
                field
              );
            }
          }
        }
      });
    }
  }

  getContactCustomField(fieldName: string) {
    const index = this.crmContactCustomFields
      ? this.crmContactCustomFields.findIndex((f: any) => f.name === fieldName)
      : -1;
    return index >= 0 ? this.crmContactCustomFields[index] : null;
  }

  deleteContact(contactId: string) {
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@crmCompanyContacts.areYouSure:Are you sure?`,
        $localize`:@@crmCompanyContacts.removeContact:By doing this, you will delete the selected contact!`
      )
      .then((res) => {
        if (res.value) {
          this.crmService.removeCRMContact(contactId).then(async (res) => {
            const index = this.contacts
              ? this.contacts.findIndex((c) => c._id == contactId)
              : -1;
            if (index >= 0) {
              this.contacts.splice(index, 1);

              await this.initContactTable();

              this.crmService.updateCrmData();
            }
          });
        }
      });
  }

  addNewContactColumn($event: Event) {
    // Find the index of the column to check if the same named column exist or not
    const index = this.crmContactsCustomFieldsToShow.findIndex(
      (f: any) =>
        f.name.toLowerCase() ===
        this.newContactColumnSelected.name.toLowerCase()
    );

    // If index is found, then throw error notification
    if (index !== -1) {
      this.utilityService.warningNotification(
        $localize`:@@crmCompanyContacts.sectionAlreadyExists:Section already exists!`
      );
    } else {
      // If not found, then push the element
      // Create the group
      if (!this.workspaceData.crm_custom_fields_to_show) {
        this.workspaceData.crm_custom_fields_to_show = [];
      }

      this.workspaceData.crm_custom_fields_to_show.push(
        this.newContactColumnSelected.name
      );
      this.crmContactsCustomFieldsToShow.push(
        this.getContactCustomField(this.newContactColumnSelected.name)
      );
      if (this.displayedContactsColumns.length - 1 >= 0) {
        this.displayedContactsColumns.splice(
          this.displayedContactsColumns.length - 1,
          0,
          this.newContactColumnSelected.name
        );
      }

      this.newContactColumnSelected = null;

      this.crmService
        .saveCRMCustomFieldsToShow(this.workspaceData.crm_custom_fields_to_show)
        .then((res) => {
          this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
        });
    }
  }

  removeContactColumn(field: any) {
    let index: number = this.crmContactsCustomFieldsToShow.findIndex(
      (cf) => cf.name === field
    );
    if (index !== -1) {
      this.crmContactsCustomFieldsToShow.splice(index, 1);
    }

    index = this.displayedContactsColumns.indexOf(field.name);
    if (index !== -1) {
      this.displayedContactsColumns.splice(index, 1);
    }

    index = this.workspaceData.crm_custom_fields_to_show.indexOf(field.name);
    if (index !== -1) {
      this.workspaceData.crm_custom_fields_to_show.splice(index, 1);
    }

    this.crmService
      .saveCRMCustomFieldsToShow(this.workspaceData.crm_custom_fields_to_show)
      .then((res) => {
        this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
      });
  }

  sortContactData(sort: Sort) {
    const direction = sort.direction;
    let property = sort.active;
    let directionValue = direction == "asc" ? 1 : -1;

    const data = this.contacts.slice();
    if (!property || direction === "") {
      this.sortedContacts = data;
      return;
    }

    this.sortedContacts = data.sort((a, b) => {
      switch (property) {
        case "company":
          return this.utilityService.compare(
            a?._company.name,
            b?._company.name,
            directionValue
          );

        case "phone":
        case "email":
        case "link":
          property += "s";
          return this.utilityService.compare(
            a[property][0],
            b[property][0],
            directionValue
          );
        default:
          const index = this.crmContactCustomFields
            ? this.crmContactCustomFields.findIndex(
                (f: any) => f.name === property
              )
            : -1;
          return index < 0
            ? this.utilityService.compare(
                a[property],
                b[property],
                directionValue
              )
            : this.utilityService.compare(
                a.crm_custom_fields[property],
                b.crm_custom_fields[property],
                directionValue
              );
      }
    });
  }

  openContactDialog(contactId?: string) {
    const dialogRef = this.dialog.open(NewCRMContactDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "75%",
      height: "85%",
      data: {
        contactId: contactId,
        companyData: this.companyData,
      },
    });

    const contactEditedSubs =
      dialogRef.componentInstance.contactEdited.subscribe(async (data) => {
        const index = this.contacts
          ? this.contacts.findIndex((c) => c._id == data._id)
          : -1;
        if (index >= 0) {
          this.contacts[index] = data;
        }

        await this.initContactTable();
        this.crmService.updateCrmData();
      });

    const contactCreatedSubs =
      dialogRef.componentInstance.contactCreated.subscribe(async (data) => {
        if (!this.contacts) {
          this.contacts = [];
        }

        this.contacts.unshift(data);
        
        await this.initContactTable();
        this.crmService.updateCrmData();
      });

    dialogRef.afterClosed().subscribe(async (result) => {
      contactEditedSubs.unsubscribe();
      contactCreatedSubs.unsubscribe();
    });
  }

  isAdminUser() {
    // const index = this.workspaceData._admins.findIndex((admin: any) => admin._id === this.userData._id);
    // return index >= 0;
    return ["owner", "admin", "manager"].includes(this.userData.role);
  }
}
