import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceRolesInformationDialogComponent } from './workspace-roles-information-dialog.component';

describe('WorkspaceRolesInformationDialogComponent', () => {
  let component: WorkspaceRolesInformationDialogComponent;
  let fixture: ComponentFixture<WorkspaceRolesInformationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceRolesInformationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceRolesInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
