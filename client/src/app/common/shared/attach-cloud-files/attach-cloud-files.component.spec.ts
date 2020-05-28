import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachCloudFilesComponent } from './attach-cloud-files.component';

describe('AttachCloudFilesComponent', () => {
  let component: AttachCloudFilesComponent;
  let fixture: ComponentFixture<AttachCloudFilesComponent>;

  beforeEach(async(() => {
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
