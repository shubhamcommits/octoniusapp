import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionImageDetailsComponent } from './collection-image-details.component';

describe('CollectionImageDetailsComponent', () => {
  let component: CollectionImageDetailsComponent;
  let fixture: ComponentFixture<CollectionImageDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionImageDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
