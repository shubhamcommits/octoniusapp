import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionImageDetailsComponent } from './question-image-details.component';

describe('QuestionImageDetailsComponent', () => {
  let component: QuestionImageDetailsComponent;
  let fixture: ComponentFixture<QuestionImageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionImageDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
