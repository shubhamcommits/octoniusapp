import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NorthStarComponent } from './north-star.component';

describe('NorthStarComponent', () => {
  let component: NorthStarComponent;
  let fixture: ComponentFixture<NorthStarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NorthStarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NorthStarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
