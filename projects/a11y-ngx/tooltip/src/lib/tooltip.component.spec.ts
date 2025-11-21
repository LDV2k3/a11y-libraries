import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, NgModule, ViewChildren, QueryList } from '@angular/core';
import { forceElementsCleanup, forceStylesCleanup } from '../test';

import { DOMHelperService } from '@a11y-ngx/dom-helper';
import { A11yResponsiveImageMapsModule } from '@a11y-ngx/responsive-image-maps';

import { A11yTooltipModule } from './tooltip.module';
import { TooltipDirective } from './tooltip.directive';

import { TooltipConfig } from './tooltip.type';
import { TOOLTIP_CONFIG as CONFIG, TOOLTIP_TOUCH_DELAY } from './tooltip.type.private';

const tooltipText: string = 'My tooltip in a button';

@Component({
    selector: 'a11y-test-tooltip-component',
    template: `
        <button type="button" [tooltip]="tooltip" [tooltipConfig]="config">trigger</button>
        <abbr title="HyperText Markup Language">HTML</abbr>
        <em tooltip="Emphasis tooltip" [tooltipConfig]="config">Emphasis Element</em>
        <img tooltip="Image tooltip" [tooltipConfig]="config" width="5" height="5" />
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
export class CustomTooltipTestComponent {
    config: Partial<TooltipConfig> = {};
    readonly tooltip: string = tooltipText;
}

@NgModule({
    declarations: [CustomTooltipTestComponent],
    imports: [A11yTooltipModule],
})
export class CustomTooltipTestModule {}

describe('Tooltip Component', () => {
    let component: CustomTooltipTestComponent;
    let fixture: ComponentFixture<CustomTooltipTestComponent>;
    let DOMHelper: DOMHelperService;

    const showCloseDelayMs = (delayMs: number = CONFIG.fadeDelayMs): number => delayMs + CONFIG.fadeMs;

    const getTooltip = (): HTMLElement | null => document.querySelector('a11y-tooltip');

    const getAbbr = (): HTMLElement => fixture.debugElement.query(By.css('abbr')).nativeElement;

    const getEmphasis = (): HTMLElement => fixture.debugElement.query(By.css('em')).nativeElement;

    const getImage = (): HTMLElement => fixture.debugElement.query(By.css('img')).nativeElement;

    const getTrigger = (): HTMLElement => fixture.debugElement.query(By.css('button')).nativeElement;

    const mouseEnterTrigger = (): boolean =>
        getTrigger().dispatchEvent(new MouseEvent('mouseenter', { clientX: 5, clientY: 5 }));

    const mouseLeaveTrigger = (): boolean =>
        getTrigger().dispatchEvent(new MouseEvent('mouseleave', { clientX: -50, clientY: -50 }));

    const focusTrigger = (): boolean => getTrigger().dispatchEvent(new KeyboardEvent('focus'));

    const blurTrigger = (): boolean => getTrigger().dispatchEvent(new KeyboardEvent('blur'));

    const touchTrigger = (waitMs: number = TOOLTIP_TOUCH_DELAY): void => {
        const trigger: HTMLElement = getTrigger();

        const touch: Touch = new Touch({
            identifier: Date.now(),
            target: trigger,
            clientX: 50,
            clientY: 50,
        });

        trigger.dispatchEvent(
            new TouchEvent('touchstart', {
                touches: [touch],
                bubbles: true,
            })
        );

        tick(waitMs);

        trigger.dispatchEvent(
            new TouchEvent('touchend', {
                changedTouches: [touch],
                bubbles: true,
            })
        );
    };

    const touchOutsideTrigger = (): void => {
        const outsideTouch: Touch = new Touch({
            identifier: Date.now(),
            target: document.body,
            clientX: 50,
            clientY: 50,
        });

        document.dispatchEvent(
            new TouchEvent('touchstart', {
                touches: [outsideTouch],
                bubbles: true,
            })
        );
    };

    const mouseEnterTooltip = (): boolean =>
        getTooltip().dispatchEvent(new MouseEvent('mouseenter', { clientX: 5, clientY: 5 }));

    const mouseLeaveTooltip = (): boolean =>
        getTooltip().dispatchEvent(new MouseEvent('mouseleave', { clientX: -50, clientY: -50 }));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomTooltipTestComponent],
            imports: [CustomTooltipTestModule],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        DOMHelper = TestBed.inject(DOMHelperService);
        fixture = TestBed.createComponent(CustomTooltipTestComponent);
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

    describe(`should check open/close behavior`, () => {
        it(`should open the tooltip on mouseenter`, fakeAsync(() => {
            expect(getTooltip()).toBe(null);

            mouseEnterTrigger();
            tick(showCloseDelayMs());

            expect(getTooltip()).not.toBe(null);
        }));

        it(`should close the tooltip on mouseleave`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).not.toBe(null);

            mouseLeaveTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).toBe(null);
        }));

        it(`should open the tooltip on focus`, fakeAsync(() => {
            expect(getTooltip()).toBe(null);

            focusTrigger();
            tick(showCloseDelayMs());

            expect(getTooltip()).not.toBe(null);
        }));

        it(`should close the tooltip on blur`, fakeAsync(() => {
            focusTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).not.toBe(null);

            blurTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).toBe(null);
        }));

        it(`should open the tooltip on touch`, fakeAsync(() => {
            expect(getTooltip()).toBe(null);

            touchTrigger();
            tick(showCloseDelayMs());

            expect(getTooltip()).not.toBe(null);
        }));

        it(`should close the tooltip on touch outside`, fakeAsync(() => {
            touchTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).not.toBe(null);

            touchOutsideTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).toBe(null);
        }));

        it(`should open the tooltip on mouseenter and remain visible when hover over the tooltip`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(getTooltip()).not.toBe(null);

            mouseLeaveTrigger();
            tick(showCloseDelayMs() / 2);

            mouseEnterTooltip();
            tick(100);
            expect(getTooltip()).not.toBe(null);

            mouseLeaveTooltip();
            tick(showCloseDelayMs());
            expect(getTooltip()).toBe(null);
        }));
    });

    describe(`should check the tooltip's attributes`, () => {
        it(`should have the role="tooltip" attribute`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.getAttributeValue(getTooltip(), 'role')).toEqual('tooltip');
        }));

        it(`should have the aria-hidden="true" attribute`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.isAriaHidden(getTooltip())).toBe(true);
        }));

        it(`should have the "id" attribute`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'id')).toBe(true);
        }));

        it(`should not have the "use-bs" attribute and the "tooltip" class by default`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'use-bs')).toBe(false);
            expect(getTooltip().classList.contains('tooltip')).toBe(false);
        }));

        it(`should have the "use-bs" and the "tooltip" class attribute`, fakeAsync(() => {
            component.config = { useBootstrapStyles: true };

            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'use-bs')).toBe(true);
            expect(getTooltip().classList.contains('tooltip')).toBe(true);
        }));

        it(`should have the "animate" attribute by default`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'animate')).toBe(true);
        }));

        it(`should not have the "animate" attribute`, fakeAsync(() => {
            component.config = { animate: false };
            fixture.detectChanges();

            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'animate')).toBe(false);
        }));

        it(`should have only the "top" attribute by default`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'top')).toBe(true);
            expect(DOMHelper.hasAttribute(getTooltip(), 'bottom')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'left')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'right')).toBe(false);
        }));

        it(`should have only the "bottom" attribute`, fakeAsync(() => {
            component.config = { position: 'bottom' };
            fixture.detectChanges();

            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'top')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'bottom')).toBe(true);
            expect(DOMHelper.hasAttribute(getTooltip(), 'left')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'right')).toBe(false);
        }));

        it(`should have only the "left" attribute`, fakeAsync(() => {
            component.config = { position: 'left' };
            fixture.detectChanges();

            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'top')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'bottom')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'left')).toBe(true);
            expect(DOMHelper.hasAttribute(getTooltip(), 'right')).toBe(false);
        }));

        it(`should have only the "right" attribute`, fakeAsync(() => {
            component.config = { position: 'right' };
            fixture.detectChanges();

            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'top')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'bottom')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'left')).toBe(false);
            expect(DOMHelper.hasAttribute(getTooltip(), 'right')).toBe(true);
        }));
    });

    describe(`should check the tooltip's ARIA association`, () => {
        it(`should not have the "aria-describedby" attribute on mouseenter`, fakeAsync(() => {
            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'aria-describedby')).toBe(false);
        }));

        it(`should have the "aria-describedby" attribute on focus and remove it on blur`, fakeAsync(() => {
            getTrigger().focus();
            focusTrigger();
            tick(showCloseDelayMs());
            const tooltipId: string | null = DOMHelper.getAttributeValue(getTooltip(), 'id');
            expect(DOMHelper.getAttributeValue(getTrigger(), 'aria-describedby')).toEqual(tooltipId);

            document.body.focus();
            blurTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTrigger(), 'aria-describedby')).toBe(false);
        }));

        it(`should not have the "aria-describedby" attribute when inner text equals tooltip text on focus`, fakeAsync(() => {
            getTrigger().innerText = tooltipText;
            getTrigger().focus();
            focusTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.hasAttribute(getTooltip(), 'aria-describedby')).toBe(false);
        }));

        it(`should have the "aria-label" attribute with the same tooltip text`, fakeAsync(() => {
            getTrigger().innerText = '';
            component.config = { asLabel: true };
            fixture.detectChanges();

            mouseEnterTrigger();
            tick(showCloseDelayMs());
            expect(DOMHelper.getAttributeValue(getTrigger(), 'aria-label')).toEqual(tooltipText);
        }));
    });

    describe(`should check the tooltip for the <abbr>`, () => {
        it(`should have the visually hidden element created right after the <abbr>`, () => {
            const visuallyHiddenEl: HTMLElement | null = document.querySelector('abbr + a11y-sr-only');
            expect(visuallyHiddenEl).not.toBe(null);
            expect(visuallyHiddenEl.textContent).toEqual('(HyperText Markup Language)');
        });

        it(`should have the "title" attribute empty`, () => {
            expect(DOMHelper.hasAttribute(getAbbr(), 'title')).toBe(true);
            expect(DOMHelper.getAttributeValue(getAbbr(), 'title')).toEqual('');
        });
    });

    describe(`should check the tooltip for the <em>`, () => {
        it(`should have the visually hidden element created right after the <em>`, () => {
            const visuallyHiddenEl: HTMLElement | null = document.querySelector('em + a11y-sr-only');
            expect(visuallyHiddenEl).not.toBe(null);
            expect(visuallyHiddenEl.textContent).toEqual('(Emphasis tooltip)');
        });

        it(`should not have the "title" attribute`, () => {
            expect(DOMHelper.hasAttribute(getEmphasis(), 'title')).toBe(false);
        });

        it(`should not have the "aria-label" attribute even if forcing when use asLabel`, () => {
            component.config = { asLabel: true };
            fixture.detectChanges();
            expect(DOMHelper.hasAttribute(getEmphasis(), 'aria-label')).toBe(false);
        });
    });

    describe(`should check the tooltip for the <img>`, () => {
        it(`should not have the "aria-label" attribute when use asLabel`, () => {
            component.config = { asLabel: true };
            fixture.detectChanges();
            expect(DOMHelper.hasAttribute(getImage(), 'aria-label')).toBe(false);
        });

        it(`should have the "alt" attribute`, () => {
            expect(DOMHelper.getAttributeValue(getImage(), 'alt')).toEqual('Image tooltip');
        });
    });
});

// Image Area Directive Testing

@Component({
    selector: 'a11y-test-tooltip-with-image-area-installed-component',
    template: `
        <img src="https://www.w3schools.com/html/workplace.jpg" alt="" usemap="#image-map" />

        <map name="image-map">
            <area tooltip="Monitor" href="" coords="322,114,359,370" shape="rect" />
            <area tooltip="Laptop" href="" coords="17,338,75,527" shape="rect" />
        </map>
    `,
    styles: [
        `
            img {
                position: fixed;
                inset: auto 50% 50% auto;
                width: 50%;
                height: auto;
            }
        `,
    ],
})
export class CustomTooltipAreaTestComponent {
    @ViewChildren(TooltipDirective) readonly tooltips: QueryList<TooltipDirective>;
}

@NgModule({
    declarations: [CustomTooltipAreaTestComponent],
    imports: [A11yTooltipModule, A11yResponsiveImageMapsModule],
})
export class CustomTooltipAreaTestModule {}

describe('Tooltip Component on Image Area with ResponsiveImageMap Installed', () => {
    let component: CustomTooltipAreaTestComponent;
    let fixture: ComponentFixture<CustomTooltipAreaTestComponent>;

    const showCloseDelayMs: number = CONFIG.fadeDelayMs + CONFIG.fadeMs;
    const getTrigger = (idx: number): HTMLElement => fixture.debugElement.queryAll(By.css('area'))[idx].nativeElement;
    const focusTrigger = (idx: number): boolean => getTrigger(idx).dispatchEvent(new KeyboardEvent('focus'));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomTooltipAreaTestComponent],
            imports: [CustomTooltipAreaTestModule],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        fixture = TestBed.createComponent(CustomTooltipAreaTestComponent);
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

    it('should have the image area defined as DOMRect', fakeAsync(() => {
        getTrigger(0).focus();
        focusTrigger(0);
        tick(showCloseDelayMs);

        const tooltipImageArea: DOMRect | undefined = component.tooltips.get(0)['service']['tooltipImageArea'];

        expect(tooltipImageArea instanceof DOMRect).toBe(true);
        expect(tooltipImageArea).not.toBe(undefined);
    }));
});

@Component({
    selector: 'a11y-test-tooltip-with-no-image-area-installed-component',
    template: `
        <img src="https://www.w3schools.com/html/workplace.jpg" alt="" usemap="#image-map" />

        <map name="image-map">
            <area tooltip="Monitor" href="" coords="322,114,359,370" shape="rect" />
            <area tooltip="Laptop" href="" coords="17,338,75,527" shape="rect" />
        </map>
    `,
    styles: [
        `
            img {
                position: fixed;
                inset: auto 50% 50% auto;
                width: 50%;
                height: auto;
            }
        `,
    ],
})
export class CustomTooltipAreaInstalledTestComponent {
    @ViewChildren(TooltipDirective) readonly tooltips: QueryList<TooltipDirective>;
}

@NgModule({
    declarations: [CustomTooltipAreaInstalledTestComponent],
    imports: [A11yTooltipModule],
})
export class CustomTooltipAreaInstalledTestModule {}

describe('Tooltip Component on Image Area with ResponsiveImageMap not Installed', () => {
    let component: CustomTooltipAreaInstalledTestComponent;
    let fixture: ComponentFixture<CustomTooltipAreaInstalledTestComponent>;

    const showCloseDelayMs: number = CONFIG.fadeDelayMs + CONFIG.fadeMs;
    const getTrigger = (idx: number): HTMLElement => fixture.debugElement.queryAll(By.css('area'))[idx].nativeElement;
    const focusTrigger = (idx: number): boolean => getTrigger(idx).dispatchEvent(new KeyboardEvent('focus'));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomTooltipAreaInstalledTestComponent],
            imports: [CustomTooltipAreaInstalledTestModule],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        }).compileComponents();

        fixture = TestBed.createComponent(CustomTooltipAreaInstalledTestComponent);
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

    it('should have the image area not defined', fakeAsync(() => {
        getTrigger(0).focus();
        focusTrigger(0);
        tick(showCloseDelayMs);

        const tooltipImageArea: DOMRect | undefined = component.tooltips.get(0)['service']['tooltipImageArea'];

        expect(tooltipImageArea instanceof DOMRect).toBe(false);
        expect(tooltipImageArea).toBe(undefined);
    }));
});
