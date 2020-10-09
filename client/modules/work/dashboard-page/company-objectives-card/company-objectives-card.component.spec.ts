import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyObjectivesCardComponent } from './company-objectives-card.component';

describe('CompanyObjectivesCardComponent', () => {
  let component: CompanyObjectivesCardComponent;
  let fixture: ComponentFixture<CompanyObjectivesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyObjectivesCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyObjectivesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
