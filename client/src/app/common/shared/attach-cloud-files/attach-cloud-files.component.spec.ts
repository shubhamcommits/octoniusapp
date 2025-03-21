import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttachCloudFilesComponent } from './attach-cloud-files.component';

describe('AttachCloudFilesComponent', () => {
  let component: AttachCloudFilesComponent;
  let fixture: ComponentFixture<AttachCloudFilesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachCloudFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachCloudFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
