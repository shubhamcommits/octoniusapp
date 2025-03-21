import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewsPillComponent } from './news-pill.component';

describe('NewsPillComponent', () => {
  let component: NewsPillComponent;
  let fixture: ComponentFixture<NewsPillComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsPillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
