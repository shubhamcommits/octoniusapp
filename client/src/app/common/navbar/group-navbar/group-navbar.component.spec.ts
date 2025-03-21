import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupNavbarComponent } from './group-navbar.component';

describe('GroupNavbarComponent', () => {
  let component: GroupNavbarComponent;
  let fixture: ComponentFixture<GroupNavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
