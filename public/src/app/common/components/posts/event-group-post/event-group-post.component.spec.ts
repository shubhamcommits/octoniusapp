import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventGroupPostComponent } from './event-group-post.component';

describe('EventGroupPostComponent', () => {
  let component: EventGroupPostComponent;
  let fixture: ComponentFixture<EventGroupPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventGroupPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventGroupPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
