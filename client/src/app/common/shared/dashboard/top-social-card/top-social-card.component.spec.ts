import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TopSocialCardComponent } from './top-social-card.component';

describe('TopSocialCardComponent', () => {
  let component: TopSocialCardComponent;
  let fixture: ComponentFixture<TopSocialCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TopSocialCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopSocialCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
