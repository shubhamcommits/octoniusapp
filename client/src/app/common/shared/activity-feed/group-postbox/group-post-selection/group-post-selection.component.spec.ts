import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupPostSelectionComponent } from './group-post-selection.component';

describe('GroupPostSelectionComponent', () => {
  let component: GroupPostSelectionComponent;
  let fixture: ComponentFixture<GroupPostSelectionComponent>;

  beforeEach(waitForAsync(() => {
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
