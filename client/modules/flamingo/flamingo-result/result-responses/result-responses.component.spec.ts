import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultResponsesComponent } from './result-responses.component';

describe('ResultResponsesComponent', () => {
  let component: ResultResponsesComponent;
  let fixture: ComponentFixture<ResultResponsesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultResponsesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
