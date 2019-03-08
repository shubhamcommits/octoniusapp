import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupActivityProgressComponent } from './group-activity-progress.component';

describe('GroupActivityProgressComponent', () => {
  let component: GroupActivityProgressComponent;
  let fixture: ComponentFixture<GroupActivityProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupActivityProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupActivityProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
