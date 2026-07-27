import { TestBed } from '@angular/core/testing';

import { MenuPrivateService } from './menu.service.private';
import { MobileService } from './mobile/mobile.service';

import { WINDOW } from './menu.module.providers.private';
import { MenuTooltipComponent } from './components/menu-tooltip.component';
import type { MenuAnimateType } from './menu.type.private';

describe('MenuPrivateService', () => {
    let service: MenuPrivateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MenuPrivateService);
    });

    describe(`Window's navigator (SSR)`, () => {
        it('should fallback to null and set isMac to false if window is NOT defined', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [MenuPrivateService, { provide: WINDOW, useValue: null }] });
            service = TestBed.inject(MenuPrivateService);

            expect(service['isMac']).toBeFalse();
        });

        it('should fallback to empty string and set isMac to false if navigator is undefined', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [MenuPrivateService, { provide: WINDOW, useValue: {} }] });
            service = TestBed.inject(MenuPrivateService);

            expect(service['isMac']).toBeFalse();
        });
    });

    describe('"processShortcut()" method', () => {
        it('should abort when is mobile environment', () => {
            const serviceMobile = TestBed.inject(MobileService);
            serviceMobile['isMobileBreakpoint'] = true;

            const shortcut = service.processShortcut({ key: 'S' });
            expect(shortcut).toBeUndefined();
        });

        it('should abort when NO shortcut is provided', () => {
            const shortcut = service.processShortcut(undefined);
            expect(shortcut).toBeUndefined();
        });

        it('should abort when the key has NO length', () => {
            const shortcut = service.processShortcut({ key: '' });
            expect(shortcut).toBeUndefined();
        });

        it('should return "Enter" when key was provided with "enter"', () => {
            const shortcut = service.processShortcut({ key: 'enter', ctrlCmd: true });
            expect(shortcut).toEqual({ aria: 'Ctrl+Enter', visual: 'Ctrl+Enter' });
        });

        it('should return "Space" when key was provided with "space"', () => {
            const shortcut = service.processShortcut({ key: 'space', ctrlCmd: true });
            expect(shortcut).toEqual({ aria: 'Ctrl+Space', visual: 'Ctrl+Space' });
        });

        it('should return "Space" when key was provided with "space"', () => {
            const shortcut = service.processShortcut({ key: 'space', ctrlCmd: true });
            expect(shortcut).toEqual({ aria: 'Ctrl+Space', visual: 'Ctrl+Space' });
        });

        it('should return the full word for the key when provided', () => {
            const shortcut = service.processShortcut({ key: 'Del', keyLabel: 'Delete' });
            expect(shortcut).toEqual({ aria: 'Delete', visual: 'Del' });
        });

        describe('on Windows/Linux environments', () => {
            it('should return the bare key if no modifiers are active', () => {
                const shortcut = service.processShortcut({ key: 's' });
                expect(shortcut).toEqual({ aria: 'S', visual: 'S' });
            });

            it('should prepend "Ctrl+" when the control modifier is true', () => {
                const shortcut = service.processShortcut({ key: 's', ctrlCmd: true });
                expect(shortcut).toEqual({ aria: 'Ctrl+S', visual: 'Ctrl+S' });
            });

            it('should prepend "Alt+" when the alt modifier is true', () => {
                const shortcut = service.processShortcut({ key: 'm', alt: true });
                expect(shortcut).toEqual({ aria: 'Alt+M', visual: 'Alt+M' });
            });

            it('should prepend "Shift+" when the shift modifier is true', () => {
                const shortcut = service.processShortcut({ key: 'T', shift: true });
                expect(shortcut).toEqual({ aria: 'Shift+T', visual: 'Shift+T' });
            });

            it('should combine multiple modifiers in the correct order (e.g., Ctrl+Alt+Shift+Key)', () => {
                const shortcut = service.processShortcut({ key: 'h', ctrlCmd: true, alt: true, shift: true });
                expect(shortcut).toEqual({ aria: 'Ctrl+Alt+Shift+H', visual: 'Ctrl+Alt+Shift+H' });
            });
        });

        describe('on Mac environment', () => {
            beforeEach(() => Object.defineProperty(service, 'isMac', { get: () => true }));

            it('should translate the "Ctrl" modifier to "⌘"', () => {
                const shortcut = service.processShortcut({ key: 's', ctrlCmd: true });
                expect(shortcut).toEqual({ aria: 'Meta+S', visual: '⌘S' });
            });

            it('should translate the "Alt" modifier to "⌥"', () => {
                const shortcut = service.processShortcut({ key: 'm', alt: true });
                expect(shortcut).toEqual({ aria: 'Alt+M', visual: '⌥M' });
            });

            it('should translate the "Shift" modifier to "⇧"', () => {
                const shortcut = service.processShortcut({ key: 'J', shift: true });
                expect(shortcut).toEqual({ aria: 'Shift+J', visual: '⇧J' });
            });

            it('should format multiple modifiers using macOS conventions', () => {
                const shortcut = service.processShortcut({ key: 'h', ctrlCmd: true, alt: true, shift: true });
                expect(shortcut).toEqual({ aria: 'Meta+Alt+Shift+H', visual: '⌘⌥⇧H' });
            });
        });
    });

    describe('"oppositeAnimation()" method', () => {
        const testCases: { input: MenuAnimateType; expected: MenuAnimateType }[] = [
            { input: 'top-bottom', expected: 'bottom-top' },
            { input: 'bottom-top', expected: 'top-bottom' },
            { input: 'left-right', expected: 'right-left' },
            { input: 'right-left', expected: 'left-right' },
            { input: 'scale-up', expected: 'scale-down' },
            { input: 'scale-down', expected: 'scale-up' },
            { input: 'none', expected: 'none' },
        ];

        testCases.forEach(({ input, expected }) => {
            it(`should return "${expected}" when input is "${input}"`, () => {
                expect(service.oppositeAnimation(input)).toBe(expected);
            });
        });
    });

    describe('"getMenuComputedStyles()" method', () => {
        const borderWidth = '2px';
        const paddingTop = '10px';
        const paddingBottom = '11px';
        const paddingLeft = '5px';
        const paddingRight = '2px';

        let menu: HTMLDivElement;

        beforeEach(() => {
            menu = document.createElement('div');
            menu.style.borderWidth = borderWidth;
            menu.style.borderStyle = 'solid';
            menu.style.borderColor = '#000';
            menu.style.paddingTop = paddingTop;
            menu.style.paddingBottom = paddingBottom;
            menu.style.paddingLeft = paddingLeft;
            menu.style.paddingRight = paddingRight;

            document.body.appendChild(menu);
        });

        afterEach(() => menu.remove());

        it('should calculate and return styles on the first call', () => {
            const menuStyles = service.getMenuComputedStyles(menu);
            expect(menuStyles).toEqual({ borderWidth, paddingTop, paddingBottom, paddingLeft, paddingRight });
        });

        it('should return cached styles on subsequent calls without recalculating', () => {
            spyOn(window, 'getComputedStyle').and.callThrough();

            service.getMenuComputedStyles(menu);
            const menuStyles = service.getMenuComputedStyles(menu);
            expect(menuStyles).toEqual({ borderWidth, paddingTop, paddingBottom, paddingLeft, paddingRight });
            expect(window.getComputedStyle).toHaveBeenCalledTimes(1);
        });

        it('should reset the saved styles when calling "resetMenuComputedStyles()"', () => {
            service.getMenuComputedStyles(menu);
            expect(service['menuStyles']).not.toBeUndefined();

            service.resetMenuComputedStyles();
            expect(service['menuStyles']).toBeUndefined();
        });
    });

    describe('"createTooltip()" method', () => {
        let button: HTMLButtonElement;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ declarations: [MenuTooltipComponent] });
            service = TestBed.inject(MenuPrivateService);

            button = document.createElement('button');
            button.innerText = 'trigger';
            document.body.appendChild(button);
        });

        afterEach(() => button.remove());

        it('should create the tooltip component with the provided text', () => {
            const tooltipRef = service.createTooltip(button, 'some text', 'bottom-start');
            tooltipRef.changeDetectorRef.detectChanges();

            const tooltipEl: Element | null = document.body.querySelector('a11y-menu-tooltip');
            const shortcutEl: Element | null = tooltipEl?.querySelector('[menu-item-shortcut]') ?? null;

            expect(shortcutEl).toBeFalsy();

            expect(tooltipEl).toBeTruthy();
            expect(tooltipEl?.textContent?.trim()).toEqual('some text');
        });

        it('should create the tooltip component with the provided text and shortcut', () => {
            const tooltipRef = service.createTooltip(button, 'some text', 'top', { aria: '', visual: 'Ctrl+S' });
            tooltipRef.changeDetectorRef.detectChanges();

            const tooltipEl: Element | null = document.body.querySelector('a11y-menu-tooltip');
            const shortcutEl: Element | null = tooltipEl?.querySelector('[menu-item-shortcut]') ?? null;

            expect(shortcutEl).toBeTruthy();
            expect(shortcutEl?.textContent?.trim()).toEqual('Ctrl+S');
        });
    });
});
