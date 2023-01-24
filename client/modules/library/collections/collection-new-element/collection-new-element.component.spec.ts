import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionNewElementComponent } from './collection-new-element.component';

describe('CollectionNewElementComponent', () => {
  let component: CollectionNewElementComponent;
  let fixture: ComponentFixture<CollectionNewElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionNewElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionNewElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
