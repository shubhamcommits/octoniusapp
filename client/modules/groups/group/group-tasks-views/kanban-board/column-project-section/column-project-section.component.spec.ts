import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnProjectSectionComponent } from './column-project-section.component';


describe('ColumnProjectSectionComponent', () => {
  let component: ColumnProjectSectionComponent;
  let fixture: ComponentFixture<ColumnProjectSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnProjectSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnProjectSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
