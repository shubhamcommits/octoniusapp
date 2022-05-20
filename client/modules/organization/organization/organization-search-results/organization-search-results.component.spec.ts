import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSearchResultsComponent } from './organization-search-results.component';

describe('OrganizationSearchResultsComponent', () => {
  let component: OrganizationSearchResultsComponent;
  let fixture: ComponentFixture<OrganizationSearchResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationSearchResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
