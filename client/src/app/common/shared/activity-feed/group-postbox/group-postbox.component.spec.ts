import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupPostboxComponent } from './group-postbox.component';

describe('GroupPostboxComponent', () => {
  let component: GroupPostboxComponent;
  let fixture: ComponentFixture<GroupPostboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPostboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPostboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
