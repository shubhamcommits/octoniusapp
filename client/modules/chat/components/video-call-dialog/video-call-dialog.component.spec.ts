import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCallDialog } from './video-call-dialog.component';

describe('VideoCallDialog', () => {
  let component: VideoCallDialog;
  let fixture: ComponentFixture<VideoCallDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoCallDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoCallDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
