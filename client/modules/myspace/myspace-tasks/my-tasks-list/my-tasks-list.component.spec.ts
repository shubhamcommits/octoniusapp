import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTasksListComponent } from './my-tasks-list.component';

describe('MyTasksListComponent', () => {
  let component: MyTasksListComponent;
  let fixture: ComponentFixture<MyTasksListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTasksListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTasksListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
