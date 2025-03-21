import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionStatusCardComponent } from './section-status-card.component';

describe('SectionStatusCardComponent', () => {
  let component: SectionStatusCardComponent;
  let fixture: ComponentFixture<SectionStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionStatusCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionStatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
