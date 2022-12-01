import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNorthStarDialogComponent } from './new-north-start-dialog.component';

describe('NewNorthStarDialogComponent', () => {
  let component: NewNorthStarDialogComponent;
  let fixture: ComponentFixture<NewNorthStarDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewNorthStarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewNorthStarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
