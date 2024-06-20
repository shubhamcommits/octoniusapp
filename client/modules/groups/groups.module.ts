import { GroupsListComponent } from './groups-list/groups-list.component';
import { CreateGroupComponent } from './groups-list/create-group/create-group.component';
import { GroupComponent } from './group/group.component';
import { GroupMembersComponent } from './group/group-members/group-members.component';
import { GroupAdminComponent } from './group/group-admin/group-admin.component';
import { GroupActivityComponent } from './group/group-activity/group-activity.component';
import { DeleteGroupComponent } from './group/group-admin/delete-group/delete-group.component';
import { InviteUserComponent } from './group/group-admin/invite-user/invite-user.component';
import { GroupSmartAdminComponent } from './group/group-admin/group-smart-admin/group-smart-admin.component';
import { GroupRAGDialogComponent } from './group/group-admin/group-rag-dialog/group-rag-dialog.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupsRoutingModule } from './groups-routing.module';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { ResizableModule } from 'angular-resizable-element';
import {DatePipe} from '@angular/common';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { GroupDashboardComponent } from './group/group-dashboard/group-dashboard.component';
import { AutomationFlowsDialogComponent } from './group/automation-flows-dialog/automation-flows-dialog.component';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule as Calendar, DateAdapter } from 'angular-calendar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { GroupReportsComponent } from './group/group-reports/group-reports.component';
import { GroupSettingsComponent } from './group/group-admin/group-settings/group-settings.component';
import { GroupBackgroundImageDetailsComponent } from './group/group-admin/group-settings/group-background-image-details/group-background-image-details.component';
import { GroupsComponent } from './groups.component';
import { PortfolioDetailsComponent } from './portfolio/portfolio-details/portfolio-details.component';
import { CreatePortfolioComponent } from './portfolio/create-portfolio/create-portfolio.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { GroupSelectorDialogComponent } from './portfolio/group-selector-dialog/group-selector-dialog.component';
import { PortfolioGroupsListComponent } from './portfolio/portfolio-groups-list/portfolio-groups-list.component';
import { PortfolioMembersWorkloadCardComponent } from './portfolio/dashboard/portfolio-members-workload-card/portfolio-members-workload-card.component';
import { PortfolioProjectsPerformanceCardComponent } from './portfolio/dashboard/portfolio-projects-performance-card/portfolio-projects-performance-card.component';
import { PortfolioWorkStatisticsCardComponent } from './portfolio/dashboard/portfolio-work-statistics-card/portfolio-work-statistics-card.component';
import { PortfolioProjectStatisticsComponent } from './portfolio/dashboard/portfolio-projects-performance-card/portfolio-project-statistics/portfolio-project-statistics.component';
import { PortfolioProjectBudgetComponent } from './portfolio/dashboard/portfolio-projects-performance-card/portfolio-project-budget/portfolio-project-budget.component';
import { PortfolioHeaderComponent } from './portfolio/portfolio-header/portfolio-header.component';
import { PortfolioUserWorkloadDialogComponent } from './portfolio/portfolio-user-workload-dialog/portfolio-user-workload-dialog.component';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { CRMSetupBoardBarComponent } from './group/group-crm-setup-view/crm-setup-board-bar/crm-setup-board-bar.component';
import { GroupCRMSetupViewComponent } from './group/group-crm-setup-view/group-crm-setup-view.component';
import { NewCRMContactDialogComponent } from './group/group-crm-setup-view/new-crm-contact-dialog/new-crm-contact-dialog.component';
import { CRMContactInformationComponent } from './group/group-crm-setup-view/new-crm-contact-dialog/crm-contact-information/crm-contact-information.component';
import { CRMContactCompaniesComponent } from './group/group-crm-setup-view/new-crm-contact-dialog/crm-contact-companies/crm-contact-companies.component';
import { NewCRMCompanyDialogComponent } from './group/group-crm-setup-view/new-crm-company-dialog/new-crm-company-dialog.component';
import { CRMCompanyInformationComponent } from './group/group-crm-setup-view/new-crm-company-dialog/crm-company-information/crm-company-information.component';
import { CRMCustomFieldsDialogComponent } from './group/group-crm-setup-view/crm-custom-fields-dialog/crm-custom-fields-dialog.component';
import { CRMContactCustomFieldsComponent } from './group/group-crm-setup-view/new-crm-contact-dialog/crm-contact-custom-fields/crm-contact-custom-fields.component';
import { CreateGroupDialogComponent } from './groups-list/create-group-dialog/create-group-dialog.component';
import { CRMCompanyCustomFieldsComponent } from './group/group-crm-setup-view/new-crm-company-dialog/crm-company-custom-fields/crm-company-custom-fields.component';
import { CRMCompanyImageDialogComponent } from './group/group-crm-setup-view/new-crm-company-dialog/crm-company-image-dialog/crm-company-image-dialog.component';
import { CRMContactDialogComponent } from './group/group-crm-setup-view/crm-contact-dialog/crm-contact-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GroupResourceManagementComponent } from './group/group-resource-management/group-resource-management.component';
import { ResourcesBarComponent } from './group/group-resource-management/resources-bar/resources-bar.component';
import { NewCRMProductDialogComponent } from './group/group-crm-setup-view/new-crm-product-dialog/new-crm-product-dialog.component';
import { CRMProductCustomFieldsComponent } from './group/group-crm-setup-view/new-crm-product-dialog/crm-product-custom-fields/crm-product-custom-fields.component';
import { CRMProductInformationComponent } from './group/group-crm-setup-view/new-crm-product-dialog/crm-product-information/crm-product-information.component';
import { TableViewComponent } from './group/group-tasks-views/table-view/table-view.component';
import { CreateSectionComponent } from './group/group-tasks-views/create-section/create-section.component';
import { TasksTableComponent } from './group/group-tasks-views/table-view/tasks-table/tasks-table.component';
import { GroupResourceManagementBoardViewComponent } from './group/group-tasks-views/group-resource-management-board/group-resource-management-board-view.component';
import { AdvancedFilterDialogComponent } from './group/group-tasks-views/board-bar/advanced-filter-dialog/advanced-filter-dialog.component';
import { BoardBarComponent } from './group/group-tasks-views/board-bar/board-bar.component';
import { TimeTrackerDatesFilterDialogComponent } from './group/group-tasks-views/board-bar/time-tracker-dates-filter-dialog/time-tracker-dates-filter-dialog.component';
import { GroupCalendarViewComponent } from './group/group-tasks-views/group-calendar-view/group-calendar-view.component';
import { GroupTasksViewsComponent } from './group/group-tasks-views/group-tasks-views.component';
import { GroupTimeTrackingViewComponent } from './group/group-tasks-views/group-time-tracking-view/group-time-tracking-view.component';
import { KanbanArchivedSectionsComponent } from './group/group-tasks-views/kanban-archived-sections/kanban-archived-sections.component';
import { ColumnProjectSectionComponent } from './group/group-tasks-views/kanban-board/column-project-section/column-project-section.component';
import { EditColumnComponent } from './group/group-tasks-views/kanban-board/edit-column/edit-column.component';
import { KanbanBoardComponent } from './group/group-tasks-views/kanban-board/kanban-board.component';
import { KanbanTaskCardComponent } from './group/group-tasks-views/kanban-board/kanban-task-card/kanban-task-card.component';
import { CreateProjectColumnDialogComponent } from './group/group-tasks-views/kanban-board/section/create-project-column-dialog/create-project-column-dialog.component';
import { KanbanSectionComponent } from './group/group-tasks-views/kanban-board/section/kanban-section.component';
import { ShowCustomFieldsColumnDialogComponent } from './group/group-tasks-views/kanban-board/section/show-custom-fields-column-dialog/show-custom-fields-column-dialog.component';
import { TableSectionComponent } from './group/group-tasks-views/table-view/section/table-section.component';
import { TimelineViewComponent } from './group/group-tasks-views/timeline-view/timeline-view.component';
import { CustomFieldsDialogComponent } from './group/group-tasks-views/board-bar/custom-fields-dialog/custom-fields-dialog.component';
import { ResourcesCustomFieldsDialogComponent } from './group/group-resource-management/resources-bar/resources-custom-fields-dialog/resources-custom-fields-dialog.component';
import { GroupTimeTrackingCategoriesDialogComponent } from './group/group-admin/group-settings/time-tracking-categories-dialog/time-tracking-categories-dialog.component';
import { AutomationFlowDetailsDialogComponent } from './group/automation-flows-dialog/automation-flow-details-dialog/automation-flow-details-dialog.component';

@NgModule({
    declarations: [
        GroupRAGDialogComponent,
        GroupsComponent,
        GroupsListComponent,
        CreateGroupComponent,
        CreateGroupDialogComponent,
        PortfolioComponent,
        PortfolioDetailsComponent,
        PortfolioHeaderComponent,
        PortfolioGroupsListComponent,
        CreatePortfolioComponent,
        PortfolioMembersWorkloadCardComponent,
        PortfolioUserWorkloadDialogComponent,
        PortfolioProjectsPerformanceCardComponent,
        PortfolioWorkStatisticsCardComponent,
        PortfolioProjectStatisticsComponent,
        PortfolioProjectBudgetComponent,
        GroupSelectorDialogComponent,
        GroupSmartAdminComponent,
        GroupMembersComponent,
        GroupComponent,
        GroupAdminComponent,
        GroupActivityComponent,
        GroupResourceManagementComponent,
        DeleteGroupComponent,
        TableViewComponent,
        CreateSectionComponent,
        CRMSetupBoardBarComponent,
        InviteUserComponent,
        GroupCRMSetupViewComponent,
        CustomFieldsDialogComponent,
        CRMCustomFieldsDialogComponent,
        ResourcesCustomFieldsDialogComponent,
        GroupTimeTrackingCategoriesDialogComponent,
        GroupDashboardComponent,
        TasksTableComponent,
        AutomationFlowsDialogComponent,
        AutomationFlowDetailsDialogComponent,
        GroupReportsComponent,
        GroupSettingsComponent,
        GroupBackgroundImageDetailsComponent,
        NewCRMContactDialogComponent,
        CRMContactDialogComponent,
        CRMContactInformationComponent,
        CRMContactCustomFieldsComponent,
        CRMCompanyCustomFieldsComponent,
        CRMContactCompaniesComponent,
        NewCRMCompanyDialogComponent,
        CRMCompanyInformationComponent,
        CRMCompanyImageDialogComponent,
        ResourcesBarComponent,
        NewCRMProductDialogComponent,
        CRMProductCustomFieldsComponent,
        CRMProductInformationComponent,
        GroupResourceManagementBoardViewComponent,
        GroupTasksViewsComponent,
        AdvancedFilterDialogComponent,
        TimeTrackerDatesFilterDialogComponent,
        KanbanBoardComponent,
        KanbanSectionComponent,
        ColumnProjectSectionComponent,
        CreateSectionComponent,
        EditColumnComponent,
        BoardBarComponent,
        CreateProjectColumnDialogComponent,
        ShowCustomFieldsColumnDialogComponent,
        KanbanTaskCardComponent,
        TableSectionComponent,
        TimelineViewComponent,
        KanbanArchivedSectionsComponent,
        GroupCalendarViewComponent,
        GroupTimeTrackingViewComponent,
        
    ],
    imports: [
        CommonModule,
        GroupsRoutingModule,
        SharedModule,
        FormsModule,
        DragDropModule,
        MatButtonModule,
        MatMenuModule,
        MatChipsModule,
        MatDialogModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDatepickerModule,
        ResizableModule,
        Calendar.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        })
    ],
    providers: [
        GroupsService,
        GroupService,
        CRMGroupService,
        PostService,
        CommentService,
        FlowService,
        DatePipe,
        DecimalPipe
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class GroupsModule { }
