import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationFlowsDialogComponent } from './automation-flows-dialog.component';

describe('AutomationFlowsDialogComponent', () => {
  let component: AutomationFlowsDialogComponent;
  let fixture: ComponentFixture<AutomationFlowsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutomationFlowsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationFlowsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
