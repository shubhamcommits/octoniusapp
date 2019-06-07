import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSearchResultComponent } from './content-search-result.component';

describe('ContentSearchResultComponent', () => {
  let component: ContentSearchResultComponent;
  let fixture: ComponentFixture<ContentSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
