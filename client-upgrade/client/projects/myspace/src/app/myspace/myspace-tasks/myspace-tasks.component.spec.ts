import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyspaceTasksComponent } from './myspace-tasks.component';

describe('MyspaceTasksComponent', () => {
  let component: MyspaceTasksComponent;
  let fixture: ComponentFixture<MyspaceTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyspaceTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyspaceTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
