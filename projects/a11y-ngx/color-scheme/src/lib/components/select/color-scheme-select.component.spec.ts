import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ColorSchemeSelectComponent } from './color-scheme-select.component';

describe('Color Scheme Select Component', () => {
    let fixture: ComponentFixture<ColorSchemeSelectComponent>;
    let component: ColorSchemeSelectComponent;
    let componentElement: HTMLElement;
    let selectElement: HTMLSelectElement;
    let labelElement: HTMLLabelElement;

    const defaultLabel: string = 'Color Scheme';
    const spanishLabel: string = 'Esquema de Color';

    const getElements = () => {
        selectElement = componentElement.querySelector('select');
        labelElement = componentElement.querySelector('label');
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSchemeSelectComponent],
            imports: [FormsModule],
        }).compileComponents();

        localStorage.clear();

        fixture = TestBed.createComponent(ColorSchemeSelectComponent);
        component = fixture.componentInstance;
        componentElement = fixture.nativeElement;
        fixture.detectChanges();
    }));

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('The Elements', () => {
        beforeEach(() => getElements());

        it('should have the "id"/"for" attributes set', () => {
            expect(selectElement.id).toEqual(component.id);
            expect(labelElement.getAttribute('for')).toEqual(component.id);
        });

        it('should have the right text within the "<label>" tag', () => {
            expect(labelElement.textContent.trim()).toEqual(defaultLabel);

            component.label = spanishLabel;
            fixture.detectChanges();
            expect(labelElement.textContent.trim()).toEqual(spanishLabel);
        });

        it('should have the "disabled" attribute set in the "<select>" element', fakeAsync(() => {
            expect(selectElement.disabled).toBeFalse();

            component.disabled = true;
            fixture.detectChanges();

            tick(0);
            expect(selectElement.disabled).toBeTrue();
        }));
    });

    describe('The Label', () => {
        it(`should have default label as "${defaultLabel}"`, () => {
            expect(component.label).toEqual(defaultLabel);
        });

        it(`should define the label as "${spanishLabel}"`, () => {
            component.label = spanishLabel;
            expect(component.label).toEqual(spanishLabel);
        });
    });

    describe('The Disabled State', () => {
        it('should have default disabled state as "false"', () => {
            expect(component.disabled).toBeFalse();
        });

        it('should define the disabled state as "true"', () => {
            component.disabled = true;
            expect(component.disabled).toBeTrue();
        });
    });

    describe('On Change', () => {
        beforeEach(() => getElements());

        it('should update the "colorScheme" value when the select changes', () => {
            expect(component.colorScheme).toEqual('auto');

            selectElement.value = selectElement.options[0].value;
            selectElement.dispatchEvent(new Event('change'));
            fixture.detectChanges();
            expect(component.colorScheme).toEqual('light');

            selectElement.value = selectElement.options[1].value;
            selectElement.dispatchEvent(new Event('change'));
            fixture.detectChanges();
            expect(component.colorScheme).toEqual('dark');
        });

        it('should call "changeColorScheme" when the select changes', () => {
            spyOn(component, 'changeColorScheme');
            selectElement.dispatchEvent(new Event('change'));
            fixture.detectChanges();
            expect(component.changeColorScheme).toHaveBeenCalled();
        });
    });
});
