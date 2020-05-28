import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPostSelectionComponent } from './group-post-selection.component';

describe('GroupPostSelectionComponent', () => {
  let component: GroupPostSelectionComponent;
  let fixture: ComponentFixture<GroupPostSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPostSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPostSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
