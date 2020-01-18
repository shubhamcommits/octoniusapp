import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollabDocPostComponent } from './collab-doc-post.component';

describe('CollabDocPostComponent', () => {
  let component: CollabDocPostComponent;
  let fixture: ComponentFixture<CollabDocPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollabDocPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollabDocPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
