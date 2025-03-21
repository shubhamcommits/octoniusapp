import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardBar2Component } from './board-bar.component';

describe('BoardBar2Component', () => {
  let component: BoardBar2Component;
  let fixture: ComponentFixture<BoardBar2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardBar2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardBar2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
