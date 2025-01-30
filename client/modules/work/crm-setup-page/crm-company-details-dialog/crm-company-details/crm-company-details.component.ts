import { Component, Input, OnInit } from "@angular/core";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

@Component({
  selector: "app-crm-company-details",
  templateUrl: "./crm-company-details.component.html",
  styleUrls: ["./crm-company-details.component.scss"],
})
export class CRMCompanyDetailsComponent {
  @Input() companyData;
  @Input() crmCompanyCustomFields;

  constructor(public utilityService: UtilityService) {}

  getCompanyCustomField(fieldName: string) {
    const index = this.crmCompanyCustomFields
      ? this.crmCompanyCustomFields.findIndex((f: any) => f.name === fieldName)
      : -1;
    return index >= 0 ? this.crmCompanyCustomFields[index] : null;
  }
}
