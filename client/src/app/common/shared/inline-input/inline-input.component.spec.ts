import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InlineInputComponent } from './inline-input.component';

describe('InlineInputComponent', () => {
  let component: InlineInputComponent;
  let fixture: ComponentFixture<InlineInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
