import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeColumnComponent } from './change-column.component';

describe('ChangeColumnComponent', () => {
  let component: ChangeColumnComponent;
  let fixture: ComponentFixture<ChangeColumnComponent>;

  beforeEach(async(() => {
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
