import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSearchBarComponent } from './component-search-bar.component';

describe('ComponentSearchBarComponent', () => {
  let component: ComponentSearchBarComponent;
  let fixture: ComponentFixture<ComponentSearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSearchBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
