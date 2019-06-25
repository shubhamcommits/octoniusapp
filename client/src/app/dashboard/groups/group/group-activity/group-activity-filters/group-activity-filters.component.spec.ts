import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupActivityFiltersComponent } from './group-activity-filters.component';

describe('GroupActivityFiltersComponent', () => {
  let component: GroupActivityFiltersComponent;
  let fixture: ComponentFixture<GroupActivityFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupActivityFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupActivityFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
