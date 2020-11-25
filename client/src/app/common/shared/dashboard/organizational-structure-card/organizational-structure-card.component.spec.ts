import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrganizationalStructureCardComponent } from './organizational-structure-card.component';

describe('OrganizationalStructureCardComponent', () => {
  let component: OrganizationalStructureCardComponent;
  let fixture: ComponentFixture<OrganizationalStructureCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationalStructureCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationalStructureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
