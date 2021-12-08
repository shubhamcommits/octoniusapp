import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryActionsBarComponent } from './story-actions-bar.component';

describe('StoryActionsBarComponent', () => {
  let component: StoryActionsBarComponent;
  let fixture: ComponentFixture<StoryActionsBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoryActionsBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryActionsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
