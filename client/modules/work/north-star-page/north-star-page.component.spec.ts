import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NorthStarPageComponent } from './north-star-page.component';

describe('NorthStarPageComponent', () => {
  let component: NorthStarPageComponent;
  let fixture: ComponentFixture<NorthStarPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NorthStarPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NorthStarPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
