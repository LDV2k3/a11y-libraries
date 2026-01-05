import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, NgModule, ViewChild } from '@angular/core';
import { forceElementsCleanup, forceStylesCleanup } from '../test';

import { DOMHelperService } from '@a11y-ngx/dom-helper';

import { A11yOverlayModule } from './overlay.module';
import { OverlayComponent } from './overlay.component';

import { OVERLAY_SELECTOR_BASE } from './overlay.type.private';
import { OVERLAY_DEFAULTS, OverlayCustomConfig } from './overlay.type';

@Component({
    selector: 'a11y-test-overlay-component',
    template: `
        <button type="button" #trigger (click)="overlay.toggle()">trigger</button>
        <a11y-overlay #overlay="a11yOverlay" [trigger]="trigger" [config]="config">
            <div [innerHTML]="content"></div>
        </a11y-overlay>
    `,
    styles: [
        `
            button {
                position: fixed;
                inset: auto 50% 50% auto;
            }
        `,
    ],
})
export class CustomOverlayTestComponent {
    @ViewChild(OverlayComponent) overlay: OverlayComponent;

    config: OverlayCustomConfig = {};
    content: string = 'testing overlay with some big content';
}

@NgModule({
    declarations: [CustomOverlayTestComponent],
    imports: [A11yOverlayModule],
})
export class CustomOverlayTestModule {}

describe('Overlay Component with Default Config', () => {
    let component: CustomOverlayTestComponent;
    let fixture: ComponentFixture<CustomOverlayTestComponent>;
    let DOMHelper: DOMHelperService;

    const openOverlay = (): void => {
        const trigger: HTMLButtonElement = getTrigger().nativeElement;
        trigger.dispatchEvent(new Event('click'));
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
            declarations: [CustomOverlayTestComponent],
            imports: [CustomOverlayTestModule],
            providers: [DOMHelperService],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        DOMHelper = TestBed.inject(DOMHelperService);
        fixture = TestBed.createComponent(CustomOverlayTestComponent);
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(`should check the overlay's visibility on "toggle"`, fakeAsync(() => {
        expect(component.overlay.isVisible).toBe(false);

        component.overlay.toggle();
        tick(component.overlay.fadeMs);

        expect(component.overlay.isVisible).toBe(true);

        component.overlay.toggle();
        tick(component.overlay.fadeMs);

        expect(component.overlay.isVisible).toBe(false);
    }));

    describe(`should check the custom content`, () => {
        it(`should check the custom content not to be defined by default`, () => {
            openOverlay();
            expect(component.overlay.isCustomContentString).toBe(false);
            expect(component.overlay.customContent).toBe(undefined);
        });

        it(`should check the custom content as a string`, () => {
            const customContent: string = 'a new content';

            component.overlay.customContent = customContent;
            openOverlay();

            expect(component.overlay.isCustomContentString).toBe(true);
            expect(getOverlayContent().nativeElement.textContent).toEqual(customContent);
        });
    });

    it(`should have the "${OVERLAY_SELECTOR_BASE}" attribte set`, () => {
        expect(DOMHelper.getAttributeValue(getOverlay().nativeElement, OVERLAY_SELECTOR_BASE)).toEqual('');
    });

    describe('Check the inputs', () => {
        it(`should check "arrowSize"`, () => {
            fixture.detectChanges();
            expect(component.overlay.arrowSize).toEqual(OVERLAY_DEFAULTS.arrowSize);

            const newArrowSize: number = 10;
            component.config = { arrowSize: newArrowSize };
            fixture.detectChanges();

            expect(component.overlay.arrowSize).toEqual(newArrowSize);

            const noArrowSize: number = 0;
            component.config = { arrowSize: noArrowSize };
            fixture.detectChanges();

            expect(component.overlay.arrowSize).toEqual(noArrowSize);

            component.config = { arrowSize: 'some-value' as unknown as number };
            fixture.detectChanges();

            expect(component.overlay.arrowSize).toEqual(OVERLAY_DEFAULTS.arrowSize);
        });

        it(`should check "fadeMs"`, () => {
            fixture.detectChanges();
            expect(component.overlay.fadeMs).toEqual(OVERLAY_DEFAULTS.fadeMs);

            const newFadeMs: number = 10;
            component.config = { fadeMs: newFadeMs };
            fixture.detectChanges();

            expect(component.overlay.fadeMs).toEqual(newFadeMs);

            const noFadeMs: number = 0;
            component.config = { fadeMs: noFadeMs };
            fixture.detectChanges();

            expect(component.overlay.fadeMs).toEqual(noFadeMs);

            component.config = { fadeMs: 'some-value' as unknown as number };
            fixture.detectChanges();

            expect(component.overlay.fadeMs).toEqual(OVERLAY_DEFAULTS.fadeMs);
        });

        it(`should check "fadeDelayMs"`, () => {
            fixture.detectChanges();
            expect(component.overlay.fadeDelayMs).toEqual(OVERLAY_DEFAULTS.fadeDelayMs);

            const newFadeDelayMs: number = 100;
            component.config = { fadeDelayMs: newFadeDelayMs };
            fixture.detectChanges();

            expect(component.overlay.fadeDelayMs).toEqual(newFadeDelayMs);

            const noFadeDelayMs: number = 0;
            component.config = { fadeDelayMs: noFadeDelayMs };
            fixture.detectChanges();

            expect(component.overlay.fadeDelayMs).toEqual(noFadeDelayMs);

            component.config = { fadeDelayMs: 'some-value' as unknown as number };
            fixture.detectChanges();

            expect(component.overlay.fadeDelayMs).toEqual(OVERLAY_DEFAULTS.fadeDelayMs);
        });

        it(`should check "zIndex"`, () => {
            fixture.detectChanges();
            expect(component.overlay.zIndex).toEqual(OVERLAY_DEFAULTS.zIndex);

            const newZIndex: number = 100;
            component.config = { zIndex: newZIndex };
            fixture.detectChanges();

            expect(component.overlay.zIndex).toEqual(newZIndex);

            const noZIndex: number = -1;
            component.config = { zIndex: noZIndex };
            fixture.detectChanges();

            expect(component.overlay.zIndex).toEqual(noZIndex);

            component.config = { zIndex: 'some-value' as unknown as number };
            fixture.detectChanges();

            expect(component.overlay.zIndex).toEqual(OVERLAY_DEFAULTS.zIndex);
        });

        it(`should check "maxWidth"`, () => {
            openOverlay();

            fixture.detectChanges();
            expect(component.overlay.inputMaxWidth).toEqual(OVERLAY_DEFAULTS.maxWidth);

            const newMaxWidth: string = '200px';
            component.config = { maxWidth: newMaxWidth };
            fixture.detectChanges();
            const elementWidth: string = String(DOMHelper.getStyle(getOverlay().nativeElement, 'width'));

            expect(component.overlay.inputMaxWidth).toEqual(newMaxWidth);
            expect(elementWidth).toEqual(newMaxWidth);
        });

        it(`should check "maxHeight"`, () => {
            openOverlay();

            fixture.detectChanges();
            expect(component.overlay.inputMaxHeight).toEqual(OVERLAY_DEFAULTS.maxHeight);

            const newMaxHeight: string = '50px';
            component.config = { maxWidth: '200px', maxHeight: newMaxHeight };
            fixture.detectChanges();
            const elementHeight: string = String(DOMHelper.getStyle(getOverlay().nativeElement, 'height'));

            expect(component.overlay.inputMaxHeight).toEqual(newMaxHeight);
            expect(elementHeight).toEqual(newMaxHeight);
        });

        it(`should check "padding"`, () => {
            const element: DebugElement = getOverlayContent();

            fixture.detectChanges();
            expect(DOMHelper.getStyle(element.nativeElement, 'padding')).toEqual(OVERLAY_DEFAULTS.padding);

            const newPaddingA: number = 1.5;
            const newPaddingB: number = 3;
            const newPadding: string = `${newPaddingA}rem ${newPaddingB}rem`;
            const newPaddingExpect: string = `${newPaddingA * 16}px ${newPaddingB * 16}px`;
            component.config = { padding: newPadding };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'padding')).toEqual(newPaddingExpect);
        });

        it(`should check "backgroundColor"`, () => {
            const element: DebugElement = getOverlayWrapper();

            fixture.detectChanges();
            expect(DOMHelper.getStyle(element.nativeElement, 'backgroundColor')).toEqual('rgba(31, 31, 31, 0.98)');

            component.config = { backgroundColor: 'yellow' };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'backgroundColor')).toEqual('rgb(255, 255, 0)');
        });

        it(`should check "textColor"`, () => {
            const element: DebugElement = getOverlayContent();

            fixture.detectChanges();
            expect(DOMHelper.getStyle(element.nativeElement, 'color')).toEqual('rgb(255, 255, 255)');

            component.config = { textColor: 'red' };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'color')).toEqual('rgb(255, 0, 0)');
        });

        it(`should check "borderSize"`, () => {
            fixture.detectChanges();
            expect(component.overlay.borderSize).toEqual(OVERLAY_DEFAULTS.borderSize);

            const newBorderSize: number = 10;
            component.config = { borderSize: newBorderSize };
            fixture.detectChanges();

            expect(component.overlay.borderSize).toEqual(newBorderSize);

            const noBorderSize: number = 0;
            component.config = { borderSize: noBorderSize };
            fixture.detectChanges();

            expect(component.overlay.borderSize).toEqual(noBorderSize);

            component.config = { borderSize: 'some-value' as unknown as number };
            fixture.detectChanges();

            expect(component.overlay.borderSize).toEqual(OVERLAY_DEFAULTS.borderSize);
        });

        it(`should check "borderColor"`, () => {
            const element: DebugElement = getOverlayWrapper();

            fixture.detectChanges();
            // Coming from ColorScheme library => var(--a11y-border-color) => #666 => rgb(102, 102, 102)
            expect(DOMHelper.getStyle(element.nativeElement, 'borderColor')).toEqual('rgb(102, 102, 102)');

            component.config = { borderColor: 'blue' };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'borderColor')).toEqual('rgb(0, 0, 255)');
        });

        it(`should check "borderRadius"`, () => {
            const element: DebugElement = getOverlayWrapper();

            fixture.detectChanges();
            expect(DOMHelper.getStyle(element.nativeElement, 'borderRadius')).toEqual(
                `${OVERLAY_DEFAULTS.borderRadius}px`
            );

            const newBorderRadius: number = 10;
            component.config = { borderRadius: newBorderRadius };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'borderRadius')).toEqual(`${newBorderRadius}px`);

            const nonBorderRadius: number = 'some-value' as unknown as number;
            component.config = { borderRadius: nonBorderRadius };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'borderRadius')).toEqual('0px');
        });

        it(`should check "shadow" and "shadowColor"`, () => {
            const element: DebugElement = getOverlayWrapper();

            fixture.detectChanges();
            expect(DOMHelper.getStyle(element.nativeElement, 'boxShadow')).toEqual('rgb(68, 68, 68) 5px 5px 10px -5px');

            const newShadow: string = '0 0 5px';
            const newShadowColor: string = 'red';
            component.config = { shadow: newShadow, shadowColor: newShadowColor };
            fixture.detectChanges();

            expect(DOMHelper.getStyle(element.nativeElement, 'boxShadow')).toEqual('rgb(255, 0, 0) 0px 0px 5px 0px');
        });

        describe(`should check "className"`, () => {
            it(`should check "className" as a string`, () => {
                const element: DebugElement = getOverlay();

                fixture.detectChanges();
                expect(Object.keys(element.classes).length).toEqual(1);
                expect(Object.keys(element.classes)[0]).toEqual('');

                const newClassNameString: string = 'my-class';
                component.config = { className: newClassNameString };
                fixture.detectChanges();

                expect(newClassNameString in element.classes).toBe(true);
            });

            it(`should check "className" as an array of strings`, () => {
                const element: DebugElement = getOverlay();

                fixture.detectChanges();
                expect(Object.keys(element.classes).length).toEqual(1);
                expect(Object.keys(element.classes)[0]).toEqual('');

                const newClassNameArray: string[] = ['my-first-class', 'my-second-class'];
                component.config = { className: newClassNameArray };
                fixture.detectChanges();

                expect(Object.keys(element.classes).length).toEqual(2);
                expect(newClassNameArray[0] in element.classes).toBe(true);
                expect(newClassNameArray[1] in element.classes).toBe(true);
            });
        });

        it(`should check "allowClose"`, () => {
            const allowCloseDefault: boolean = OVERLAY_DEFAULTS.allowClose as boolean;

            expect(component.overlay['allowCloseEscape']).toBe(allowCloseDefault);
            expect(component.overlay['allowCloseClickOutside']).toBe(allowCloseDefault);

            component.config = { allowClose: false };
            fixture.detectChanges();

            expect(component.overlay['allowCloseEscape']).toBe(false);
            expect(component.overlay['allowCloseClickOutside']).toBe(false);

            component.config = { allowClose: { escape: false } };
            fixture.detectChanges();

            expect(component.overlay['allowCloseEscape']).toBe(false);
            expect(component.overlay['allowCloseClickOutside']).toBe(allowCloseDefault);

            component.config = { allowClose: { clickOutside: false } };
            fixture.detectChanges();

            expect(component.overlay['allowCloseEscape']).toBe(allowCloseDefault);
            expect(component.overlay['allowCloseClickOutside']).toBe(false);

            component.config = {
                allowClose: {
                    escape: 'some-value' as unknown as boolean,
                    clickOutside: 'some-value' as unknown as boolean,
                },
            };
            fixture.detectChanges();

            expect(component.overlay['allowCloseEscape']).toBe(allowCloseDefault);
            expect(component.overlay['allowCloseClickOutside']).toBe(allowCloseDefault);
        });

        it(`should check "allowTabCycle"`, () => {
            expect(component.overlay['allowTabCycle']).toBe(OVERLAY_DEFAULTS.allowTabCycle);

            component.config = { allowTabCycle: false };
            fixture.detectChanges();

            expect(component.overlay['allowTabCycle']).toBe(false);

            component.config = { allowTabCycle: 'some-value' as unknown as boolean };
            fixture.detectChanges();

            expect(component.overlay['allowTabCycle']).toBe(OVERLAY_DEFAULTS.allowTabCycle);
        });

        it(`should check "firstFocusOn"`, () => {
            expect(component.overlay['firstFocusOn']).toBe(OVERLAY_DEFAULTS.firstFocusOn);

            component.config = { firstFocusOn: 'first' };
            fixture.detectChanges();

            expect(component.overlay['firstFocusOn']).toEqual('first');

            component.config = { firstFocusOn: 'last' };
            fixture.detectChanges();

            expect(component.overlay['firstFocusOn']).toEqual('last');

            component.config = { firstFocusOn: 'some-value' as unknown as 'first' };
            fixture.detectChanges();

            expect(component.overlay['firstFocusOn']).toBe(OVERLAY_DEFAULTS.firstFocusOn);
        });
    });

    describe('Check the reposition', () => {
        const lorem: string = `
            <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Rerum ducimus dicta pariatur quidem doloribus blanditiis ipsum eius, perspiciatis magnam, tenetur quia,
                incidunt eaque inventore explicabo veritatis. Temporibus laudantium consequatur impedit.
            </div>
        `;
        let trigger: HTMLButtonElement;

        beforeEach(() => {
            trigger = getTrigger().nativeElement;
            trigger.style.top = 'unset';
            trigger.style.left = 'unset';
            trigger.style.bottom = 'unset';
            trigger.style.right = 'unset';
        });

        afterEach(() => {
            component.content = 'testing overlay with some big content';
            trigger.style.top = null;
            trigger.style.left = null;
            trigger.style.bottom = null;
            trigger.style.right = null;
        });

        it(`should open on "top-center" by default`, fakeAsync(() => {
            trigger.style.top = '100px';
            trigger.style.left = '200px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('top');
            expect(component.overlay.getCurrentAlignment).toEqual('center');
        }));

        it(`should open on "bottom-start"`, fakeAsync(() => {
            trigger.style.top = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('bottom');
            expect(component.overlay.getCurrentAlignment).toEqual('start');
        }));

        it(`should open on "bottom-center"`, fakeAsync(() => {
            trigger.style.top = '10px';
            trigger.style.left = '200px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('bottom');
            expect(component.overlay.getCurrentAlignment).toEqual('center');
        }));

        it(`should open on "bottom-end"`, fakeAsync(() => {
            trigger.style.top = '10px';
            trigger.style.right = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('bottom');
            expect(component.overlay.getCurrentAlignment).toEqual('end');
        }));

        it(`should open on "top-start"`, fakeAsync(() => {
            trigger.style.bottom = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('top');
            expect(component.overlay.getCurrentAlignment).toEqual('start');
        }));

        it(`should open on "top-end"`, fakeAsync(() => {
            trigger.style.bottom = '10px';
            trigger.style.right = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('top');
            expect(component.overlay.getCurrentAlignment).toEqual('end');
        }));

        it(`should open on "left-center"`, fakeAsync(() => {
            component.content = Array(15).fill(lorem).join('');
            trigger.style.top = '50%';
            trigger.style.right = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('left');
            expect(component.overlay.getCurrentAlignment).toEqual('center');
        }));

        it(`should open on "left-start"`, fakeAsync(() => {
            component.content = Array(25).fill(lorem).join('');
            component.config = {
                maxWidth: `${window.innerWidth - 150}px`,
                maxHeight: `${window.innerHeight - 10}px`,
            };
            trigger.style.top = '10px';
            trigger.style.right = '10px';

            openOverlay();
            tick(250);

            expect(component.overlay.getCurrentPosition).toEqual('left');
            expect(component.overlay.getCurrentAlignment).toEqual('start');
        }));

        it(`should open on "left-end"`, fakeAsync(() => {
            component.content = Array(25).fill(lorem).join('');
            component.config = {
                maxWidth: `${window.innerWidth - 150}px`,
                maxHeight: `${window.innerHeight - 10}px`,
            };
            trigger.style.bottom = '10px';
            trigger.style.right = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('left');
            expect(component.overlay.getCurrentAlignment).toEqual('end');
        }));

        it(`should open on "right-center"`, fakeAsync(() => {
            component.content = Array(15).fill(lorem).join('');
            trigger.style.top = '50%';
            trigger.style.left = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('right');
            expect(component.overlay.getCurrentAlignment).toEqual('center');
        }));

        it(`should open on "right-start"`, fakeAsync(() => {
            component.content = Array(25).fill(lorem).join('');
            component.config = {
                maxWidth: `${window.innerWidth - 150}px`,
                maxHeight: `${window.innerHeight - 10}px`,
            };
            trigger.style.top = '10px';
            trigger.style.left = '10px';

            openOverlay();
            tick(250);

            expect(component.overlay.getCurrentPosition).toEqual('right');
            expect(component.overlay.getCurrentAlignment).toEqual('start');
        }));

        it(`should open on "right-end"`, fakeAsync(() => {
            component.content = Array(25).fill(lorem).join('');
            component.config = {
                maxWidth: `${window.innerWidth - 150}px`,
                maxHeight: `${window.innerHeight - 10}px`,
            };
            trigger.style.bottom = '10px';
            trigger.style.left = '10px';

            openOverlay();
            tick(25);

            expect(component.overlay.getCurrentPosition).toEqual('right');
            expect(component.overlay.getCurrentAlignment).toEqual('end');
        }));
    });

    describe(`Check the opacity when "show()" and "hide()" methods are used`, () => {
        let overlay: HTMLElement;

        const checkOpacity = (): void => {
            const fadeMsTotal: number = component.overlay.fadeDelayMs + component.overlay.fadeMs;

            component.overlay.show();
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(DOMHelper.getStyle(overlay, 'opacity')).toEqual('1');

            component.overlay.hide();
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(DOMHelper.getStyle(overlay, 'opacity')).toEqual('0');
        };

        beforeEach(() => (overlay = getOverlay().nativeElement));

        it(`should check with default values`, fakeAsync(() => {
            checkOpacity();
        }));

        it(`should check with updated "fadeMs" value`, fakeAsync(() => {
            component.config = { fadeMs: 500 };
            fixture.detectChanges();

            checkOpacity();
        }));

        it(`should check with updated "fadeDelayMs" value`, fakeAsync(() => {
            component.config = { fadeDelayMs: 500 };
            fixture.detectChanges();

            checkOpacity();
        }));

        it(`should check with updated "fadeMs" and "fadeDelayMs" values`, fakeAsync(() => {
            component.config = { fadeMs: 100, fadeDelayMs: 250 };
            fixture.detectChanges();

            checkOpacity();
        }));
    });

    describe(`Check the outputs`, () => {
        let fadeMsTotal: number;

        beforeEach(() => {
            fadeMsTotal = component.overlay.fadeDelayMs + component.overlay.fadeMs;
        });

        it(`should emit the "overlayOpen" and "overlayToggle" when opens`, fakeAsync(() => {
            const spyOnOpen = spyOn(component.overlay.overlayOpen, 'emit');
            const spyOnClose = spyOn(component.overlay.overlayClose, 'emit');
            const spyOnToggle = spyOn(component.overlay.overlayToggle, 'emit');

            component.overlay.show();
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(spyOnOpen).toHaveBeenCalled();
            expect(spyOnToggle).toHaveBeenCalledWith('open');

            expect(spyOnClose).not.toHaveBeenCalled();
        }));

        it(`should emit the "overlayClose" and "overlayToggle" when closes`, fakeAsync(() => {
            const spyOnClose = spyOn(component.overlay.overlayClose, 'emit');
            const spyOnToggle = spyOn(component.overlay.overlayToggle, 'emit');

            component.overlay.show();
            tick(fadeMsTotal);
            fixture.detectChanges();

            component.overlay.hide();
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(spyOnClose).toHaveBeenCalled();
            expect(spyOnToggle).toHaveBeenCalledWith('close');
        }));

        it(`should not emit the "overlayClose" or "overlayToggle" when asking to close without being open`, () => {
            const spyOnClose = spyOn(component.overlay.overlayClose, 'emit');
            const spyOnToggle = spyOn(component.overlay.overlayToggle, 'emit');

            component.overlay.hide();
            fixture.detectChanges();

            expect(spyOnClose).not.toHaveBeenCalled();
            expect(spyOnToggle).not.toHaveBeenCalled();
        });
    });

    describe(`Check the Close on Click Outside`, () => {
        let fadeMsTotal: number;
        let overlay: HTMLElement;
        let overlayRect: DOMRect;

        beforeEach(() => {
            fadeMsTotal = component.overlay.fadeDelayMs + component.overlay.fadeMs;
            overlay = getOverlay().nativeElement;
        });

        it(`should close when clicking outside the overlay`, fakeAsync(() => {
            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            overlayRect = overlay.getBoundingClientRect();

            document.dispatchEvent(
                new PointerEvent('click', {
                    clientX: overlayRect.x - 10,
                    clientY: overlayRect.y - 10,
                })
            );
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(false);
        }));

        it(`should not close when clicking inside the overlay`, fakeAsync(() => {
            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            overlayRect = overlay.getBoundingClientRect();

            fixture.debugElement.nativeElement.dispatchEvent(
                new PointerEvent('click', {
                    clientX: overlayRect.x + 10,
                    clientY: overlayRect.y + 10,
                })
            );
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(true);
        }));

        it(`should not close when clicking outside the overlay and "allowClose.clickOutside" was set to "false"`, fakeAsync(() => {
            component.config = { allowClose: { clickOutside: false } };

            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            overlayRect = overlay.getBoundingClientRect();

            document.dispatchEvent(
                new PointerEvent('click', {
                    clientX: overlayRect.x - 10,
                    clientY: overlayRect.y - 10,
                })
            );
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(true);
        }));
    });

    describe(`Check the Close on Escape`, () => {
        let fadeMsTotal: number;
        let overlay: HTMLElement;
        const ESC_KEY_EVENT: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Escape' });

        beforeEach(() => {
            fadeMsTotal = component.overlay.fadeDelayMs + component.overlay.fadeMs;
            overlay = getOverlay().nativeElement;
        });

        it(`should close when pressing the Escape key on the overlay by default`, fakeAsync(() => {
            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            overlay.dispatchEvent(ESC_KEY_EVENT);
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(false);
        }));

        it(`should not close when pressing the Escape key on the overlay and "allowClose.escape" was set to "false"`, fakeAsync(() => {
            component.config = { allowClose: { escape: false } };

            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            overlay.dispatchEvent(ESC_KEY_EVENT);
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(true);
        }));

        it(`should close when pressing the Escape key on the trigger and "allowTabCycle" was set to "false"`, fakeAsync(() => {
            component.config = { allowTabCycle: false };

            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            getTrigger().nativeElement.dispatchEvent(ESC_KEY_EVENT);
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(false);
        }));

        it(`should not close when pressing the Escape key on the trigger by default`, fakeAsync(() => {
            openOverlay();
            tick(fadeMsTotal);
            fixture.detectChanges();

            getTrigger().nativeElement.dispatchEvent(ESC_KEY_EVENT);
            tick(fadeMsTotal);
            fixture.detectChanges();

            expect(component.overlay.isVisible).toBe(true);
        }));
    });
});
