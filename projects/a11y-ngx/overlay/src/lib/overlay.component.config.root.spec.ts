import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, NgModule, ViewChild } from '@angular/core';
import { forceElementsCleanup, forceStylesCleanup } from '../test';

import { DOMHelperService } from '@a11y-ngx/dom-helper';

import { A11yOverlayModule } from './overlay.module';
import { OverlayComponent } from './overlay.component';

import { OverlayCustomConfig } from './overlay.type';

const theCustomStyles: { [property: string]: string | number } = {
    backgroundColor: 'rgb(255, 0, 0)',
    borderColor: 'rgb(255, 255, 0)',
    borderSize: 2,
    borderRadius: 10,
    shadow: '0 0 5px',
    shadowColor: 'rgb(255, 125, 0)',
    textColor: 'rgba(255, 255, 255, .9)',
    padding: '15px 20px',
};

@Component({
    selector: 'a11y-test-overlay-root-config-component',
    template: `
        <div class="scroll-generator-height"></div>
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
            .scroll-generator-height {
                position: absolute;
                inset: 0 auto auto 0;
                width: 1px;
                height: 3000px;
                background-color: red;
            }
        `,
    ],
})
export class CustomOverlayRootConfigTestComponent {
    @ViewChild(OverlayComponent) overlay: OverlayComponent;

    config: OverlayCustomConfig = {};
}

@NgModule({
    declarations: [CustomOverlayRootConfigTestComponent],
    imports: [
        A11yOverlayModule.rootConfig({
            fadeMs: 300,
            fadeDelayMs: 10,
            zIndex: 100,
            allowClose: false,
            arrowSize: 10,
            className: ['root-config-overlay'],
            offsetSize: 10,
            position: 'bottom-start',
            positionStrategy: 'absolute',
            safeSpace: { top: 100, left: 100, right: 100, bottom: 100 },
            ...theCustomStyles,
        }),
    ],
})
export class CustomOverlayRootConfigTestModule {}

describe('Overlay Component with Root Config', () => {
    let component: CustomOverlayRootConfigTestComponent;
    let fixture: ComponentFixture<CustomOverlayRootConfigTestComponent>;
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
            declarations: [CustomOverlayRootConfigTestComponent],
            imports: [CustomOverlayRootConfigTestModule],
            providers: [DOMHelperService],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        DOMHelper = TestBed.inject(DOMHelperService);
        fixture = TestBed.createComponent(CustomOverlayRootConfigTestComponent);
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

    it('should create', fakeAsync(() => {
        openOverlay();
        expect(component).toBeTruthy();
    }));

    it('should have the position set at "bottom-start" and the strategy to "absolute"', fakeAsync(() => {
        openOverlay();
        expect(DOMHelper.getStyle(component.overlay.nativeElement, 'position')).toEqual('absolute');
        expect(component.overlay.getCurrentPosition).toEqual('bottom');
        expect(component.overlay.getCurrentAlignment).toEqual('start');
    }));

    it('should have the defined styles', fakeAsync(() => {
        openOverlay();

        const overlayWrapperStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayWrapper().nativeElement);
        const overlayContentStyles: CSSStyleDeclaration = DOMHelper.getStyles(getOverlayContent().nativeElement);

        expect(overlayWrapperStyles.boxShadow).toEqual('rgb(255, 125, 0) 0px 0px 5px 0px');
        expect(overlayWrapperStyles.borderRadius).toEqual('10px');
        expect(overlayWrapperStyles.borderWidth).toEqual('2px');
        expect(overlayWrapperStyles.borderColor).toEqual('rgb(255, 255, 0)');
        expect(overlayWrapperStyles.backgroundColor).toEqual('rgb(255, 0, 0)');
        expect(overlayContentStyles.padding).toEqual('15px 20px');
        expect(overlayContentStyles.color).toEqual('rgba(255, 255, 255, 0.9)');
        expect(DOMHelper.getStyle(getOverlay().nativeElement, 'zIndex')).toEqual('100');
    }));

    it('should have the defined "root-config-overlay" class', fakeAsync(() => {
        openOverlay();
        expect(component.overlay.nativeElement.classList.contains('root-config-overlay')).toBe(true);
    }));

    it('should have the defined "fadeMs" and "fadeDelayMs"', fakeAsync(() => {
        openOverlay();
        expect(component.overlay.fadeMs).toEqual(310);
        expect(component.overlay.fadeDelayMs).toEqual(10);
    }));

    it(`should check "allowClose"`, () => {
        expect(component.overlay['allowCloseEscape']).toBe(false);
        expect(component.overlay['allowCloseClickOutside']).toBe(false);
    });

    it(`should not close when clicking outside the overlay`, fakeAsync(() => {
        openOverlay();
        fixture.detectChanges();

        const overlayRect: DOMRect = getOverlay().nativeElement.getBoundingClientRect();

        document.dispatchEvent(
            new PointerEvent('click', {
                clientX: overlayRect.x - 10,
                clientY: overlayRect.y - 10,
            })
        );
        tick(310);
        fixture.detectChanges();

        expect(component.overlay.isVisible).toBe(true);
    }));

    it(`should not close when pressing the Escape key on the overlay by default`, fakeAsync(() => {
        const ESC_KEY_EVENT: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Escape' });

        openOverlay();
        fixture.detectChanges();

        getOverlay().nativeElement.dispatchEvent(ESC_KEY_EVENT);
        tick(310);
        fixture.detectChanges();

        expect(component.overlay.isVisible).toBe(true);
    }));

    it(`should check the distance between trigger and overlay (arrow + offset)`, fakeAsync(() => {
        openOverlay();

        const triggerRect: DOMRect = getTrigger().nativeElement.getBoundingClientRect();
        const overlayRect: DOMRect = getOverlay().nativeElement.getBoundingClientRect();
        const arrowSize: number = 10;
        const offsetSize: number = 10;

        expect(Math.round(overlayRect.top)).toEqual(
            Math.round(triggerRect.top + triggerRect.height + arrowSize + offsetSize)
        );
    }));

    it(`should reposition correctly on scroll down`, fakeAsync(() => {
        component.config = { position: 'top' };
        openOverlay();

        const triggerRect: DOMRect = getTrigger().nativeElement.getBoundingClientRect();
        const overlayRect: DOMRect = getOverlay().nativeElement.getBoundingClientRect();
        const safeSpaceTop: number = 100;
        const arrowSize: number = 10;
        const offsetSize: number = 10;

        const scrollTop: number = triggerRect.top - overlayRect.height - safeSpaceTop - arrowSize - offsetSize;

        window.scrollTo(0, scrollTop - 5);
        window.dispatchEvent(new Event('scroll'));
        tick(310);

        expect(component.overlay.getCurrentPosition).toEqual('top');

        window.scrollTo(0, scrollTop);
        window.dispatchEvent(new Event('scroll'));
        tick(310);

        expect(component.overlay.getCurrentPosition).toEqual('bottom');
    }));
});
