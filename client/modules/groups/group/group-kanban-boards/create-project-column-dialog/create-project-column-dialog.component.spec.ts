import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectColumnDialogComponent } from './create-project-column-dialog.component';

describe('CreateProjectColumnDialogComponent', () => {
  let component: CreateProjectColumnDialogComponent;
  let fixture: ComponentFixture<CreateProjectColumnDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateProjectColumnDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectColumnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
