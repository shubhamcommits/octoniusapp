import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMSetupBoardBarComponent } from './crm-setup-board-bar.component';

describe('ContactsContactsBoardBarComponent', () => {
  let component: CRMSetupBoardBarComponent;
  let fixture: ComponentFixture<CRMSetupBoardBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMSetupBoardBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMSetupBoardBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
