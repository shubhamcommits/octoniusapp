import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceLDAPSyncComponent } from './workplace-ldap-sync.component';

describe('WorkplaceLDAPSyncComponent', () => {
  let component: WorkplaceLDAPSyncComponent;
  let fixture: ComponentFixture<WorkplaceLDAPSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceLDAPSyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceLDAPSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
