import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupBackgroundImageDetailsComponent } from './group-background-image-details.component';

describe('GroupBackgroundImageDetailsComponent', () => {
  let component: GroupBackgroundImageDetailsComponent;
  let fixture: ComponentFixture<GroupBackgroundImageDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupBackgroundImageDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupBackgroundImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
