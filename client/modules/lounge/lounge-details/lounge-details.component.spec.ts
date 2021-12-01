import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoungeDetailsComponent } from './lounge-details.component';

describe('LoungeDetailsComponent', () => {
  let component: LoungeDetailsComponent;
  let fixture: ComponentFixture<LoungeDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoungeDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoungeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
