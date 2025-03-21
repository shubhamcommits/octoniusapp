import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResourcesDetailsDialogComponent } from './resources-details-dialog.component';

describe('ResourcesDetailsDialogComponent', () => {
  let component: ResourcesDetailsDialogComponent;
  let fixture: ComponentFixture<ResourcesDetailsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
