import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, NgModule, ViewChild } from '@angular/core';

import { A11ySROnlyModule } from './sr-only.module';
import { ScreenReaderOnlyComponent, VisuallyHiddenComponent } from './sr-only.component';

describe('Screen Reader Only Component', () => {
    let component: ScreenReaderOnlyComponent;
    let fixture: ComponentFixture<ScreenReaderOnlyComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ScreenReaderOnlyComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ScreenReaderOnlyComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

describe('Vsually Hidden Component', () => {
    let component: VisuallyHiddenComponent;
    let fixture: ComponentFixture<VisuallyHiddenComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [VisuallyHiddenComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VisuallyHiddenComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

/* ---------------- RENDERED COMPONENTS ---------------- */

@Component({
    selector: 'a11y-test-sr-only-component',
    template: `
        <a11y-sr-only>{{ contentProjection }}</a11y-sr-only>
        <a11y-visually-hidden #vh [text]="contentInput"></a11y-visually-hidden>
    `,
})
export class CustomSROnlyTestComponent {
    @ViewChild(VisuallyHiddenComponent) vh: VisuallyHiddenComponent;

    contentProjection: string = 'testing content projection';
    contentInput: string = 'testing input';
}

@NgModule({
    declarations: [CustomSROnlyTestComponent],
    imports: [A11ySROnlyModule],
})
export class CustomSROnlyTestModule {}

describe('Screen Reader Only / Vsually Hidden Components Rendered', () => {
    let component: CustomSROnlyTestComponent;
    let fixture: ComponentFixture<CustomSROnlyTestComponent>;

    const getSROnly = (): HTMLElement => {
        return fixture.debugElement.query(By.directive(ScreenReaderOnlyComponent)).nativeElement;
    };
    const getVisuallyHidden = (): HTMLElement => {
        return fixture.debugElement.query(By.directive(VisuallyHiddenComponent)).nativeElement;
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomSROnlyTestComponent],
            imports: [CustomSROnlyTestModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CustomSROnlyTestComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(`should verify inner text changes when using content projection`, () => {
        const SROnlyComponent: HTMLElement = getSROnly();
        const textSROnlyBefore: string = SROnlyComponent.textContent;
        expect(textSROnlyBefore).toBe('testing content projection');

        component.contentProjection = 'testing new content projection';
        fixture.detectChanges();
        const textSROnlyAfter: string = SROnlyComponent.textContent;
        expect(textSROnlyAfter).toBe('testing new content projection');
    });

    it(`should verify inner text changes when using input`, () => {
        const visuallyHiddenComponent: HTMLElement = getVisuallyHidden();
        const textVisuallyHiddenBefore: string = visuallyHiddenComponent.textContent;
        expect(textVisuallyHiddenBefore).toBe('testing input');

        component.contentInput = 'testing new input';
        fixture.detectChanges();
        const textVisuallyHiddenAfter: string = visuallyHiddenComponent.textContent;
        expect(textVisuallyHiddenAfter).toBe('testing new input');
    });
});
