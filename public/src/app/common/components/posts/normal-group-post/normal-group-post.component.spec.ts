import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalGroupPostComponent } from './normal-group-post.component';

describe('NormalGroupPostComponent', () => {
  let component: NormalGroupPostComponent;
  let fixture: ComponentFixture<NormalGroupPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalGroupPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalGroupPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
