import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionHeaderComponent } from './collection-header.component';

describe('CollectionHeaderComponent', () => {
  let component: CollectionHeaderComponent;
  let fixture: ComponentFixture<CollectionHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
