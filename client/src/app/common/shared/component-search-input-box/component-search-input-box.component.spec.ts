import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComponentSearchInputBoxComponent } from './component-search-input-box.component';

describe('ComponentSearchInputBoxComponent', () => {
  let component: ComponentSearchInputBoxComponent;
  let fixture: ComponentFixture<ComponentSearchInputBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSearchInputBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSearchInputBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
