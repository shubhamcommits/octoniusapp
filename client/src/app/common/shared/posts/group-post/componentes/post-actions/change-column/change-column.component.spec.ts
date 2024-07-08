import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeColumnComponent } from './change-column.component';

describe('ChangeColumnComponent', () => {
  let component: ChangeColumnComponent;
  let fixture: ComponentFixture<ChangeColumnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
