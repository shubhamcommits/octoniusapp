import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NormalPostDialogComponent } from './normal-post-dialog.component';

describe('NormalPostDialogComponent', () => {
  let component: NormalPostDialogComponent;
  let fixture: ComponentFixture<NormalPostDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalPostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalPostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
