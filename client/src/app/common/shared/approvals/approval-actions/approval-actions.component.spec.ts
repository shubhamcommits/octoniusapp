import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApprovalActionsComponent } from './approval-actions.component';

describe('ApprovalActionsComponent', () => {
  let component: ApprovalActionsComponent;
  let fixture: ComponentFixture<ApprovalActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
