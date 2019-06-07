import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborativeDocGroupPostComponent } from './collaborative-doc-group-post.component';

describe('CollaborativeDocGroupPostComponent', () => {
  let component: CollaborativeDocGroupPostComponent;
  let fixture: ComponentFixture<CollaborativeDocGroupPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborativeDocGroupPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborativeDocGroupPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
