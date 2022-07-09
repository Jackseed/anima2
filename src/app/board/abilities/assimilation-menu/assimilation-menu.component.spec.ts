import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssimilationMenuComponent } from './assimilation-menu.component';

describe('AssimilationMenuComponent', () => {
  let component: AssimilationMenuComponent;
  let fixture: ComponentFixture<AssimilationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssimilationMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssimilationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
