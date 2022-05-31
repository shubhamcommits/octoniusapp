import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleDirectorySearchResultsComponent } from './people-directory-search-results.component';

describe('PeopleDirectorySearchResultsComponent', () => {
  let component: PeopleDirectorySearchResultsComponent;
  let fixture: ComponentFixture<PeopleDirectorySearchResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleDirectorySearchResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleDirectorySearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
