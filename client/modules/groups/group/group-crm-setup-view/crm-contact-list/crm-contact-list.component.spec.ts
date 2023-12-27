import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMContactListComponent } from './crm-contact-list.component';

describe('CRMContactListComponent', () => {
  let component: CRMContactListComponent;
  let fixture: ComponentFixture<CRMContactListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMContactListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
