import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ColorSchemeCheckboxComponent } from './color-scheme-checkbox.component';

describe('Color Scheme Checkbox Component', () => {
    let component: ColorSchemeCheckboxComponent;
    let fixture: ComponentFixture<ColorSchemeCheckboxComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSchemeCheckboxComponent],
            imports: [FormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSchemeCheckboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
