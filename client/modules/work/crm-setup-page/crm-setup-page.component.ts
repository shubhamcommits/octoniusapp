import {
  Component,
  OnInit,
  OnDestroy,
  Injector,
  ViewChild,
  AfterContentChecked,
} from "@angular/core";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { SubSink } from "subsink";
import { PublicFunctions } from "modules/public.functions";
import { Sort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

import { NewCRMContactDialogComponent } from "./new-crm-contact-dialog/new-crm-contact-dialog.component";
import { NewCRMCompanyDialogComponent } from "./new-crm-company-dialog/new-crm-company-dialog.component";
import { NewCRMProductDialogComponent } from "./new-crm-product-dialog/new-crm-product-dialog.component";
import { CRMService } from "src/shared/services/crm-service/crm.service";
import { CRMCompanyDetailsDialogComponent } from "./crm-company-details-dialog/crm-company-details-dialog.component";

@Component({
  selector: "app-crm-setup-page",
  templateUrl: "./crm-setup-page.component.html",
  styleUrls: ["./crm-setup-page.component.scss"],
})
export class CRMSetupPageComponent
  implements OnInit, OnDestroy, AfterContentChecked
{
  @ViewChild("companyPaginator") companyPaginator: MatPaginator;
  @ViewChild("contactPaginator") contactPaginator: MatPaginator;
  @ViewChild("productPaginator") productPaginator: MatPaginator;

  contacts = [];
  companies = [];
  products = [];

  isAdmin = false;

  userData: any;
  workspaceData: any;

  ///////// CONTACT TABLE STARTS /////////
  sortedContacts = new MatTableDataSource<any>([]);
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

  ///////// COMPANY TABLE STARTS /////////
  sortedCompanyData = new MatTableDataSource<any>([]);
  displayedCompanyColumns: string[] = [
    //'image',
    "name",
    //"description",
    "contacts",
    "tasks",
    // "assignee",
    "star",
  ];
  crmCompanyCustomFieldsToShow = [];

  newCompanyColumnSelected;
  crmCompanyCustomFields = [];
  ///////// COMPANY TABLE STARTS /////////

  ///////// PRODUCT TABLE STARTS /////////
  sortedProductData = new MatTableDataSource<any>([]);
  displayedProductColumns: string[] = ["name", "description", "star"];
  crmProductCustomFieldsToShow = [];

  newProductColumnSelected;
  crmProductCustomFields = [];
  ///////// PRODUCT TABLE STARTS /////////

  searchPlaceHolder: string = $localize`:@@crmCompanyList.searchCompany:Search company`;

  // IsLoading behaviou subject maintains the state for loading spinner
  isLoading$;

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private crmService: CRMService,
    public dialog: MatDialog,
    private injector: Injector
  ) {
    this.sortedCompanyData.filterPredicate = (data, filter) => {
      return data.name.toLowerCase().includes(filter);
    };

    this.subSink.add(
      this.crmService.currentCrmData.subscribe(() => {
        this.ngOnInit();
      })
    );
  }

  async ngOnInit() {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: "work",
    });

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.isAdmin = this.isAdminUser();    

    await this.crmService.getCRMInformation().then((res) => {
      this.contacts = res["contacts"];
      this.companies = res["companies"];
      this.products = res["products"];
      this.crmContactCustomFields = res["crm_custom_fields"]?.filter(
        (cf) => cf.type == "contact"
      );
      this.crmCompanyCustomFields = res["crm_custom_fields"]?.filter(
        (cf) => cf.type == "company"
      );
      this.crmProductCustomFields = res["crm_custom_fields"]?.filter(
        (cf) => cf.type == "product"
      );
    });

    await this.initContactTable();
    await this.initCompanyTable();
    await this.initProductTable();

    // End the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  ngAfterViewInit() {
    this.sortedCompanyData.paginator = this.companyPaginator;
    this.sortedContacts.paginator = this.contactPaginator;
    this.sortedProductData.paginator = this.productPaginator;
  }

  ngAfterContentChecked() {
    this.subSink.add(
      this.utilityService.isLoadingSpinner.subscribe((res) => {
        this.isLoading$ = res;
      })
    );
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.sortedCompanyData.filter = filterValue.trim().toLowerCase();
  }

  async initContactTable() {
    await this.loadContactCustomFieldsToShow();

    this.contacts = [...this.contacts];

    this.sortedContacts.data = this.contacts.slice();
  }

  async initCompanyTable() {
    await this.loadCompanyCustomFieldsToShow();

    this.companies = [...this.companies];

    this.companies.forEach((company) => {
      company.numPendingTasks = !!company.tasks
        ? company.tasks.filter((task) => !task.completed)?.length || 0
        : 0;

      company.numContacts = !!this.contacts
        ? this.contacts.filter(
            (contact) =>
              (contact?._company?._id || contact?._company) == company?._id
          )?.length || 0
        : 0;
    });

    this.sortedCompanyData.data = this.companies.slice();

    // this.sortedCompanyData.data.forEach((company) => {
    //   let assignee_ids = [];
    //   company.tasks.forEach((task) => {
    //     task._assigned_to.forEach((assignee) => {
    //       if (assignee_ids.indexOf(assignee) === -1)
    //         assignee_ids.push(assignee);
    //     });
    //   });
    //   company['numAssignees'] = assignee_ids.length;
    //   if (assignee_ids.indexOf(this.userData._id) === -1) {
    //     this.workspaceData.members.every(member => {
    //       if (assignee_ids.indexOf(member._id) > -1)
    //         return company['assignee_pic'] = member.profile_pic;
    //     });
    //   } else {
    //     company['assignee_pic'] = this.userData.profile_pic;
    //   }
    // });
  }

  async initProductTable() {
    await this.loadProductCustomFieldsToShow();

    this.products = [...this.products];

    this.sortedProductData.data = this.products.slice();
  }

  getContactCustomField(fieldName: string) {
    const index = this.crmContactCustomFields
      ? this.crmContactCustomFields.findIndex((f: any) => f.name === fieldName)
      : -1;
    return index >= 0 ? this.crmContactCustomFields[index] : null;
  }

  getCompanyCustomField(fieldName: string) {
    const index = this.crmCompanyCustomFields
      ? this.crmCompanyCustomFields.findIndex((f: any) => f.name === fieldName)
      : -1;
    return index >= 0 ? this.crmCompanyCustomFields[index] : null;
  }

  getProductCustomField(fieldName: string) {
    const index = this.crmProductCustomFields
      ? this.crmProductCustomFields.findIndex((f: any) => f.name === fieldName)
      : -1;
    return index >= 0 ? this.crmProductCustomFields[index] : null;
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

  loadCompanyCustomFieldsToShow() {
    if (
      !!this.workspaceData &&
      !!this.workspaceData.crm_custom_fields_to_show
    ) {
      if (!this.crmCompanyCustomFieldsToShow) {
        this.crmCompanyCustomFieldsToShow = [];
      }

      this.workspaceData.crm_custom_fields_to_show.forEach((field) => {
        const cf = this.getCompanyCustomField(field);
        const indexCRMCFToShow = !!this.crmCompanyCustomFieldsToShow
          ? this.crmCompanyCustomFieldsToShow.findIndex(
              (cf) => cf.name === field
            )
          : -1;
        // Push the Column
        if (cf && indexCRMCFToShow < 0 && cf.type == "company") {
          this.crmCompanyCustomFieldsToShow.push(cf);

          if (this.displayedCompanyColumns.length - 1 >= 0) {
            const indexDisplayedColumns = !!this.displayedCompanyColumns
              ? this.displayedCompanyColumns.findIndex(
                  (col) => col === field.name
                )
              : -1;
            if (indexDisplayedColumns < 0) {
              this.displayedCompanyColumns.splice(
                this.displayedCompanyColumns.length - 1,
                0,
                field
              );
            }
          }
        }
      });
    }
  }

  loadProductCustomFieldsToShow() {
    if (
      !!this.workspaceData &&
      !!this.workspaceData.crm_custom_fields_to_show
    ) {
      if (!this.crmProductCustomFieldsToShow) {
        this.crmProductCustomFieldsToShow = [];
      }

      this.workspaceData.crm_custom_fields_to_show.forEach((field) => {
        const cf = this.getProductCustomField(field);
        const indexCRMCFToShow = !!this.crmProductCustomFieldsToShow
          ? this.crmProductCustomFieldsToShow.findIndex(
              (cf) => cf.name === field
            )
          : -1;
        // Push the Column
        if (cf && indexCRMCFToShow < 0 && cf.type == "product") {
          this.crmProductCustomFieldsToShow.push(cf);

          if (this.displayedProductColumns.length - 1 >= 0) {
            const indexDisplayedColumns = !!this.displayedProductColumns
              ? this.displayedProductColumns.findIndex(
                  (col) => col === field.name
                )
              : -1;
            if (indexDisplayedColumns < 0) {
              this.displayedProductColumns.splice(
                this.displayedProductColumns.length - 1,
                0,
                field
              );
            }
          }
        }
      });
    }
  }

  sortContactData(sort: Sort) {
    const direction = sort.direction;
    let property = sort.active;
    let directionValue = direction == "asc" ? 1 : -1;

    const data = this.contacts.slice();
    if (!property || direction === "") {
      this.sortedContacts.data = data;
      return;
    }

    this.sortedContacts.data = data.sort((a, b) => {
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

  sortCompanyData(sort: Sort) {
    const direction = sort.direction;
    let property = sort.active;
    let directionValue = direction == "asc" ? 1 : -1;

    const data = this.companies.slice();
    if (!property || direction === "") {
      this.sortedCompanyData.data = data;
      return;
    }

    this.sortedCompanyData.data = data.sort((a, b) => {
      switch (property) {
        case "name":
        case "description":
          return this.utilityService.compare(
            a[property],
            b[property],
            directionValue
          );
        default:
          const index = this.crmCompanyCustomFields
            ? this.crmCompanyCustomFields.findIndex(
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

  sortProductData(sort: Sort) {
    const direction = sort.direction;
    let property = sort.active;
    let directionValue = direction == "asc" ? 1 : -1;

    const data = this.companies.slice();
    if (!property || direction === "") {
      this.sortedProductData.data = data;
      return;
    }

    this.sortedProductData.data = data.sort((a, b) => {
      switch (property) {
        case "name":
        case "description":
          return this.utilityService.compare(
            a[property],
            b[property],
            directionValue
          );
        default:
          const index = this.crmProductCustomFields
            ? this.crmProductCustomFields.findIndex(
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
      });

    const contactCreatedSubs =
      dialogRef.componentInstance.contactCreated.subscribe(async (data) => {
        if (!this.contacts) {
          this.contacts = [];
        }

        this.contacts.unshift(data);

        await this.initContactTable();
      });

    dialogRef.afterClosed().subscribe(async (result) => {
      contactEditedSubs.unsubscribe();
      contactCreatedSubs.unsubscribe();
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
        $localize`:@@crmContactList.sectionAlreadyExists:Section already exists!`
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

  addNewCompanyColumn($event: Event) {
    // Find the index of the column to check if the same named column exist or not
    const index = this.crmCompanyCustomFieldsToShow.findIndex(
      (f: any) =>
        f.name.toLowerCase() ===
        this.newCompanyColumnSelected.name.toLowerCase()
    );

    // If index is found, then throw error notification
    if (index !== -1) {
      this.utilityService.warningNotification(
        $localize`:@@crmCompanyList.sectionAlreadyExists:Section already exists!`
      );
    } else {
      // If not found, then push the element
      // Create the group
      if (!this.workspaceData.crm_custom_fields_to_show) {
        this.workspaceData.crm_custom_fields_to_show = [];
      }

      this.workspaceData.crm_custom_fields_to_show.push(
        this.newCompanyColumnSelected.name
      );
      this.crmCompanyCustomFieldsToShow.push(
        this.getCompanyCustomField(this.newCompanyColumnSelected.name)
      );
      if (this.displayedCompanyColumns.length - 1 >= 0) {
        this.displayedCompanyColumns.splice(
          this.displayedCompanyColumns.length - 1,
          0,
          this.newCompanyColumnSelected.name
        );
      }

      this.newCompanyColumnSelected = null;

      this.crmService
        .saveCRMCustomFieldsToShow(this.workspaceData.crm_custom_fields_to_show)
        .then((res) => {
          this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
        });
    }
  }

  removeCompanyColumn(field: any) {
    let index: number = this.crmCompanyCustomFieldsToShow.findIndex(
      (cf) => cf.name === field
    );
    if (index !== -1) {
      this.crmCompanyCustomFieldsToShow.splice(index, 1);
    }

    index = this.displayedCompanyColumns.indexOf(field.name);
    if (index !== -1) {
      this.displayedCompanyColumns.splice(index, 1);
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

  addNewProductColumn($event: Event) {
    // Find the index of the column to check if the same named column exist or not
    const index = this.crmProductCustomFieldsToShow.findIndex(
      (f: any) =>
        f.name.toLowerCase() ===
        this.newProductColumnSelected.name.toLowerCase()
    );

    // If index is found, then throw error notification
    if (index !== -1) {
      this.utilityService.warningNotification(
        $localize`:@@crmCompanyList.sectionAlreadyExists:Section already exists!`
      );
    } else {
      // If not found, then push the element
      // Create the group
      if (!this.workspaceData.crm_custom_fields_to_show) {
        this.workspaceData.crm_custom_fields_to_show = [];
      }

      this.workspaceData.crm_custom_fields_to_show.push(
        this.newProductColumnSelected.name
      );
      this.crmProductCustomFieldsToShow.push(
        this.getProductCustomField(this.newProductColumnSelected.name)
      );
      if (this.displayedProductColumns.length - 1 >= 0) {
        this.displayedProductColumns.splice(
          this.displayedProductColumns.length - 1,
          0,
          this.newProductColumnSelected.name
        );
      }

      this.newProductColumnSelected = null;

      this.crmService
        .saveCRMCustomFieldsToShow(this.workspaceData.crm_custom_fields_to_show)
        .then((res) => {
          this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
        });
    }
  }

  removeProductColumn(field: any) {
    let index: number = this.crmProductCustomFieldsToShow.findIndex(
      (cf) => cf.name === field
    );
    if (index !== -1) {
      this.crmProductCustomFieldsToShow.splice(index, 1);
    }

    index = this.displayedProductColumns.indexOf(field.name);
    if (index !== -1) {
      this.displayedProductColumns.splice(index, 1);
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

  deleteContact(contactId: string) {
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@crmContactList.areYouSure:Are you sure?`,
        $localize`:@@crmContactList.removeContact:By doing this, you will delete the selected contact!`
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
            }
          });
        }
      });
  }

  openCompanyDialog(companyId?: string) {
    const dialogRef = this.dialog.open(NewCRMCompanyDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      data: {
        companyId: companyId,
      },
    });

    const companyEditedSubs =
      dialogRef.componentInstance.companyEdited.subscribe(async (data) => {
        const index = this.companies
          ? this.companies.findIndex((c) => c._id == data._id)
          : -1;
        if (index >= 0) {
          this.companies[index] = data;
        }

        await this.initCompanyTable();
      });

    const companyCreatedSubs =
      dialogRef.componentInstance.companyCreated.subscribe(async (data) => {
        if (!this.companies) {
          this.companies = [];
        }

        this.companies.unshift(data);

        await this.initCompanyTable();
      });

    dialogRef.afterClosed().subscribe(async (result) => {
      companyEditedSubs.unsubscribe();
      companyCreatedSubs.unsubscribe();
    });
  }

  openCompanyDetailsDialog(companyId?: string) {
    const dialogRef = this.dialog.open(CRMCompanyDetailsDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      minWidth: "100%",
      width: "100%",
      minHeight: "100%",
      height: "100%",
      data: {
        companyId: companyId,
        crmCompanyCustomFields: this.crmCompanyCustomFields,
        crmContactCustomFields: this.crmContactCustomFields,
        contacts: this.contacts.filter(
          (c) => companyId == (c?._company?._id || c?._company)
        ),
      },
    });
  }

  deleteCompany(companyId: string) {
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@crmCompanyList.areYouSure:Are you sure?`,
        $localize`:@@crmCompanyList.removeCompany:By doing this, you will delete the selected company!`
      )
      .then((res) => {
        if (res.value) {
          this.crmService.removeCRMCompany(companyId).then(async (res) => {
            const index = this.companies
              ? this.companies.findIndex((c) => c._id == companyId)
              : -1;
            if (index >= 0) {
              this.companies.splice(index, 1);
              await this.initCompanyTable();
            }
          });
        }
      });
  }

  openProductDialog(productId?: string) {
    const dialogRef = this.dialog.open(NewCRMProductDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: "50%",
      data: {
        productId: productId,
      },
    });

    const productEditedSubs =
      dialogRef.componentInstance.productEdited.subscribe(async (data) => {
        const index = this.products
          ? this.products.findIndex((p) => p._id == data._id)
          : -1;
        if (index >= 0) {
          this.products[index] = data;
        }

        await this.initProductTable();
      });

    const productCreatedSubs =
      dialogRef.componentInstance.productCreated.subscribe(async (data) => {
        if (!this.products) {
          this.products = [];
        }

        this.products.unshift(data);

        await this.initProductTable();
      });

    dialogRef.afterClosed().subscribe(async (result) => {
      productEditedSubs.unsubscribe();
      productCreatedSubs.unsubscribe();
    });
  }

  deleteProduct(productId: string) {
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@crmCompanyList.areYouSure:Are you sure?`,
        $localize`:@@crmCompanyList.removeProduct:By doing this, you will delete the selected product!`
      )
      .then((res) => {
        if (res.value) {
          this.crmService.removeCRMProduct(productId).then(async (res) => {
            const index = this.products
              ? this.products.findIndex((p) => p._id == productId)
              : -1;
            if (index >= 0) {
              this.products.splice(index, 1);

              await this.initProductTable();
            }
          });
        }
      });
  }

  isAdminUser() {
    return ["owner", "admin", "manager"].includes(this.userData.role);
  }
}
