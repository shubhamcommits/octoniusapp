import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMSetupPageComponent } from './crm-setup-page.component';

describe('CRMSetupPageComponent', () => {
  let component: CRMSetupPageComponent;
  let fixture: ComponentFixture<CRMSetupPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMSetupPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMSetupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
