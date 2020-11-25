import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupImageDetailsComponent } from './group-image-details.component';

describe('GroupImageDetailsComponent', () => {
  let component: GroupImageDetailsComponent;
  let fixture: ComponentFixture<GroupImageDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupImageDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
