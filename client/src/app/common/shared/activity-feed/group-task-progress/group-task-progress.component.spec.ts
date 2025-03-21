import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupTaskProgressComponent } from './group-task-progress.component';

describe('GroupTaskProgressComponent', () => {
  let component: GroupTaskProgressComponent;
  let fixture: ComponentFixture<GroupTaskProgressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTaskProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTaskProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
