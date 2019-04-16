import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborativeDocGroupNavbarComponent } from './collaborative-doc-group-navbar.component';

describe('CollaborativeDocGroupNavbarComponent', () => {
  let component: CollaborativeDocGroupNavbarComponent;
  let fixture: ComponentFixture<CollaborativeDocGroupNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborativeDocGroupNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborativeDocGroupNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
