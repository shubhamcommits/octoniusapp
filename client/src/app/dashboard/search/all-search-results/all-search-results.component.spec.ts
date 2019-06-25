import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSearchResultsComponent } from './all-search-results.component';

describe('AllSearchResultsComponent', () => {
  let component: AllSearchResultsComponent;
  let fixture: ComponentFixture<AllSearchResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllSearchResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
