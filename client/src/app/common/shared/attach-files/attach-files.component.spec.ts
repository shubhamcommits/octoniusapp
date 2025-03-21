import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttachFilesComponent } from './attach-files.component';

describe('AttachFilesComponent', () => {
  let component: AttachFilesComponent;
  let fixture: ComponentFixture<AttachFilesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
