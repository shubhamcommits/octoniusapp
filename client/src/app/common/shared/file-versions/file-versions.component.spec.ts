import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FileVersionsComponent } from './file-versions.component';

describe('FileVersionsComponent', () => {
  let component: FileVersionsComponent;
  let fixture: ComponentFixture<FileVersionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FileVersionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
