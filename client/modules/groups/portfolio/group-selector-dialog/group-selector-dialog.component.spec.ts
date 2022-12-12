import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupSelectorDialogComponent } from './group-selector-dialog.component';


describe('GroupSelectorDialogComponent', () => {
  let component: GroupSelectorDialogComponent;
  let fixture: ComponentFixture<GroupSelectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupSelectorDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
