import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlamingoAnswerComponent } from './flamingo-answer.component';

describe('FlamingoAnswerComponent', () => {
  let component: FlamingoAnswerComponent;
  let fixture: ComponentFixture<FlamingoAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlamingoAnswerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlamingoAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
