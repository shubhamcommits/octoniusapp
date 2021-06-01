import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProjectBudgetComponent } from './project-budget.component';

describe('ProjectBudgetComponent', () => {
  let component: ProjectBudgetComponent;
  let fixture: ComponentFixture<ProjectBudgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
