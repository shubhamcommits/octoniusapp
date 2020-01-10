import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdLevelNavbarComponent } from './third-level-navbar.component';

describe('ThirdLevelNavbarComponent', () => {
  let component: ThirdLevelNavbarComponent;
  let fixture: ComponentFixture<ThirdLevelNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThirdLevelNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirdLevelNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
