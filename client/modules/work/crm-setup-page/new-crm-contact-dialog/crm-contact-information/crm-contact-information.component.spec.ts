import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMContactInformationComponent } from './crm-contact-information.component';

describe('CRMContactInformationComponent', () => {
  let component: CRMContactInformationComponent;
  let fixture: ComponentFixture<CRMContactInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMContactInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMContactInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
