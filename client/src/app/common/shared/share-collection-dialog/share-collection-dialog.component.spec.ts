import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareCollectionDialogComponent } from './share-collection-dialog.component';

describe('ShareCollectionDialogComponent', () => {
  let component: ShareCollectionDialogComponent;
  let fixture: ComponentFixture<ShareCollectionDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareCollectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareCollectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
