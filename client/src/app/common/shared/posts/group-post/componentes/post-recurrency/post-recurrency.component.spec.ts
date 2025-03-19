import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { PostRecurrencyComponent } from "./post-recurrency.component";

describe("PostRecurrencyComponent", () => {
  let component: PostRecurrencyComponent;
  let fixture: ComponentFixture<PostRecurrencyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PostRecurrencyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostRecurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
