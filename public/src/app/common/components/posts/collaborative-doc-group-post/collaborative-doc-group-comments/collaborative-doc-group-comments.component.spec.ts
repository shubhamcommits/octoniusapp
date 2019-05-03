import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborativeDocGroupCommentsComponent } from './collaborative-doc-group-comments.component';

describe('CollaborativeDocGroupCommentsComponent', () => {
  let component: CollaborativeDocGroupCommentsComponent;
  let fixture: ComponentFixture<CollaborativeDocGroupCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborativeDocGroupCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborativeDocGroupCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
