import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationHRComponent } from './organization-hr.component';

describe('OrganizationHRComponent', () => {
  let component: OrganizationHRComponent;
  let fixture: ComponentFixture<OrganizationHRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationHRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationHRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
