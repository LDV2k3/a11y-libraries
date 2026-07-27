import { TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { NgModule, Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KeyboardNavigationService } from '@a11y-ngx/keyboard-navigation';
import { IconComponent } from '@a11y-ngx/icon';

import { MenuService } from '../menu.service';

import { MenuComponent } from './menu.component';
import { MenuItemComponent } from './menu-item.component';
import { MenuItemInfoComponent } from './menu-item-info.component';
import { MenuItemCheckComponent } from './menu-item-check.component';
import { MenuGroupStackComponent } from './menu-group-stack.component';
import { MenuGroupInlineComponent } from './menu-group-inline.component';
import { MenuSeparatorComponent } from './menu-separator.component';

import type { MenuAnimateType, MenuMainConfig } from '../menu.type.private';
import type { Menu } from '../menu.type';

@Component({
    template: `
        <button type="button" #trigger>trigger</button>
        <a11y-menu *ngIf="showMenu" [menuItems]="items" [menuPath]="path" [menuLabel]="label"></a11y-menu>
    `,
    providers: [KeyboardNavigationService],
    styles: [
        `
            button {
                position: fixed;
                inset: 45% auto auto 45%;
            }
        `,
    ],
})
class MenuTestComponent {
    showMenu: boolean = false;

    items: Menu = [];
    path: number[] = [];
    label: string | undefined = undefined;

    @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLButtonElement>;
    @ViewChild(MenuComponent) menu!: MenuComponent;
}

@NgModule({
    declarations: [
        MenuTestComponent,
        // Dependencies of the MenuComponent
        MenuComponent,
        MenuItemComponent,
        MenuItemInfoComponent,
        MenuGroupStackComponent,
        MenuGroupInlineComponent,
        MenuItemCheckComponent,
        MenuSeparatorComponent,
        IconComponent,
    ],
    imports: [CommonModule],
})
class MenuTestModule {}

describe('MenuComponent', () => {
    let component: MenuTestComponent;
    let fixture: ComponentFixture<MenuTestComponent>;
    let service: MenuService;

    let menu: HTMLElement;

    const getTrigger = (): HTMLButtonElement => component.trigger.nativeElement;

    const setItems = (items: Menu): void => {
        component.items = items;
        fixture.detectChanges();
    };

    const setConfig = (config: Partial<MenuMainConfig> = {}): void => {
        service.initRootMenuData(new DOMRect(400, 400), [], 'menu-selector', config);
    };

    const setMobile = (isMobile: boolean): void => {
        service['mobileService']['isMobileBreakpoint'] = isMobile;
    };

    const openMenu = (forceFlush: boolean = true): void => {
        component.showMenu = true;
        try {
            fixture.detectChanges(); // To fix NG0100: ExpressionChangedAfterItHasBeenCheckedError:
        } catch (e) {
            // to shut up linter
        }
        fixture.detectChanges();
        component.menu.setBaseConfig({ trigger: getTrigger() });
        component.menu.ngOnInit();
        menu = component.menu.nativeElement;
        if (forceFlush) flush();
    };

    const wheel = (element: HTMLElement, evt: WheelEvent): void => {
        element.dispatchEvent(evt);
        flush();
        tick(16);
    };

    // Custom wrapper to auto-flush timers
    const autoFlush = (testFn: () => void | Promise<void>) => {
        return fakeAsync(() => {
            testFn();
            tick(16);
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [MenuTestModule] });

        fixture = TestBed.createComponent(MenuTestComponent);
        service = TestBed.inject(MenuService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Host Attributes', () => {
        beforeEach(() => setItems([{ label: 'item1' }]));

        it(
            'should have the basic attributes if device is desktop',
            autoFlush(() => {
                setConfig({ className: 'cool-menu' });
                openMenu();

                component.label = 'some label';
                fixture.detectChanges();

                expect(menu.getAttribute('role')).toEqual('menu');
                expect(menu.getAttribute('tabindex')).toEqual('-1');
                const classNames = menu.getAttribute('class');
                expect(classNames).toContain('a11y-menu');
                expect(classNames).toContain('a11y-theme');
                expect(classNames).toContain('a11y-scrollbar');
                expect(classNames).toContain('cool-menu');
                expect(menu.getAttribute('id')).toContain(`a11y-menu-${component.menu.uid}`);
                expect(menu.getAttribute('aria-label')).toContain('some label');
                expect(menu.getAttribute('aria-hidden')).toBeNull();
                expect(menu.getAttribute('mobile')).toBeNull();
            })
        );

        it(
            'should have the basic attributes if device is mobile',
            autoFlush(() => {
                setMobile(true);
                openMenu();

                expect(menu.getAttribute('id')).toContain(`a11y-menu-${component.menu.uid}`);
                expect(menu.getAttribute('mobile')).toEqual('');
            })
        );
    });

    describe('Animations', () => {
        beforeEach(() => setItems([{ label: 'item1' }]));

        type TestAnimate = MenuAnimateType | 'mobile';

        const commonAnimateExpect = (entry: TestAnimate, exit: TestAnimate): void => {
            const checkAnimateAttr = (val: TestAnimate): void => {
                if (val === 'none') expect(menu.getAttribute('animate')).toBeNull();
                else expect(menu.getAttribute('animate')).toEqual(val);
            };

            tick(5);
            fixture.detectChanges();
            checkAnimateAttr(entry);

            const addTimerMs: number = entry.startsWith('scale') ? service.config.animateMs : 0;
            tick(5 + addTimerMs);
            fixture.detectChanges();
            expect(menu.getAttribute('animate')).toBeNull();

            component.menu.closeMenu();
            fixture.detectChanges();
            checkAnimateAttr(exit);
        };

        it(
            'should NOT have the "animate" attribute set',
            autoFlush(() => {
                openMenu(false);

                tick(10);
                fixture.detectChanges();
                expect(menu.getAttribute('animate')).toBeNull();

                flush();
                expect(menu.getAttribute('animate')).toBeNull();
                fixture.detectChanges();
            })
        );

        describe('Automatic Opposites', () => {
            it(
                'should have the "animate" attribute set with "top-bottom" when open and its opposite "bottom-top" when close',
                autoFlush(() => {
                    setConfig({ animate: 'top-bottom' });
                    openMenu(false);
                    commonAnimateExpect('top-bottom', 'bottom-top');
                })
            );

            it(
                'should have the "animate" attribute set with "right-left" when open and its opposite "left-right" when close',
                autoFlush(() => {
                    setConfig({ animate: 'right-left' });
                    openMenu(false);
                    commonAnimateExpect('right-left', 'left-right');
                })
            );
        });

        describe('Custom In & Out', () => {
            it(
                'should have the "animate" attribute set with "bottom-top" when open and the opposite of the defined "right-left" (aka "left-right") when close',
                autoFlush(() => {
                    setConfig({ animate: { in: 'bottom-top', out: 'right-left' } });
                    openMenu(false);
                    commonAnimateExpect('bottom-top', 'left-right');
                })
            );

            it(
                'should NOW have the "animate" attribute set when open and set the opposite of the defined "bottom-top" (aka "top-bottom") when close',
                autoFlush(() => {
                    setConfig({ animate: { in: 'none', out: 'bottom-top' } });
                    openMenu(false);
                    commonAnimateExpect('none', 'top-bottom');
                })
            );
        });

        describe('Scaling', () => {
            it(
                'should have the "animate" attribute set with "scale-down" when open and its opposite "scale-up" when close',
                autoFlush(() => {
                    setConfig({ animate: 'scale-down' });
                    openMenu(false);
                    commonAnimateExpect('scale-down', 'scale-up');
                })
            );

            it(
                'should have the "animate" attribute set with "scale-up" when open and its opposite "scale-down" when close with a custom animation timeout',
                autoFlush(() => {
                    setConfig({ animate: 'scale-up', animateMs: 750 });
                    openMenu(false);
                    commonAnimateExpect('scale-up', 'scale-down');
                })
            );

            it(
                'should have the "animate" attribute set with "scale-up" when open and the opposite of the defined "bottom-top" (aka "top-bottom") when close',
                autoFlush(() => {
                    setConfig({ animate: { in: 'scale-down', out: 'bottom-top' } });
                    openMenu(false);
                    commonAnimateExpect('scale-down', 'top-bottom');
                })
            );
        });
    });

    describe('Events', () => {
        beforeEach(() => setItems([{ label: 'item1' }]));

        it(
            'should block the "contextmenu" event',
            autoFlush(() => {
                openMenu();

                const event = new PointerEvent('contextmenu', { cancelable: true });
                spyOn(event, 'stopImmediatePropagation');
                spyOn(event, 'preventDefault');

                menu.dispatchEvent(event);
                expect(event.stopImmediatePropagation).toHaveBeenCalled();
                expect(event.preventDefault).toHaveBeenCalled();
            })
        );
    });

    describe('Mobile', () => {
        beforeEach(() => setMobile(true));

        it(
            'should not attach the overlay',
            autoFlush(() => {
                setItems([{ label: 'item1' }]);

                openMenu();
                const spyOnAttachOverlay = spyOn(component.menu, 'attachOverlay');
                expect(spyOnAttachOverlay).not.toHaveBeenCalled();
            })
        );
    });

    describe('Scrolling', () => {
        const setSize = (): void => {
            menu.style.maxWidth = '200px';
            menu.style.maxHeight = '400px';
            fixture.detectChanges();
        };

        beforeEach(() => setItems(Array.from({ length: 20 }, (_, idx) => ({ label: `item${idx}` }))));

        it(
            'should do nothing if device is mobile',
            autoFlush(() => {
                setMobile(true);
                openMenu();
                setSize();

                const event = new WheelEvent('wheel');
                spyOn(event, 'stopImmediatePropagation');

                wheel(menu, event);
                expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
            })
        );

        it(
            'should prevent default scroll when there is no vertical overflow',
            autoFlush(() => {
                setItems([{ label: 'item1' }]);
                openMenu();
                setSize();

                const event = new WheelEvent('wheel', { deltaY: 100, cancelable: true });

                wheel(menu, event);
                expect(event.defaultPrevented).toBeTrue();
            })
        );

        it(
            'should scroll Y normally (menu)',
            autoFlush(() => {
                openMenu();
                setSize();

                spyOn(menu, 'scrollTo');

                const event = new WheelEvent('wheel', { deltaY: 100, cancelable: true });

                // Fake pointer position
                Object.defineProperty(event, 'offsetX', { value: 200 });

                wheel(menu, event);

                expect(event.defaultPrevented).toBeTrue();
                expect(menu.scrollTo as jasmine.Spy).toHaveBeenCalledWith({ behavior: 'smooth', top: 100 });
            })
        );

        it(
            'should scroll X normally (inline items)',
            autoFlush(() => {
                setItems([
                    {
                        itemsLayout: 'inline',
                        items: [{ label: 'item-inline-1' }, { label: 'item-inline-2' }, { label: 'item-inline-3' }],
                    },
                ]);
                openMenu();
                setSize();

                const itemsWrapper = menu.querySelector('[menu-group-items]') as HTMLElement;
                const event = new WheelEvent('wheel', { deltaX: 100, cancelable: true, bubbles: true });

                wheel(itemsWrapper, event);
                expect(event.defaultPrevented).toBeFalse();
            })
        );

        it(
            'should NOT scroll X when there is no overflow (inline items)',
            autoFlush(() => {
                setItems([{ itemsLayout: 'inline', items: [{ label: '1' }, { label: '2' }] }]);
                openMenu();
                setSize();

                const itemsWrapper = menu.querySelector('[menu-group-items]') as HTMLElement;
                const event = new WheelEvent('wheel', { deltaX: 100, cancelable: true, bubbles: true });

                wheel(itemsWrapper, event);
                expect(event.defaultPrevented).toBeTrue();
            })
        );

        it(
            'should NOT scroll X when scrolling over stacked items',
            autoFlush(() => {
                setItems([{ label: 'item1' }, { label: 'item2' }]);
                openMenu();
                setSize();

                const event = new WheelEvent('wheel', { deltaX: 100, cancelable: true, bubbles: true });

                wheel(menu, event);
                expect(event.defaultPrevented).toBeTrue();
            })
        );
    });
});
