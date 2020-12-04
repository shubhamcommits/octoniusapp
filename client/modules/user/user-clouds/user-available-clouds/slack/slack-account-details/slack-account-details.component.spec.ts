import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackAccountDetailsComponent } from './slack-account-details.component';

describe('SlackAccountDetailsComponent', () => {
  let component: SlackAccountDetailsComponent;
  let fixture: ComponentFixture<SlackAccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlackAccountDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
