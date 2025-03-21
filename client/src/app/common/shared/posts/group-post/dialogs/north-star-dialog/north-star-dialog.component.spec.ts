import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NorthStarDialogComponent } from './north-star-dialog.component';

describe('NorthStarDialogComponent', () => {
  let component: NorthStarDialogComponent;
  let fixture: ComponentFixture<NorthStarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NorthStarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NorthStarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
