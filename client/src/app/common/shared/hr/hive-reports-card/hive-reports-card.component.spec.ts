import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HiveReportsCardComponent } from './hive-reports-card.component';

describe('HiveReportsCardComponent', () => {
  let component: HiveReportsCardComponent;
  let fixture: ComponentFixture<HiveReportsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HiveReportsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HiveReportsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
