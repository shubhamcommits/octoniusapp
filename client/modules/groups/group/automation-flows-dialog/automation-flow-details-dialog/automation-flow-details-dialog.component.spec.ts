import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AutomationFlowDetailsDialogComponent } from './automation-flow-details-dialog.component';


describe('AutomationFlowDetailsDialogComponent', () => {
  let component: AutomationFlowDetailsDialogComponent;
  let fixture: ComponentFixture<AutomationFlowDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutomationFlowDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationFlowDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
