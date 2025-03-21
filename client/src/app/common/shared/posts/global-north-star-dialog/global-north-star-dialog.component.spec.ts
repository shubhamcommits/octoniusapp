import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GlobalNorthStarDialogComponent } from './global-north-star-dialog.component';

describe('GlobalNorthStarDialogComponent', () => {
  let component: GlobalNorthStarDialogComponent;
  let fixture: ComponentFixture<GlobalNorthStarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalNorthStarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalNorthStarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
