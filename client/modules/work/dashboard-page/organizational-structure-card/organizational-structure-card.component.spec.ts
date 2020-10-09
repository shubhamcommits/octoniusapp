import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationalStructureCardComponent } from './organizational-structure-card.component';

describe('OrganizationalStructureCardComponent', () => {
  let component: OrganizationalStructureCardComponent;
  let fixture: ComponentFixture<OrganizationalStructureCardComponent>;

  beforeEach(async(() => {
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
