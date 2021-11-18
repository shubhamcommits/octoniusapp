import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceIntegrationsComponent } from './workplace-integrations.component';

describe('WorkplaceIntegrationsComponent', () => {
  let component: WorkplaceIntegrationsComponent;
  let fixture: ComponentFixture<WorkplaceIntegrationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceIntegrationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceIntegrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
