import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EventPostDialogComponent } from './event-post-dialog.component';

describe('EventPostDialogComponent', () => {
  let component: EventPostDialogComponent;
  let fixture: ComponentFixture<EventPostDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EventPostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventPostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
