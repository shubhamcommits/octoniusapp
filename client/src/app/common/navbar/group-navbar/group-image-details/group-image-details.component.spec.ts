import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupImageDetailsComponent } from './group-image-details.component';

describe('GroupImageDetailsComponent', () => {
  let component: GroupImageDetailsComponent;
  let fixture: ComponentFixture<GroupImageDetailsComponent>;

  beforeEach(async(() => {
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
