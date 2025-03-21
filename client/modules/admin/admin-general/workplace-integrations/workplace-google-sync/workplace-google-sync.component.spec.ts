import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceGoogleSyncComponent } from './workplace-google-sync.component';

describe('WorkplaceGoogleSyncComponent', () => {
  let component: WorkplaceGoogleSyncComponent;
  let fixture: ComponentFixture<WorkplaceGoogleSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceGoogleSyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceGoogleSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
