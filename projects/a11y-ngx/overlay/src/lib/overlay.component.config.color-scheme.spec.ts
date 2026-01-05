import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, NgModule, ViewChild } from '@angular/core';
import { forceElementsCleanup, forceStylesCleanup } from '../test';

import { DOMHelperService } from '@a11y-ngx/dom-helper';
import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

import { A11yOverlayModule } from './overlay.module';
import { OverlayComponent } from './overlay.component';

import { OverlayCustomConfig } from './overlay.type';

@Component({
    selector: 'a11y-test-overlay-root-config-component',
    template: `
        <button type="button" #trigger (click)="overlay.toggle()">trigger</button>
        <a11y-overlay #overlay="a11yOverlay" [trigger]="trigger" [config]="config">
            testing overlay with some big content
        </a11y-overlay>
    `,
    styles: [
        `
            button {
                position: absolute;
                inset: auto 50% 50% auto;
            }
        `,
    ],
})
export class ColorSchemeOverlayRootConfigTestComponent {
    @ViewChild(OverlayComponent) overlay: OverlayComponent;

    config: OverlayCustomConfig = {};
}

@NgModule({
    declarations: [ColorSchemeOverlayRootConfigTestComponent],
    imports: [
        A11yColorSchemeModule.rootConfig({ useScheme: 'dark' }),
        A11yOverlayModule.rootConfig({
            forceScheme: 'red',
            colorSchemes: {
                red: {
                    backgroundColor: 'red',
                    textColor: 'white',
                    borderColor: 'black',
                    shadowColor: 'orange',
                },
                'blue-sea': {
                    backgroundColor: 'blue',
                    textColor: 'yellow',
                    borderColor: 'orange',
                    shadowColor: 'purple',
                },
            },
        }),
    ],
})
export class ColorSchemeOverlayRootConfigTestModule {}

describe('Overlay Component with Color Schemes', () => {
    let component: ColorSchemeOverlayRootConfigTestComponent;
    let fixture: ComponentFixture<ColorSchemeOverlayRootConfigTestComponent>;
    let DOMHelper: DOMHelperService;

    const openOverlay = (): void => {
        const trigger: HTMLButtonElement = getTrigger().nativeElement;
        trigger.dispatchEvent(new Event('click'));
        tick(310);
    };

    const getTrigger = (): DebugElement => {
        return fixture.debugElement.query(By.css('button'));
    };

    const getOverlay = (): DebugElement => {
        return fixture.debugElement.query(By.directive(OverlayComponent));
    };

    const getOverlayWrapper = (): DebugElement => {
        return getOverlay().query(By.css('[overlay-wrapper]'));
    };

    const getOverlayContent = (): DebugElement => {
        return getOverlay().query(By.css('[overlay-content]'));
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSchemeOverlayRootConfigTestComponent],
            imports: [ColorSchemeOverlayRootConfigTestModule],
            providers: [DOMHelperService],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        DOMHelper = TestBed.inject(DOMHelperService);
        fixture = TestBed.createComponent(ColorSchemeOverlayRootConfigTestComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();

        localStorage.removeItem('a11y.colorScheme');
    }));

    afterEach(() => {
        if (!forceElementsCleanup) return;

        fixture.nativeElement.remove();
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should open with the default forced scheme "red"', fakeAsync(() => {
        openOverlay();

        const overlayElement: HTMLElement = getOverlay().nativeElement;

        const overlayWrapperStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayWrapper().nativeElement);
        const overlayContentStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayContent().nativeElement);

        expect(overlayWrapperStyles.boxShadow).toEqual('rgb(255, 165, 0) 5px 5px 10px -5px');
        expect(overlayWrapperStyles.borderColor).toEqual('rgb(0, 0, 0)');
        expect(overlayWrapperStyles.backgroundColor).toEqual('rgb(255, 0, 0)');
        expect(overlayContentStyles.color).toEqual('rgb(255, 255, 255)');

        const overlayColorSchemeAttr: string = DOMHelper.getAttributeValue(overlayElement, 'color-scheme');
        expect(overlayColorSchemeAttr).toEqual('red');
    }));

    it('should open with the desired forced scheme "dark"', fakeAsync(() => {
        component.config = { forceScheme: 'dark' };
        openOverlay();

        const overlayElement: HTMLElement = getOverlay().nativeElement;

        const overlayWrapperStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayWrapper().nativeElement);
        const overlayContentStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayContent().nativeElement);

        expect(overlayWrapperStyles.boxShadow).toEqual('rgb(68, 68, 68) 5px 5px 10px -5px');
        expect(overlayWrapperStyles.borderColor).toEqual('rgb(102, 102, 102)');
        expect(overlayWrapperStyles.backgroundColor).toEqual('rgba(31, 31, 31, 0.98)');
        expect(overlayContentStyles.color).toEqual('rgb(255, 255, 255)');

        const overlayColorSchemeAttr: string = DOMHelper.getAttributeValue(overlayElement, 'color-scheme');
        expect(overlayColorSchemeAttr).toEqual('dark');
    }));

    it('should open with the desired forced scheme "light"', fakeAsync(() => {
        component.config = { forceScheme: 'light' };
        openOverlay();

        const overlayElement: HTMLElement = getOverlay().nativeElement;

        const overlayWrapperStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayWrapper().nativeElement);
        const overlayContentStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayContent().nativeElement);

        expect(overlayWrapperStyles.boxShadow).toEqual('rgb(68, 68, 68) 5px 5px 10px -5px');
        expect(overlayWrapperStyles.borderColor).toEqual('rgb(101, 101, 101)');
        expect(overlayWrapperStyles.backgroundColor).toEqual('rgba(255, 255, 255, 0.98)');
        expect(overlayContentStyles.color).toEqual('rgb(34, 34, 34)');

        const overlayColorSchemeAttr: string = DOMHelper.getAttributeValue(overlayElement, 'color-scheme');
        expect(overlayColorSchemeAttr).toEqual('light');
    }));

    it('should open with the desired forced scheme "blue-sea"', fakeAsync(() => {
        component.config = { forceScheme: 'blue-sea' };
        openOverlay();

        const overlayElement: HTMLElement = getOverlay().nativeElement;

        const overlayWrapperStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayWrapper().nativeElement);
        const overlayContentStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayContent().nativeElement);

        expect(overlayWrapperStyles.boxShadow).toEqual('rgb(128, 0, 128) 5px 5px 10px -5px');
        expect(overlayWrapperStyles.borderColor).toEqual('rgb(255, 165, 0)');
        expect(overlayWrapperStyles.backgroundColor).toEqual('rgb(0, 0, 255)');
        expect(overlayContentStyles.color).toEqual('rgb(255, 255, 0)');

        const overlayColorSchemeAttr: string = DOMHelper.getAttributeValue(overlayElement, 'color-scheme');
        expect(overlayColorSchemeAttr).toEqual('blue-sea');
    }));

    it(`should open with the system's scheme (forced to "dark") when the forced scheme "dragon" does not exist`, fakeAsync(() => {
        component.config = { forceScheme: 'dragon' };
        openOverlay();

        const overlayElement: HTMLElement = getOverlay().nativeElement;

        const overlayWrapperStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayWrapper().nativeElement);
        const overlayContentStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayContent().nativeElement);

        expect(overlayWrapperStyles.boxShadow).toEqual('rgb(68, 68, 68) 5px 5px 10px -5px');
        expect(overlayWrapperStyles.borderColor).toEqual('rgb(102, 102, 102)');
        expect(overlayWrapperStyles.backgroundColor).toEqual('rgba(31, 31, 31, 0.98)');
        expect(overlayContentStyles.color).toEqual('rgb(255, 255, 255)');

        const overlayColorSchemeAttr: string = DOMHelper.getAttributeValue(overlayElement, 'color-scheme');
        expect(overlayColorSchemeAttr).toEqual('dragon');
    }));
});
