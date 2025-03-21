import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectBudgetDialogComponent } from './project-budget-dialog.component';


describe('ProjectBudgetDialogComponent', () => {
  let component: ProjectBudgetDialogComponent;
  let fixture: ComponentFixture<ProjectBudgetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBudgetDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBudgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
