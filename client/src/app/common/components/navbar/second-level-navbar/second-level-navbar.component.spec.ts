import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondLevelNavbarComponent } from './second-level-navbar.component';

describe('SecondLevelNavbarComponent', () => {
  let component: SecondLevelNavbarComponent;
  let fixture: ComponentFixture<SecondLevelNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondLevelNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondLevelNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
