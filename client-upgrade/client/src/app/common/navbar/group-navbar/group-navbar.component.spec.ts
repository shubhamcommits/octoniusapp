import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupNavbarComponent } from './group-navbar.component';

describe('GroupNavbarComponent', () => {
  let component: GroupNavbarComponent;
  let fixture: ComponentFixture<GroupNavbarComponent>;

  beforeEach(async(() => {
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
