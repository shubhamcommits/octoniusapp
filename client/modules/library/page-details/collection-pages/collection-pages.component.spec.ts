import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPagesComponent } from './collection-pages.component';

describe('CollectionPagesComponent', () => {
  let component: CollectionPagesComponent;
  let fixture: ComponentFixture<CollectionPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
