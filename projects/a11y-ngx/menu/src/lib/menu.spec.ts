import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, ElementRef, Input, NgModule, ViewChild } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { provideA11yIcon } from '@a11y-ngx/icon';
import { provideA11yTheme, Theme } from '@a11y-ngx/theme';

import { A11yMenuModule } from './menu.module';
import { provideA11yMenu, provideA11yMenuFeature } from './menu.module.providers';
import { MenuService } from './menu.service';
import { MenuPrivateService } from './menu.service.private';
import { MenuDirectorService } from './menu.director.service';

import { MenuDirective } from './menu.directive';
import { MenuComponent } from './components/menu.component';

import { WINDOW } from './menu.module.providers.private';
import { MENU_DELAY_MS } from './menu.type.private';
import type { MenuGridLabelType, MenuGroupJustifyItems } from './menu.type.private';
import type { Menu, MenuConfig, MenuGroup, MenuGroupSelectableStack, MenuItem, MenuItemSubmenu } from './menu.type';

@Component({
    selector: 'a11y-test-menu',
    template: `
        <button
            type="button"
            class="trigger"
            [a11yMenu]="items"
            [a11yMenuConfig]="config"
            [a11yMenuLabel]="label"
            #menu="a11yMenu">
            trigger
        </button>
    `,
})
class MenuTestComponent {
    items: Menu = [];
    label: string | undefined = undefined;
    config: MenuConfig = {};

    @ViewChild('menu') menu!: MenuDirective;
}

@Component({
    selector: 'a11y-test-feature-menu',
    template: '<button type="button" class="trigger" (click)="openFeatureMenu()" #trigger>trigger</button>',
})
class MenuTestFeatureComponent {
    config: MenuConfig = {};

    @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLButtonElement>;

    constructor(private director: MenuDirectorService) {}

    openFeatureMenu(): void {
        this.director.createRootMenu(this.trigger.nativeElement, [{ label: 'item1' }], '.a11y-theme-menu', this.config);
    }
}

@NgModule({
    declarations: [MenuTestComponent, MenuTestFeatureComponent],
    imports: [CommonModule, A11yMenuModule],
})
class MenuTestModule {}

describe('Menu Integration', () => {
    let component: MenuTestComponent;
    let fixture: ComponentFixture<MenuTestComponent>;
    let service: MenuService;

    let document!: Document;

    let container!: HTMLElement;

    const itemWithLabel: MenuGridLabelType[] = ['below', 'end', 'start'];
    const itemWithNoLabel: MenuGridLabelType[] = [
        'floating-above',
        'floating-below',
        'panel-above',
        'panel-below',
        'tooltip',
    ];

    const setItems = (items: Menu): void => {
        component.items = items;
    };

    const getTrigger = (selector: string = 'button.trigger'): HTMLButtonElement => {
        const trigger: HTMLButtonElement = fixture.debugElement.query(By.css(selector))?.nativeElement;
        fixture.detectChanges();
        return trigger;
    };

    const getAnnouncer = (): HTMLElement => {
        return document.body.querySelector('a11y-live-announcer') as HTMLElement;
    };

    const getMenu = (menuIdx: number): HTMLElement => {
        return container.querySelectorAll('a11y-menu')?.[menuIdx] as HTMLElement;
    };

    const getMenuCount = (): number => {
        return container?.querySelectorAll('a11y-menu').length ?? 0;
    };

    const getItem = (menuEl: HTMLElement, itemIdx: number): HTMLElement => {
        return menuEl.querySelectorAll('a11y-menu-item')?.[itemIdx] as HTMLElement;
    };

    const getItemInfo = (menuEl: HTMLElement, itemIdx: number): HTMLElement => {
        return menuEl.querySelectorAll('a11y-menu-item-info')?.[itemIdx] as HTMLElement;
    };

    const setConfig = (config: MenuConfig): void => {
        Object.assign(component.config, config);
    };

    const setMobile = (isMobile: boolean): void => {
        service['mobileService']['isMobileBreakpoint'] = isMobile;
    };

    const openMenu = (viaKeyboardKey: 'Enter' | 'Space' | '' = ''): void => {
        const trigger: HTMLElement = getTrigger();

        if (viaKeyboardKey) {
            pressKeyItem(trigger, viaKeyboardKey);
            tick(16);
        } else trigger.click();

        flush();
        fixture.detectChanges();

        container = document.body.querySelector('a11y-menu-container') as HTMLElement;
    };

    const sendKey = (code: string, repeat: boolean = false): void => {
        container.dispatchEvent(new KeyboardEvent('keydown', { code, repeat }));
        flush();
    };

    const pressKeyItem = (item: HTMLElement, key: 'Enter' | 'Space'): void => {
        item.dispatchEvent(new KeyboardEvent('keydown', { key, code: key }));
    };

    const clickItem = (itemEl: HTMLElement, forceFlush: boolean = true): void => {
        itemEl.dispatchEvent(new PointerEvent('click'));
        if (forceFlush) flush();
    };

    const mouseEnterItem = (itemEl: HTMLElement, forceFlush: boolean = true): void => {
        itemEl.dispatchEvent(new PointerEvent('mouseenter'));
        if (forceFlush) flush();
    };

    const mouseLeaveItem = (itemEl: HTMLElement, forceFlush: boolean = true): void => {
        itemEl.dispatchEvent(new PointerEvent('mouseleave'));
        if (forceFlush) flush();
    };

    const focusItem = (itemEl: HTMLElement, forceFlush: boolean = true): void => {
        itemEl.dispatchEvent(new FocusEvent('focus'));
        if (forceFlush) {
            flush();
            tick(16);
        }
    };

    const blurItem = (itemEl: HTMLElement, forceFlush: boolean = true): void => {
        itemEl.dispatchEvent(new FocusEvent('blur'));
        if (forceFlush) {
            flush();
            tick(16);
        }
    };

    const wheel = (element: HTMLElement, evt: WheelEvent, forceFlush: boolean = true): void => {
        element.dispatchEvent(evt);
        if (forceFlush) {
            flush();
            tick(16);
        }
    };

    const isVisible = (el: HTMLElement): boolean => getComputedStyle(el).display !== 'none';

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
        document = TestBed.inject(DOCUMENT);
    });

    describe('Menu Lifecycle, Global Keys & Focus Management', () => {
        beforeEach(() => setItems([{ label: 'item1' }, { label: 'item2' }]));

        describe('Closing triggers', () => {
            it(
                'should close the menu when "Alt" is pressed',
                autoFlush(() => {
                    openMenu();
                    sendKey('Alt');
                    expect(getMenu(0)).toBeFalsy();
                })
            );

            it(
                'should close the menu when "F10" is pressed',
                autoFlush(() => {
                    openMenu();
                    sendKey('F10');
                    expect(getMenu(0)).toBeFalsy();
                })
            );

            it(
                'should close the menu when "Tab" is pressed',
                autoFlush(() => {
                    openMenu();
                    sendKey('Tab');
                    expect(getMenu(0)).toBeFalsy();
                })
            );
        });

        describe('Non-closing triggers', () => {
            it(
                'should NOT close the menu when "Space" is pressed',
                autoFlush(() => {
                    openMenu();
                    sendKey('Space');
                    expect(getMenu(0)).toBeTruthy();
                })
            );

            it(
                'should NOT close the menu when an unhandled key like "F5" is pressed',
                autoFlush(() => {
                    openMenu();
                    sendKey('F5');
                    expect(getMenu(0)).toBeTruthy();
                })
            );
        });

        describe('Guard clauses & Toggle behavior', () => {
            it(
                'should NOT open the menu if the native button is disabled',
                autoFlush(() => {
                    getTrigger().disabled = true;
                    fixture.detectChanges();

                    openMenu();
                    expect(getMenuCount()).toBe(0);

                    openMenu('Enter');
                    expect(getMenuCount()).toBe(0);
                })
            );

            it(
                'should NOT open the menu if the trigger has aria-disabled="true"',
                autoFlush(() => {
                    getTrigger().setAttribute('aria-disabled', 'true');
                    fixture.detectChanges();

                    openMenu();
                    expect(getMenuCount()).toBe(0);

                    openMenu('Enter');
                    expect(getMenuCount()).toBe(0);
                })
            );

            it(
                'should close the menu with toggle reason if trigger is activated while open',
                autoFlush(() => {
                    openMenu();
                    expect(getMenuCount()).toBe(1);

                    getTrigger().click();
                    flush();
                    expect(getMenuCount()).toBe(0);
                })
            );
        });

        describe('Opening the menu', () => {
            describe('Pointer interactions', () => {
                it(
                    'should open the menu, set ARIA attributes, and move focus to the menu element',
                    autoFlush(() => {
                        openMenu();
                        expect(getMenuCount()).toBe(1);

                        const trigger = getTrigger();
                        expect(trigger.getAttribute('aria-expanded')).toEqual('true');

                        const menu = getMenu(0);
                        const menuID = menu.getAttribute('id');
                        expect(trigger.getAttribute('aria-controls')).toEqual(menuID);
                        expect(document.activeElement).toEqual(menu);
                    })
                );
            });

            describe('Keyboard interactions', () => {
                it(
                    'should open the menu and focus the first item when pressing Enter',
                    autoFlush(() => {
                        openMenu('Enter');
                        expect(getMenuCount()).toBe(1);

                        const activeItem = getItem(getMenu(0), 0);
                        expect(activeItem.getAttribute('active-item')).toEqual('kb');
                        expect(document.activeElement).toEqual(activeItem);
                    })
                );

                it(
                    'should open the menu and focus the first item when pressing Space',
                    autoFlush(() => {
                        openMenu('Space');
                        expect(getMenuCount()).toBe(1);

                        const activeItem = getItem(getMenu(0), 0);
                        expect(activeItem.getAttribute('active-item')).toEqual('kb');
                        expect(document.activeElement).toEqual(activeItem);
                    })
                );
            });
        });
    });

    describe('Navigation Engine & Focus State', () => {
        beforeEach(() => setItems([{ label: 'item1' }, { label: 'item2' }, { label: 'item3' }]));

        describe('Pointer vs Keyboard state ("active-item" attribute)', () => {
            it(
                'should set the "active-item" attribute to "kb" when navigating via keyboard',
                autoFlush(() => {
                    openMenu();
                    sendKey('End');
                    const activeItemAttr: string | null = getItem(getMenu(0), 2).getAttribute('active-item');
                    expect(activeItemAttr).toEqual('kb');
                })
            );

            it(
                'should remove the "active-item" attribute when navigating via pointer',
                autoFlush(() => {
                    openMenu();
                    const item: HTMLElement = getItem(getMenu(0), 1);
                    mouseEnterItem(item);
                    expect(item.getAttribute('active-item')).toEqual('');
                })
            );
        });

        describe('Repeated key event prevention', () => {
            const commonPreventKeysExpect = (event: KeyboardEvent): void => {
                spyOn(event, 'stopImmediatePropagation');
                spyOn(event, 'preventDefault');
                container.dispatchEvent(event);

                expect(event.stopImmediatePropagation).toHaveBeenCalled();
                expect(event.preventDefault).toHaveBeenCalled();
            };

            it(
                'should call preventDefault and stopImmediatePropagation on repeated "End" key press',
                autoFlush(() => {
                    openMenu();
                    sendKey('End');

                    // We create the custom event for the second pressing
                    const endEvent = new KeyboardEvent('keydown', { code: 'End', bubbles: true, cancelable: true });
                    commonPreventKeysExpect(endEvent);
                })
            );

            it(
                'should call preventDefault and stopImmediatePropagation on repeated "Home" key press',
                autoFlush(() => {
                    openMenu();
                    sendKey('Home');

                    // We create the custom event for the second pressing
                    const homeEvent = new KeyboardEvent('keydown', { code: 'Home', bubbles: true, cancelable: true });
                    commonPreventKeysExpect(homeEvent);
                })
            );

            it(
                'should call preventDefault and stopImmediatePropagation on repeated "ArrowLeft" key press',
                autoFlush(() => {
                    openMenu();
                    sendKey('ArrowLeft');

                    // We create the custom event for the second pressing
                    const arrowEvent = new KeyboardEvent('keydown', {
                        code: 'ArrowLeft',
                        bubbles: true,
                        cancelable: true,
                    });
                    commonPreventKeysExpect(arrowEvent);
                })
            );
        });
    });

    describe('Submenu Integration (Recursivity)', () => {
        beforeEach(() =>
            setItems([
                { label: 'item1' },
                { label: 'item2' },
                {
                    label: 'item3',
                    submenu: [
                        { label: 'item3a' },
                        { label: 'item3b', submenu: [{ label: 'item3b1' }, { label: 'item3b2' }] },
                    ],
                },
            ])
        );

        describe('Keyboard interactions', () => {
            it(
                'should NOT open with "ArrowRight" when item does NOT have submenu',
                autoFlush(() => {
                    openMenu();
                    sendKey('ArrowDown'); // focus 1st item (with NO submenu)
                    sendKey('ArrowRight'); // sending the "open" action
                    expect(getMenuCount()).toBe(1);
                })
            );

            ['Enter', 'ArrowRight'].forEach((keyToOpen) => {
                it(
                    `should open nested submenus sequentially using "${keyToOpen}}"`,
                    autoFlush(() => {
                        openMenu();

                        // Opening first submenu
                        sendKey('End');
                        expect(getMenu(1)).toBeFalsy();

                        sendKey(keyToOpen);
                        expect(getMenu(1)).toBeTruthy();

                        // Opening second submenu
                        sendKey('ArrowDown');
                        expect(getMenu(2)).toBeFalsy();

                        sendKey(keyToOpen);
                        expect(getMenu(2)).toBeTruthy();
                    })
                );
            });

            ['Escape', 'ArrowLeft'].forEach((keyToClose) => {
                it(`should close nested submenus sequentially using ${keyToClose}`, fakeAsync(() => {
                    openMenu();

                    // Opening both submenus
                    sendKey('End');
                    sendKey('Enter');
                    sendKey('End');
                    sendKey('Enter');

                    expect(getMenuCount()).toBe(3);

                    // Closing second submenu
                    sendKey(keyToClose);
                    expect(getMenu(2)).toBeFalsy();

                    // Closing first submenu
                    sendKey(keyToClose);
                    expect(getMenu(1)).toBeFalsy();
                }));
            });

            it(
                'should close the entire menu tree when "Escape" is pressed at the root level',
                autoFlush(() => {
                    openMenu();

                    // Opening both submenus
                    sendKey('End');
                    sendKey('Enter');
                    sendKey('End');
                    sendKey('Enter');

                    expect(getMenuCount()).toBe(3);

                    // Closing second submenu
                    sendKey('Escape');
                    expect(getMenu(2)).toBeFalsy();

                    // Closing first submenu
                    sendKey('Escape');
                    expect(getMenu(1)).toBeFalsy();

                    // Closing root menu
                    sendKey('Escape');
                    expect(getMenu(0)).toBeFalsy();
                })
            );
        });

        describe('Pointer interactions', () => {
            it(
                'should NOT open anything when item does NOT have submenu',
                autoFlush(() => {
                    openMenu();
                    mouseEnterItem(getItem(getMenu(0), 0));
                    expect(getMenu(1)).toBeFalsy();
                })
            );

            it(
                'should open nested submenus sequentially via mouse enter',
                autoFlush(() => {
                    openMenu();

                    // Opening first submenu
                    mouseEnterItem(getItem(getMenu(0), 2));
                    expect(getMenu(1)).toBeTruthy();

                    // Opening second submenu
                    mouseEnterItem(getItem(getMenu(1), 1));
                    expect(getMenu(2)).toBeTruthy();
                })
            );

            it(
                'should close nested submenus sequentially via mouse enter on another item in the same level',
                autoFlush(() => {
                    openMenu();

                    // Opening both submenus
                    mouseEnterItem(getItem(getMenu(0), 2));
                    mouseEnterItem(getItem(getMenu(1), 1));

                    expect(getMenuCount()).toBe(3);

                    // Closing second submenu
                    mouseEnterItem(getItem(getMenu(1), 0));
                    expect(getMenu(2)).toBeFalsy();

                    // Closing first submenu
                    mouseEnterItem(getItem(getMenu(0), 0));
                    expect(getMenu(1)).toBeFalsy();
                })
            );

            it(
                'should close all nested submenus at once via mouse enter on an item in the root menu',
                autoFlush(() => {
                    openMenu();

                    // Opening both submenus
                    mouseEnterItem(getItem(getMenu(0), 2));
                    mouseEnterItem(getItem(getMenu(1), 1));

                    expect(getMenuCount()).toBe(3);

                    // Mouse enter on root item without submenu
                    mouseEnterItem(getItem(getMenu(0), 0));
                    expect(getMenuCount()).toBe(1);
                })
            );

            it(
                'should NOT close the submenu when moving pointer to parent and then back to submenu',
                autoFlush(() => {
                    openMenu();

                    const menuRoot = getMenu(0);
                    mouseEnterItem(getItem(menuRoot, 2));
                    expect(getMenuCount()).toBe(2);

                    const submenu = getMenu(1);
                    menuRoot.dispatchEvent(new PointerEvent('mouseenter'));
                    tick(50);
                    submenu.dispatchEvent(new PointerEvent('mouseenter'));
                    flush();
                    expect(getMenuCount()).toBe(2);
                })
            );

            it(
                'should early return if submenu is open and trigger is clicked once more',
                autoFlush(() => {
                    openMenu();

                    const item = getItem(getMenu(0), 2);
                    clickItem(item);

                    spyOn(service.executeKeyNavNavigation$, 'next');

                    clickItem(item);
                    expect(service.executeKeyNavNavigation$.next).not.toHaveBeenCalled();
                })
            );
        });

        describe('Mixed interactions', () => {
            beforeEach(() => setItems([{ label: 'item1', submenu: [{ label: 'item1a' }] }]));

            it(
                'should handle mixed triggers: open via mouse enter, close via keyboard, and reopen via click',
                autoFlush(() => {
                    openMenu();

                    const item: HTMLElement = getItem(getMenu(0), 0);
                    mouseEnterItem(item);
                    expect(getMenuCount()).toBe(2);

                    sendKey('ArrowLeft');
                    expect(getMenuCount()).toBe(1);

                    clickItem(item);
                    expect(getMenuCount()).toBe(2);
                })
            );

            it(
                'should not open twice when clicked immediately after hover',
                autoFlush(() => {
                    openMenu();
                    const spyOnExecuteKeyNav = spyOn(service.executeKeyNavNavigation$, 'next');

                    const halfTimeout: number = MENU_DELAY_MS / 2;
                    const item: HTMLElement = getItem(getMenu(0), 0);

                    mouseEnterItem(item, false); // trigger hover (starts the timeout)
                    tick(halfTimeout);

                    clickItem(item, false); // trigger click immediately (should clear timeout and open)
                    tick(halfTimeout); // complete the original timeout

                    expect(spyOnExecuteKeyNav).toHaveBeenCalledTimes(2);
                    // mouse enter triggers 'ArrowDown' before the cancelled timeout that triggers 'Enter', then the click triggers 'Enter'
                    expect(spyOnExecuteKeyNav.calls.argsFor(0)).toEqual(['ArrowDown']);
                    expect(spyOnExecuteKeyNav.calls.argsFor(1)).toEqual(['Enter']);
                    flush();
                })
            );
        });
    });

    describe('Keyboard Navigation Engine', () => {
        beforeEach(() =>
            setItems([{ label: 'item1' }, { label: 'item2' }, { label: 'item3', disabled: true }, { label: 'item4' }])
        );

        it(
            'should move focus to the next item on ArrowDown',
            autoFlush(() => {
                openMenu('Enter');

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(getItem(menu, 0));

                sendKey('ArrowDown');
                expect(document.activeElement).toEqual(getItem(menu, 1));
            })
        );

        it(
            'should move focus to the previous item on ArrowUp',
            autoFlush(() => {
                openMenu('Enter');
                sendKey('ArrowDown');

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(getItem(menu, 1));

                sendKey('ArrowUp');
                expect(document.activeElement).toEqual(getItem(menu, 0));
            })
        );

        it(
            'should NOT skip disabled items (default)',
            autoFlush(() => {
                openMenu('Enter');
                sendKey('End');

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(getItem(menu, 3));

                sendKey('ArrowUp');
                expect(document.activeElement).toEqual(getItem(menu, 2));
            })
        );

        it(
            'should skip disabled items (allowNavigateDisabled="false")',
            autoFlush(() => {
                setConfig({ allowNavigateDisabled: false });
                openMenu('Enter');
                sendKey('End');

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(getItem(menu, 3));

                sendKey('ArrowUp');
                expect(document.activeElement).toEqual(getItem(menu, 1));
            })
        );

        it(
            'should move focus to the first item when pressing ArrowDown on the last item',
            autoFlush(() => {
                openMenu('Enter');
                sendKey('End');

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(getItem(menu, 3));

                sendKey('ArrowDown');
                expect(document.activeElement).toEqual(getItem(menu, 0));
            })
        );

        it(
            'should move focus to the last item when pressing ArrowUp on the first item',
            autoFlush(() => {
                openMenu('Enter');

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(getItem(menu, 0));

                sendKey('ArrowUp');
                expect(document.activeElement).toEqual(getItem(menu, 3));
            })
        );

        it(
            'should move focus to the first item on Home',
            autoFlush(() => {
                openMenu();

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(menu);

                sendKey('Home');
                expect(document.activeElement).toEqual(getItem(menu, 0));
            })
        );

        it(
            'should move focus to the last item on End',
            autoFlush(() => {
                openMenu();

                const menu = getMenu(0);
                expect(document.activeElement).toEqual(menu);

                sendKey('End');
                expect(document.activeElement).toEqual(getItem(menu, 3));
            })
        );

        it(
            'should throttle repeated keys using the default 50ms delay',
            autoFlush(() => {
                openMenu('Enter');
                const menu = getMenu(0);

                // 1. First press: executes immediately
                container.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
                expect(document.activeElement).toEqual(getItem(menu, 1));

                // 2. Second press immediately: should be ignored (throttled)
                container.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', repeat: true }));
                expect(document.activeElement).toEqual(getItem(menu, 1)); // Focus remains on item 1

                // 3. Fast forward time to clear the 50ms default throttle
                tick(50);

                // 4. Third press: should execute normally
                container.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', repeat: true }));
                expect(document.activeElement).toEqual(getItem(menu, 2));
            })
        );

        it(
            'should throttle repeated keys using a custom delay',
            autoFlush(() => {
                setConfig({ throttleMs: 200 });
                openMenu('Enter');
                const menu = getMenu(0);

                // 1. First press: executes immediately
                container.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
                expect(document.activeElement).toEqual(getItem(menu, 1));

                // 2. Fast forward 100ms (still within the 200ms throttle window)
                tick(100);

                // 3. Press key: should be ignored
                container.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', repeat: true }));
                expect(document.activeElement).toEqual(getItem(menu, 1)); // Focus remains on item 1

                // 4. Fast forward another 100ms to complete the 200ms window
                tick(100);

                // 5. Press key: should execute normally now
                container.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', repeat: true }));
                expect(document.activeElement).toEqual(getItem(menu, 2));
            })
        );
    });

    describe('Pointer Events', () => {
        beforeEach(() =>
            setItems([
                { label: 'item1' },
                { label: 'item2', disabled: true },
                { label: 'item3', action: (itemCtx) => itemCtx.setBusy(true) },
                {
                    type: 'radio',
                    beforeChange: (itemCtx) => {
                        itemCtx.setBusy(true); // set busy
                        return of(true).pipe(delay(500)); // allow the change
                    },
                    items: [{ label: 'item4' }, { label: 'item5' }],
                },
                { label: 'item6', submenu: [{ label: 'item6a' }] },
            ])
        );

        describe('Early returns', () => {
            describe('"mouseenter" event"', () => {
                it(
                    'should stop if is mobile device',
                    autoFlush(() => {
                        setMobile(true);
                        openMenu();

                        spyOn(window, 'clearTimeout');

                        mouseEnterItem(getItem(getMenu(0), 0));
                        expect(window.clearTimeout).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should stop if item is not navigable',
                    autoFlush(() => {
                        setConfig({ allowNavigateDisabled: false });
                        openMenu();

                        spyOn(window, 'clearTimeout');

                        mouseEnterItem(getItem(getMenu(0), 1));
                        expect(window.clearTimeout).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should stop if item is busy',
                    autoFlush(() => {
                        openMenu();

                        const item = getItem(getMenu(0), 2);
                        clickItem(item); // sets it as busy

                        spyOn(window, 'clearTimeout');

                        mouseEnterItem(item);
                        expect(window.clearTimeout).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should stop if group is busy',
                    autoFlush(() => {
                        openMenu();

                        const item3 = getItem(getMenu(0), 3);
                        const item4 = getItem(getMenu(0), 4);
                        clickItem(item4); // sets entire group or radios as busy

                        tick(250);
                        spyOn(window, 'clearTimeout');

                        mouseEnterItem(item3);
                        expect(window.clearTimeout).not.toHaveBeenCalled();

                        tick(250); // finish timer
                    })
                );
            });

            describe('"mouseleave" event"', () => {
                it(
                    'should stop if is mobile device',
                    autoFlush(() => {
                        setMobile(true);
                        openMenu();

                        spyOn(window, 'clearTimeout');

                        mouseLeaveItem(getItem(getMenu(0), 0));
                        expect(window.clearTimeout).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should stop if item is not navigable',
                    autoFlush(() => {
                        setConfig({ allowNavigateDisabled: false });
                        openMenu();

                        spyOn(window, 'clearTimeout');

                        mouseLeaveItem(getItem(getMenu(0), 1));
                        expect(window.clearTimeout).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should stop if there is NOT a last menu to set focus',
                    autoFlush(() => {
                        openMenu();

                        const item = getItem(getMenu(0), 5);
                        mouseEnterItem(item); // trigger mouse enter
                        spyOn(service, 'updateMenuState');

                        mouseLeaveItem(item, false); // trigger mouse leave
                        service.destroyMenu(); // we kill the entire menu
                        tick(MENU_DELAY_MS); // finish timer

                        expect(service.updateMenuState).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should stop if item is from an already open submenu',
                    autoFlush(() => {
                        openMenu();

                        const item = getItem(getMenu(0), 5);
                        mouseEnterItem(item); // open submenu

                        const submenu = service.lastMenu as MenuComponent;
                        spyOn(submenu, 'focusMenu');

                        mouseLeaveItem(item, false); // trigger mouse leave
                        tick(MENU_DELAY_MS); // finish timer

                        expect(submenu.focusMenu).not.toHaveBeenCalled();
                        expect(service.currentItemIdxFromPointer).not.toBe(-1);
                    })
                );

                it(
                    'should stop and not update the state if last state is somehow undefined',
                    autoFlush(() => {
                        openMenu();

                        const service = TestBed.inject(MenuService);

                        const item = getItem(getMenu(0), 0);
                        mouseEnterItem(item);

                        spyOn(service, 'updateMenuState');

                        service['menuNavigationState'] = undefined;

                        mouseLeaveItem(item, false);
                        tick(MENU_DELAY_MS);

                        expect(service.updateMenuState).not.toHaveBeenCalled();
                    })
                );
            });
        });

        it(
            'should cancel closing the submenu when pointer enters another sibling and reenters back to the already open item',
            autoFlush(() => {
                openMenu();

                const privateService = TestBed.inject(MenuPrivateService);

                spyOn(window, 'clearTimeout');
                const submenuItem = getItem(getMenu(0), 5);
                const siblingItem = getItem(getMenu(0), 2);
                clickItem(submenuItem); // open submenu

                mouseEnterItem(siblingItem, false); // mouse enter in sibling, starts the closing of the submenu en 400ms
                const targetTimerId = privateService.lastMenuOpenTimeout;

                tick(200);
                mouseEnterItem(submenuItem, false);
                expect(window.clearTimeout).toHaveBeenCalledWith(targetTimerId);

                flush(); // finish timer
            })
        );
    });

    describe('Item Behaviors & States', () => {
        describe('Action items', () => {
            beforeEach(() =>
                setItems([
                    { label: 'item1' },
                    { label: 'item2', closeOnSelect: false, className: 'action-item-1' },
                    { items: [{ label: 'item3' }] },
                    { items: [{ label: 'item4' }], closeOnSelect: false },
                ])
            );

            it(
                'should have the given class name applied to the action item',
                autoFlush(() => {
                    openMenu();

                    const item = getItem(getMenu(0), 1).classList;
                    expect(item.contains('action-item-1')).toBeTrue();
                })
            );

            it(
                'should have the "role" attribute set to "menuitem"',
                autoFlush(() => {
                    openMenu();
                    expect(getItem(getMenu(0), 0).getAttribute('role')).toEqual('menuitem');
                })
            );

            describe('Default behavior', () => {
                describe('Standalone item', () => {
                    it(
                        'should close the menu when clicked',
                        autoFlush(() => {
                            openMenu();
                            expect(getMenuCount()).toBe(1);
                            clickItem(getItem(getMenu(0), 0)); // item1
                            expect(getMenuCount()).toBe(0);
                        })
                    );

                    it(
                        'should close the menu when "Enter" is pressed',
                        autoFlush(() => {
                            openMenu('Enter'); // item1
                            expect(getMenuCount()).toBe(1);
                            sendKey('Enter');
                            expect(getMenuCount()).toBe(0);
                        })
                    );
                });

                describe('Grouped item', () => {
                    it(
                        'should close the menu when clicked',
                        autoFlush(() => {
                            openMenu();
                            expect(getMenuCount()).toBe(1);
                            clickItem(getItem(getMenu(0), 2)); // item3
                            expect(getMenuCount()).toBe(0);
                        })
                    );

                    it(
                        'should close the menu when "Enter" is pressed',
                        autoFlush(() => {
                            openMenu('Enter'); // item1
                            expect(getMenuCount()).toBe(1);
                            sendKey('ArrowDown'); // item2
                            sendKey('ArrowDown'); // item3
                            sendKey('Enter');
                            expect(getMenuCount()).toBe(0);
                        })
                    );
                });
            });

            describe('Custom behavior (closeOnSelect="false")', () => {
                describe('Standalone item', () => {
                    it(
                        'should NOT close the menu when clicked',
                        autoFlush(() => {
                            openMenu();
                            expect(getMenuCount()).toBe(1);
                            clickItem(getItem(getMenu(0), 1)); // item2
                            expect(getMenuCount()).toBe(1);
                        })
                    );

                    it(
                        'should NOT close the menu when "Enter" is pressed',
                        autoFlush(() => {
                            openMenu('Enter'); // item1
                            expect(getMenuCount()).toBe(1);
                            sendKey('ArrowDown'); // item2
                            sendKey('Enter');
                            expect(getMenuCount()).toBe(1);
                        })
                    );
                });

                describe('Grouped item', () => {
                    it(
                        'should NOT close the menu when clicked',
                        autoFlush(() => {
                            openMenu();
                            expect(getMenuCount()).toBe(1);
                            clickItem(getItem(getMenu(0), 3)); // item4
                            expect(getMenuCount()).toBe(1);
                        })
                    );

                    it(
                        'should NOT close the menu when "Enter" is pressed',
                        autoFlush(() => {
                            openMenu('Enter'); // item1
                            expect(getMenuCount()).toBe(1);
                            sendKey('End'); // item4
                            sendKey('Enter');
                            expect(getMenuCount()).toBe(1);
                        })
                    );
                });
            });

            describe('Action execution', () => {
                let testAction: boolean = false;

                beforeEach(() => setItems([{ label: 'item1', action: () => (testAction = true) }]));
                afterEach(() => (testAction = false));

                it(
                    'should execute the "action" function when triggered via click',
                    autoFlush(() => {
                        openMenu();

                        clickItem(getItem(getMenu(0), 0));
                        expect(testAction).toBeTrue();
                    })
                );

                it(
                    'should execute the "action" function when triggered via keyboard',
                    autoFlush(() => {
                        openMenu('Enter');
                        sendKey('Enter');
                        expect(testAction).toBeTrue();
                    })
                );

                it(
                    'should NOT emit any value when item has a custom action',
                    autoFlush(() => {
                        openMenu();
                        spyOn(component.menu.itemSelected, 'emit');

                        clickItem(getItem(getMenu(0), 0));
                        expect(component.menu.itemSelected.emit).not.toHaveBeenCalled();
                    })
                );
            });
        });

        describe('Checkbox items', () => {
            let group1: MenuGroupSelectableStack;
            let group2: MenuGroupSelectableStack;
            let group3: MenuGroupSelectableStack;

            beforeEach(() => {
                group1 = {
                    type: 'checkbox',
                    items: [
                        { label: 'item1', checked: true },
                        { label: 'item2' },
                        { label: 'item3', checked: false },
                        { label: 'item4', checked: true, closeOnSelect: true },
                    ],
                };
                group2 = {
                    type: 'checkbox',
                    closeOnSelect: true,
                    items: [
                        { label: 'item5', checked: true, className: 'checkbox-item-a' },
                        { label: 'item6', checked: false, closeOnSelect: false },
                    ],
                };
                group3 = {
                    type: 'checkbox',
                    items: [
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        { label: 'item7', beforeChange: () => {} },
                        { label: 'item8', beforeChange: () => true },
                        { label: 'item9', beforeChange: () => of(true) },
                        { label: 'item10', beforeChange: () => of(undefined) },
                        { label: 'item11', beforeChange: async () => true },
                        { label: 'item12', beforeChange: async () => undefined },
                        { label: 'item13', beforeChange: async () => Promise.reject(new Error('error')) },
                    ],
                };
                setItems([group1, group2, group3]);
            });

            it(
                'should have the given class name applied to the checkbox item',
                autoFlush(() => {
                    openMenu();

                    const item = getItem(getMenu(0), 4).classList;
                    expect(item.contains('checkbox-item-a')).toBeTrue();
                })
            );

            it(
                'should have the "role" attribute set to "menuitemcheckbox"',
                autoFlush(() => {
                    openMenu();
                    expect(getItem(getMenu(0), 0).getAttribute('role')).toEqual('menuitemcheckbox');
                })
            );

            describe('State Management ("aria-checked" attribute)', () => {
                it(
                    'should toggle state on click',
                    autoFlush(() => {
                        openMenu();
                        const item1 = getItem(getMenu(0), 0);
                        expect(item1.getAttribute('aria-checked')).toEqual('true');

                        clickItem(item1);
                        expect(item1.getAttribute('aria-checked')).toEqual('false');

                        clickItem(item1);
                        expect(item1.getAttribute('aria-checked')).toEqual('true');
                    })
                );

                it(
                    'should toggle state when "Enter" is pressed',
                    autoFlush(() => {
                        openMenu();

                        const item2 = getItem(getMenu(0), 1);
                        pressKeyItem(item2, 'Enter');
                        expect(item2.getAttribute('aria-checked')).toEqual('true');

                        pressKeyItem(item2, 'Enter');
                        expect(item2.getAttribute('aria-checked')).toEqual('false');

                        pressKeyItem(item2, 'Enter');
                        expect(item2.getAttribute('aria-checked')).toEqual('true');
                    })
                );

                it(
                    'should toggle state when "Space" is pressed',
                    autoFlush(() => {
                        openMenu();

                        const item3 = getItem(getMenu(0), 2);
                        pressKeyItem(item3, 'Space');
                        expect(item3.getAttribute('aria-checked')).toEqual('true');

                        pressKeyItem(item3, 'Space');
                        expect(item3.getAttribute('aria-checked')).toEqual('false');

                        pressKeyItem(item3, 'Space');
                        expect(item3.getAttribute('aria-checked')).toEqual('true');
                    })
                );

                describe('"beforeChange()" method & Checked value not defined', () => {
                    describe('"newState" argument', () => {
                        describe('Checkbox Groups', () => {
                            it(
                                'should pass "true" when item checked state is initially undefined',
                                autoFlush(() => {
                                    const beforeChangeSpy = jasmine.createSpy('beforeChange');

                                    setItems([
                                        {
                                            type: 'checkbox',
                                            items: [{ label: 'item1', beforeChange: beforeChangeSpy }],
                                        },
                                    ]);
                                    openMenu();

                                    clickItem(getItem(getMenu(0), 0));
                                    expect(beforeChangeSpy).toHaveBeenCalledWith(
                                        jasmine.any(Object), // itemCtx
                                        jasmine.any(Object), // menuCtx
                                        true // newState
                                    );
                                })
                            );

                            it(
                                'should pass "true" when item is initially unchecked',
                                autoFlush(() => {
                                    const beforeChangeSpy = jasmine.createSpy('beforeChange');

                                    setItems([
                                        {
                                            type: 'checkbox',
                                            items: [{ label: 'item1', checked: false, beforeChange: beforeChangeSpy }],
                                        },
                                    ]);
                                    openMenu();

                                    clickItem(getItem(getMenu(0), 0));
                                    expect(beforeChangeSpy).toHaveBeenCalledWith(
                                        jasmine.any(Object), // itemCtx
                                        jasmine.any(Object), // menuCtx
                                        true // newState
                                    );
                                })
                            );

                            it(
                                'should pass "false" when item is initially checked',
                                autoFlush(() => {
                                    const beforeChangeSpy = jasmine.createSpy('beforeChange');

                                    setItems([
                                        {
                                            type: 'checkbox',
                                            items: [{ label: 'item1', checked: true, beforeChange: beforeChangeSpy }],
                                        },
                                    ]);
                                    openMenu();

                                    clickItem(getItem(getMenu(0), 0));
                                    expect(beforeChangeSpy).toHaveBeenCalledWith(
                                        jasmine.any(Object), // itemCtx
                                        jasmine.any(Object), // menuCtx
                                        false // newState
                                    );
                                })
                            );
                        });

                        describe('Radio Groups', () => {
                            it(
                                'should pass "true" when item checked state is initially undefined',
                                autoFlush(() => {
                                    const beforeChangeSpy = jasmine.createSpy('beforeChange');

                                    setItems([
                                        {
                                            type: 'radio',
                                            items: [{ label: 'item1', beforeChange: beforeChangeSpy }],
                                        },
                                    ]);
                                    openMenu();

                                    clickItem(getItem(getMenu(0), 0));
                                    expect(beforeChangeSpy).toHaveBeenCalledWith(
                                        jasmine.any(Object), // itemCtx
                                        jasmine.any(Object), // menuCtx
                                        true // newState
                                    );
                                })
                            );

                            it(
                                'should pass "true" when item is initially unchecked',
                                autoFlush(() => {
                                    const beforeChangeSpy = jasmine.createSpy('beforeChange');

                                    setItems([
                                        {
                                            type: 'radio',
                                            items: [{ label: 'item1', checked: false, beforeChange: beforeChangeSpy }],
                                        },
                                    ]);
                                    openMenu();

                                    clickItem(getItem(getMenu(0), 0));
                                    expect(beforeChangeSpy).toHaveBeenCalledWith(
                                        jasmine.any(Object), // itemCtx
                                        jasmine.any(Object), // menuCtx
                                        true // newState
                                    );
                                })
                            );

                            it(
                                'should pass "true" even when item is initially checked',
                                autoFlush(() => {
                                    const beforeChangeSpy = jasmine.createSpy('beforeChange');

                                    setItems([
                                        {
                                            type: 'radio',
                                            items: [{ label: 'item1', checked: true, beforeChange: beforeChangeSpy }],
                                        },
                                    ]);
                                    openMenu();

                                    clickItem(getItem(getMenu(0), 0));
                                    expect(beforeChangeSpy).toHaveBeenCalledWith(
                                        jasmine.any(Object), // itemCtx
                                        jasmine.any(Object), // menuCtx
                                        true // newState
                                    );
                                })
                            );
                        });
                    });

                    it(
                        'should toggle state for void return',
                        autoFlush(() => {
                            openMenu();

                            const item7 = getItem(getMenu(0), 6);
                            expect(item7.getAttribute('aria-checked')).toEqual('false');

                            pressKeyItem(item7, 'Space');
                            expect(item7.getAttribute('aria-checked')).toEqual('true');

                            pressKeyItem(item7, 'Space');
                            expect(item7.getAttribute('aria-checked')).toEqual('false');
                        })
                    );

                    it(
                        'should toggle state for boolean return',
                        autoFlush(() => {
                            openMenu();

                            const item8 = getItem(getMenu(0), 7);
                            expect(item8.getAttribute('aria-checked')).toEqual('false');

                            pressKeyItem(item8, 'Enter');
                            expect(item8.getAttribute('aria-checked')).toEqual('true');

                            pressKeyItem(item8, 'Enter');
                            expect(item8.getAttribute('aria-checked')).toEqual('false');
                        })
                    );

                    it(
                        'should toggle state for Observable<boolean> return',
                        autoFlush(() => {
                            openMenu();

                            const item9 = getItem(getMenu(0), 8);
                            expect(item9.getAttribute('aria-checked')).toEqual('false');

                            clickItem(item9);
                            expect(item9.getAttribute('aria-checked')).toEqual('true');

                            clickItem(item9);
                            expect(item9.getAttribute('aria-checked')).toEqual('false');
                        })
                    );

                    it(
                        'should toggle state for Observable<undefined> return',
                        autoFlush(() => {
                            openMenu();

                            const item10 = getItem(getMenu(0), 9);
                            expect(item10.getAttribute('aria-checked')).toEqual('false');

                            clickItem(item10);
                            expect(item10.getAttribute('aria-checked')).toEqual('true');

                            clickItem(item10);
                            expect(item10.getAttribute('aria-checked')).toEqual('false');
                        })
                    );

                    it(
                        'should toggle state for Promise<boolean> return',
                        autoFlush(() => {
                            openMenu();

                            const item11 = getItem(getMenu(0), 10);
                            expect(item11.getAttribute('aria-checked')).toEqual('false');

                            clickItem(item11);
                            expect(item11.getAttribute('aria-checked')).toEqual('true');

                            clickItem(item11);
                            expect(item11.getAttribute('aria-checked')).toEqual('false');
                        })
                    );

                    it(
                        'should toggle state for Promise<undefined> return',
                        autoFlush(() => {
                            openMenu();

                            const item12 = getItem(getMenu(0), 11);
                            expect(item12.getAttribute('aria-checked')).toEqual('false');

                            clickItem(item12);
                            expect(item12.getAttribute('aria-checked')).toEqual('true');

                            clickItem(item12);
                            expect(item12.getAttribute('aria-checked')).toEqual('false');
                        })
                    );

                    it(
                        'should throw a console warn when error occurs',
                        autoFlush(() => {
                            openMenu();

                            const item13 = getItem(getMenu(0), 12);
                            spyOn(console, 'warn');

                            clickItem(item13);
                            expect(console.warn).toHaveBeenCalledWith(new Error('error'));
                        })
                    );
                });
            });

            describe('Closing Behavior ("closeOnSelect" inheritance)', () => {
                it(
                    'should close the menu if item is set to "true"',
                    autoFlush(() => {
                        openMenu();

                        const item4 = getItem(getMenu(0), 3);
                        clickItem(item4);

                        expect(group1.items[3].checked).toBeFalse();
                        expect(getMenuCount()).toBe(0);
                    })
                );

                it(
                    'should close the menu when the parent is set to "true"',
                    autoFlush(() => {
                        openMenu();

                        const item5 = getItem(getMenu(0), 4);
                        clickItem(item5);
                        expect(group2.items[0].checked).toBeFalse();
                        expect(getMenuCount()).toBe(0);
                    })
                );

                it(
                    'should NOT close the menu if parent is set to "true" but item is set to "false"',
                    autoFlush(() => {
                        openMenu();

                        const item6 = getItem(getMenu(0), 5);
                        clickItem(item6);
                        expect(group2.items[1].checked).toBeTrue();
                        expect(getMenuCount()).toBe(1);
                    })
                );
            });
        });

        describe('Radio items', () => {
            let group1: MenuGroupSelectableStack;
            let group2: MenuGroupSelectableStack;

            const validateItemsState = (group: MenuGroupSelectableStack, idxTrue: number): void => {
                group.items.forEach(({ checked }, idx) => expect(checked).toBe(idx === idxTrue));
            };

            beforeEach(() => {
                group1 = {
                    type: 'radio',
                    items: [
                        { label: 'item1', checked: true },
                        { label: 'item2', checked: false },
                        { label: 'item3', closeOnSelect: true, className: 'radio-item-a' },
                    ],
                };
                group2 = {
                    type: 'radio',
                    closeOnSelect: true,
                    items: [{ label: 'item4' }, { label: 'item5', checked: false, closeOnSelect: false }],
                };
                setItems([group1, group2]);
            });

            it(
                'should have the given class name applied to the radio item',
                autoFlush(() => {
                    openMenu();

                    const item = getItem(getMenu(0), 2).classList;
                    expect(item.contains('radio-item-a')).toBeTrue();
                })
            );

            it(
                'should have the "role" attribute set to "menuitemradio"',
                autoFlush(() => {
                    openMenu();
                    expect(getItem(getMenu(0), 0).getAttribute('role')).toEqual('menuitemradio');
                })
            );

            describe('State Management ("aria-checked" attribute)', () => {
                it(
                    'should set state to "true" for the activated item and "false" for siblings in the same group',
                    autoFlush(() => {
                        openMenu();
                        const itemIdx = 1;
                        const item2 = getItem(getMenu(0), itemIdx);
                        expect(item2.getAttribute('aria-checked')).toEqual('false');

                        clickItem(item2);
                        expect(item2.getAttribute('aria-checked')).toEqual('true');

                        validateItemsState(group1, itemIdx);
                    })
                );

                it(
                    'should NOT uncheck the item if it is already checked and activated again',
                    autoFlush(() => {
                        openMenu();
                        const itemIdx = 0;
                        const item1 = getItem(getMenu(0), itemIdx);
                        expect(item1.getAttribute('aria-checked')).toEqual('true');

                        clickItem(item1);
                        expect(item1.getAttribute('aria-checked')).toEqual('true');

                        validateItemsState(group1, itemIdx);
                    })
                );

                (['Enter', 'Space'] as const).forEach((keyToPress) => {
                    it(
                        `should update state when "${keyToPress}" is pressed`,
                        autoFlush(() => {
                            openMenu();
                            const itemIdx = 1;
                            const item2 = getItem(getMenu(0), itemIdx);
                            expect(item2.getAttribute('aria-checked')).toEqual('false');

                            pressKeyItem(item2, keyToPress);
                            expect(item2.getAttribute('aria-checked')).toEqual('true');

                            validateItemsState(group1, itemIdx);
                        })
                    );
                });
            });

            describe('Closing Behavior ("closeOnSelect" inheritance)', () => {
                it(
                    'should close the menu if item is set to "true"',
                    autoFlush(() => {
                        openMenu();

                        const item3 = getItem(getMenu(0), 2);
                        clickItem(item3);

                        expect(getMenuCount()).toBe(0);
                        validateItemsState(group1, 2);
                    })
                );

                it(
                    'should close the menu when the parent is set to "true"',
                    autoFlush(() => {
                        openMenu();

                        const item4 = getItem(getMenu(0), 3);
                        clickItem(item4);

                        expect(getMenuCount()).toBe(0);
                        validateItemsState(group2, 0);
                    })
                );

                it(
                    'should NOT close the menu if parent is set to "true" but item is set to "false"',
                    autoFlush(() => {
                        openMenu();

                        const item5 = getItem(getMenu(0), 4);
                        clickItem(item5);

                        expect(getMenuCount()).toBe(1);
                        validateItemsState(group2, 1);
                    })
                );
            });
        });

        describe('Selectable items (Radio/Checkbox)', () => {
            describe('State Interceptors ("beforeChange")', () => {
                (['radio', 'checkbox'] as const).forEach((type) => {
                    describe(`Execution Types (Item level) for type "${type}"`, () => {
                        let syncUpdate: boolean = false;

                        const initGroup = (beforeChange: jasmine.Func): void =>
                            setItems([{ type, items: [{ label: 'item1', beforeChange }] }]);

                        it(
                            'should change state when returning void (Sync)',
                            autoFlush(() => {
                                initGroup(() => (syncUpdate = true));
                                openMenu('Enter');

                                sendKey('Enter');
                                expect(getItem(getMenu(0), 0).getAttribute('aria-checked')).toBe('true');
                                expect(syncUpdate).toBeTrue();
                            })
                        );

                        it(
                            'should NOT change state when returning false (Sync)',
                            autoFlush(() => {
                                const syncSpy = jasmine.createSpy('beforeChange').and.returnValue(false);
                                initGroup(syncSpy);
                                openMenu('Enter');

                                sendKey('Enter');
                                expect(syncSpy).toHaveBeenCalled();
                                expect(getItem(getMenu(0), 0).getAttribute('aria-checked')).toBe('false');
                            })
                        );

                        it(
                            'should resolve Promise and apply state accordingly',
                            autoFlush(() => {
                                const promiseSpy = jasmine
                                    .createSpy('beforeChange')
                                    .and.returnValue(Promise.resolve(true));
                                initGroup(promiseSpy);
                                openMenu('Enter');

                                sendKey('Enter');
                                expect(promiseSpy).toHaveBeenCalled();
                                expect(getItem(getMenu(0), 0).getAttribute('aria-checked')).toBe('true');
                            })
                        );

                        it(
                            'should resolve Observable and apply state accordingly',
                            autoFlush(() => {
                                const obsSpy = jasmine.createSpy('beforeChange').and.returnValue(of(false));
                                initGroup(obsSpy);
                                openMenu('Enter');

                                sendKey('Enter');
                                expect(obsSpy).toHaveBeenCalled();
                                expect(getItem(getMenu(0), 0).getAttribute('aria-checked')).toBe('false');
                            })
                        );
                    });

                    describe(`Inheritance & Overrides for type "${type}"`, () => {
                        it(
                            'should execute the Group function when the Item has no function defined',
                            autoFlush(() => {
                                const groupSpy = jasmine.createSpy('groupBeforeChange').and.returnValue(true);
                                setItems([{ type, items: [{ label: 'item1' }], beforeChange: groupSpy }]);

                                openMenu('Enter');
                                sendKey('Enter');

                                expect(groupSpy).toHaveBeenCalled();
                                expect(getItem(getMenu(0), 0).getAttribute('aria-checked')).toBe('true');
                            })
                        );

                        it(
                            'should execute the Item function and IGNORE the Group function when both are defined',
                            autoFlush(() => {
                                const groupSpy = jasmine.createSpy('groupBeforeChange').and.returnValue(true);
                                const itemSpy = jasmine.createSpy('itemBeforeChange').and.returnValue(false);
                                setItems([
                                    {
                                        type,
                                        items: [{ label: 'item1', beforeChange: itemSpy }],
                                        beforeChange: groupSpy,
                                    },
                                ]);

                                openMenu('Enter');
                                sendKey('Enter');

                                expect(itemSpy).toHaveBeenCalled();
                                expect(groupSpy).not.toHaveBeenCalled();
                                expect(getItem(getMenu(0), 0).getAttribute('aria-checked')).toBe('false');
                            })
                        );
                    });
                });
            });
        });

        describe('Submenu items', () => {
            beforeEach(() =>
                setItems([
                    {
                        label: 'item1',
                        submenu: [{ label: 'item1a', submenu: [{ label: 'item1a1' }] }],
                        className: 'submenu-item-1',
                    },
                    { label: 'item2' },
                ])
            );

            it(
                'should have the given class name applied to the submenu item',
                autoFlush(() => {
                    openMenu();

                    const item = getItem(getMenu(0), 0).classList;
                    expect(item.contains('submenu-item-1')).toBeTrue();
                })
            );

            it(
                'should have the "role" attribute set to "menuitem"',
                autoFlush(() => {
                    openMenu();
                    expect(getItem(getMenu(0), 0).getAttribute('role')).toEqual('menuitem');
                })
            );

            it(
                'should have "aria-haspopup" attribute set to "menu"',
                autoFlush(() => {
                    openMenu();

                    const item1 = getItem(getMenu(0), 0); // item1
                    expect(item1.getAttribute('aria-haspopup')).toEqual('menu');

                    mouseEnterItem(item1);
                    const item2 = getItem(getMenu(1), 0); // item1a
                    expect(item2.getAttribute('aria-haspopup')).toEqual('menu');

                    mouseEnterItem(item2);
                    const item3 = getItem(getMenu(2), 0); // item1a1
                    expect(item3.getAttribute('aria-haspopup')).toBeNull();
                })
            );

            it(
                'should toggle "aria-expanded" attribute between "true" and "false"',
                autoFlush(() => {
                    openMenu();

                    const item1 = getItem(getMenu(0), 0); // item1
                    expect(item1.getAttribute('aria-expanded')).toEqual('false');

                    mouseEnterItem(item1);
                    expect(item1.getAttribute('aria-expanded')).toEqual('true');

                    sendKey('Escape'); // closing submenu
                    expect(item1.getAttribute('aria-expanded')).toEqual('false');
                })
            );

            it(
                'should link the trigger to the opened submenu via "aria-controls"',
                autoFlush(() => {
                    openMenu();

                    const item1 = getItem(getMenu(0), 0); // item1
                    mouseEnterItem(item1);

                    const submenu1 = getMenu(1);
                    expect(item1.getAttribute('aria-controls')).toEqual(submenu1.getAttribute('id'));

                    const item2 = getItem(submenu1, 0); // item1a
                    mouseEnterItem(item2);

                    const submenu2 = getMenu(2);
                    expect(item2.getAttribute('aria-controls')).toEqual(submenu2.getAttribute('id'));
                })
            );
        });

        describe('Non-Actionable items', () => {
            it(
                'should NOT destroy the menu when clicking on an "info" item',
                autoFlush(() => {
                    setItems([{ label: 'item1' }, { info: 'info1' }]);
                    openMenu();

                    const item = getItemInfo(getMenu(0), 0);
                    spyOn(service, 'destroyMenu');

                    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                    expect(service.destroyMenu).not.toHaveBeenCalled();
                })
            );

            it(
                'should NOT destroy the menu when clicking on a "separator" item',
                autoFlush(() => {
                    setItems([{ label: 'item1' }, { separator: true }, { label: 'item2' }]);
                    openMenu();

                    const separator = getMenu(0).querySelector('a11y-menu-separator') as HTMLElement;
                    spyOn(service, 'destroyMenu');

                    separator.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                    expect(service.destroyMenu).not.toHaveBeenCalled();
                })
            );
        });

        describe('Focus management', () => {
            it(
                'should scroll the item into view when is within an inline group',
                autoFlush(() => {
                    setConfig({ maxWidth: '600px' });
                    setItems([
                        {
                            icon: 'a',
                            label: 'item inline label',
                            itemsLayout: 'inline',
                            items: [{ label: 'item1' }, { label: 'item2' }, { label: 'item3' }, { label: 'item4' }],
                        },
                    ]);
                    openMenu();

                    const item = getItem(getMenu(0), 3);
                    spyOn(item, 'scrollIntoView');

                    focusItem(item);
                    expect(item.scrollIntoView).toHaveBeenCalledWith({
                        inline: 'nearest',
                        block: 'nearest',
                        behavior: 'smooth',
                    });
                })
            );
        });

        describe('Disabled state', () => {
            const item1: MenuItem = { label: 'item1', disabled: true };
            const groupRadios: MenuGroupSelectableStack = {
                type: 'radio',
                items: [
                    { label: 'item2', checked: true, disabled: true },
                    { label: 'item3', disabled: true },
                ],
            };
            const groupCheckboxes: MenuGroupSelectableStack = {
                type: 'checkbox',
                items: [
                    { label: 'item4', checked: true, disabled: true },
                    { label: 'item5', checked: false, disabled: true },
                ],
            };
            const itemSubmenu: MenuItemSubmenu = { label: 'item6', disabled: true, submenu: [{ label: 'item6a' }] };

            beforeEach(() => setItems([item1, groupRadios, groupCheckboxes, itemSubmenu]));

            describe('Attributes', () => {
                it(
                    'should have the "aria-disabled" attribute set to "true" and no "aria-hidden" at all',
                    autoFlush(() => {
                        openMenu();
                        const items = Array.from(getMenu(0).querySelectorAll('[menu-item]'));
                        items.forEach((item) => {
                            expect(item.getAttribute('aria-disabled')).toEqual('true');
                            expect(item.getAttribute('aria-hidden')).toBeNull();
                        });
                    })
                );

                it(
                    'should have the "aria-hidden" attribute set to "true" when disabled items are NOT allowed to be navigated',
                    autoFlush(() => {
                        setConfig({ allowNavigateDisabled: false });
                        openMenu();
                        const items = Array.from(getMenu(0).querySelectorAll('[menu-item]'));
                        items.forEach((item) => expect(item.getAttribute('aria-hidden')).toEqual('true'));
                    })
                );
            });

            describe('Pointer interactions', () => {
                it(
                    'should NOT emit action when clicked',
                    autoFlush(() => {
                        openMenu();
                        spyOn(component.menu.itemSelected, 'emit');

                        clickItem(getItem(getMenu(0), 0)); // item1
                        expect(component.menu.itemSelected.emit).not.toHaveBeenCalled();
                    })
                );

                it(
                    'should NOT change state when clicked on a radio item',
                    autoFlush(() => {
                        openMenu();

                        clickItem(getItem(getMenu(0), 2)); // item3
                        expect(groupRadios.items[1].checked).toBeUndefined();
                    })
                );

                it(
                    'should NOT change state when clicked on a checkbox item',
                    autoFlush(() => {
                        openMenu();

                        clickItem(getItem(getMenu(0), 3)); // item4
                        expect(groupCheckboxes.items[0].checked).toBeTrue();
                    })
                );

                it(
                    'should NOT open the submenu when clicked',
                    autoFlush(() => {
                        openMenu();

                        clickItem(getItem(getMenu(0), 5)); // item6
                        expect(getMenuCount()).toBe(1);
                    })
                );

                it(
                    'should NOT close the menu when clicked',
                    autoFlush(() => {
                        openMenu();
                        clickItem(getItem(getMenu(0), 0)); // item1
                        expect(getMenuCount()).toBe(1);
                    })
                );
            });

            describe('Keyboard interactions', () => {
                (['Enter', 'Space'] as const).forEach((keyToPress) => {
                    it(
                        `should NOT emit action when "${keyToPress}" is pressed`,
                        autoFlush(() => {
                            openMenu();

                            spyOn(component.menu.itemSelected, 'emit');

                            const item = getItem(getMenu(0), 0); // item1
                            pressKeyItem(item, keyToPress);
                            expect(component.menu.itemSelected.emit).not.toHaveBeenCalled();
                        })
                    );

                    it(
                        `should NOT change state when "${keyToPress}" is pressed on a radio item`,
                        autoFlush(() => {
                            openMenu();
                            const item = getItem(getMenu(0), 2); // item3
                            pressKeyItem(item, keyToPress);
                            expect(groupRadios.items[1].checked).toBeUndefined();
                        })
                    );

                    it(
                        `should NOT change state when "${keyToPress}" is pressed on a checkbox item`,
                        autoFlush(() => {
                            openMenu();

                            const item = getItem(getMenu(0), 3); // item4
                            pressKeyItem(item, keyToPress);
                            expect(groupCheckboxes.items[0].checked).toBeTrue();
                        })
                    );
                });

                it(
                    'should NOT open the submenu when "Enter" is pressed',
                    autoFlush(() => {
                        openMenu();

                        const item = getItem(getMenu(0), 5); // item6
                        pressKeyItem(item, 'Enter');
                        expect(getMenuCount()).toBe(1);
                    })
                );

                it(
                    'should NOT close the menu when "Enter" is pressed',
                    autoFlush(() => {
                        openMenu();
                        const item = getItem(getMenu(0), 0); // item1
                        pressKeyItem(item, 'Enter');
                        expect(getMenuCount()).toBe(1);
                    })
                );
            });
        });
    });

    describe('Layouts & Item Grouping', () => {
        describe('Group Layout ("layout" property)', () => {
            beforeEach(() =>
                setItems([
                    { label: 'group label', items: [{ label: 'item1' }], className: 'group-class-1 group-class-2' },
                ])
            );

            describe('Stack layout (Default) for Stacked items', () => {
                it(
                    'should wrap the group in a container with role="group" and other basic attributes',
                    autoFlush(() => {
                        openMenu();
                        const group = getMenu(0).querySelector('a11y-menu-group');
                        expect(group).toBeTruthy();
                        expect(group?.getAttribute('role')).toEqual('group');
                        expect(group?.getAttribute('menu-group')).toEqual('common');
                        expect(group?.getAttribute('aria-label')).toEqual('group label');
                        expect(group?.getAttribute('has-icons')).toBeNull();
                        expect(group?.querySelectorAll('[menu-item]').length).toBe(1);
                    })
                );

                it(
                    'should have the "menu-group" attribute with "radio" for radio items',
                    autoFlush(() => {
                        setItems([{ type: 'radio', items: [{ label: 'item1' }] }]);
                        openMenu();
                        const group = getMenu(0).querySelector('a11y-menu-group');
                        expect(group?.getAttribute('menu-group')).toEqual('radio');
                    })
                );

                it(
                    'should have the "menu-group" attribute with "checkbox" for checkbox items',
                    autoFlush(() => {
                        setItems([{ type: 'checkbox', items: [{ label: 'item1' }] }]);
                        openMenu();
                        const group = getMenu(0).querySelector('a11y-menu-group');
                        expect(group?.getAttribute('menu-group')).toEqual('checkbox');
                    })
                );

                it(
                    'should have the "has-icons" attribute when contains at least one item with icon',
                    autoFlush(() => {
                        setItems([
                            { label: 'group label', items: [{ label: 'item1' }, { label: 'item2', icon: 'x' }] },
                        ]);
                        openMenu();
                        const group = getMenu(0).querySelector('a11y-menu-group');
                        expect(group?.getAttribute('has-icons')).toEqual('');
                    })
                );

                it(
                    'should have the given class names applied to the group wrapper',
                    autoFlush(() => {
                        openMenu();
                        const groupClass = getMenu(0).querySelector('a11y-menu-group')?.classList;
                        expect(groupClass?.contains('group-class-1')).toBeTrue();
                        expect(groupClass?.contains('group-class-2')).toBeTrue();
                    })
                );

                it(
                    'should NOT have the "aria-label" applied when no label provided',
                    autoFlush(() => {
                        setItems([{ items: [{ label: 'item1' }] }]);
                        openMenu();

                        const group = getMenu(0).querySelector('a11y-menu-group');
                        expect(group?.getAttribute('aria-label')).toBeNull();
                    })
                );

                describe('Group Label', () => {
                    it(
                        'should render the group label above the items by default and be in uppercase',
                        autoFlush(() => {
                            openMenu();
                            const groupLabel = getMenu(0).querySelector('a11y-menu-group [menu-group-label]');
                            expect(groupLabel).toBeTruthy();
                            expect(groupLabel?.getAttribute('aria-hidden')).toEqual('true');
                            expect(groupLabel?.textContent).toEqual('group label');
                            expect(getComputedStyle(groupLabel as HTMLElement).textTransform).toEqual('uppercase');
                        })
                    );

                    it(
                        'should render the group label above the items when group overrides config',
                        autoFlush(() => {
                            setConfig({ showGroupLabels: false });
                            setItems([{ label: 'group label', items: [{ label: 'item1' }], showLabel: true }]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group');
                            expect(group?.getAttribute('aria-label')).toEqual('group label');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeTruthy();
                        })
                    );

                    it(
                        'should NOT render the group label but have it applied with "aria-label" using menu config',
                        autoFlush(() => {
                            setConfig({ showGroupLabels: false });
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group');
                            expect(group?.getAttribute('aria-label')).toEqual('group label');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeFalsy();
                        })
                    );

                    it(
                        'should NOT render the group label but have it applied with "aria-label" using group config',
                        autoFlush(() => {
                            setItems([{ label: 'group label', items: [{ label: 'item1' }], showLabel: false }]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group');
                            expect(group?.getAttribute('aria-label')).toEqual('group label');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeFalsy();
                        })
                    );
                });
            });

            describe('Stack layout (Default) for Inline items', () => {
                (['inline', 'grid'] as const).forEach((itemsLayout) => {
                    it(
                        'should NOT render the group label but have it applied with "aria-label" using menu config',
                        autoFlush(() => {
                            setConfig({ showGroupLabels: false });
                            setItems([{ label: 'group label', itemsLayout, items: [{ label: 'item1' }] } as MenuGroup]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            expect(group?.getAttribute('aria-label')).toEqual('group label');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeFalsy();
                        })
                    );

                    it(
                        'should render the group label when group overrides config',
                        autoFlush(() => {
                            setConfig({ showGroupLabels: false });
                            setItems([
                                {
                                    label: 'group label',
                                    itemsLayout,
                                    items: [{ label: 'item1' }],
                                    showLabel: true,
                                } as MenuGroup,
                            ]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            expect(group?.getAttribute('aria-label')).toEqual('group label');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeTruthy();
                        })
                    );

                    it(
                        'should NOT render the group label but have it applied with "aria-label" using group config',
                        autoFlush(() => {
                            setItems([
                                {
                                    label: 'group label',
                                    itemsLayout,
                                    items: [{ label: 'item1' }],
                                    showLabel: false,
                                } as MenuGroup,
                            ]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            expect(group?.getAttribute('aria-label')).toEqual('group label');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeFalsy();
                        })
                    );

                    it(
                        `should wrap the group in a container with role="group" and other basic attributes for ${itemsLayout} items`,
                        autoFlush(() => {
                            setItems([{ label: 'group label', itemsLayout, items: [{ label: 'item1' }] } as MenuGroup]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            expect(group).toBeTruthy();
                            expect(group?.getAttribute('role')).toEqual('group');
                            expect(group?.getAttribute('menu-group')).toEqual('inline');
                            expect(group?.getAttribute('layout')).toEqual('stack');

                            const groupLabel = group?.querySelector('[menu-group-label]');
                            expect(groupLabel).toBeTruthy();
                            expect(getComputedStyle(groupLabel as HTMLElement).textTransform).toEqual('uppercase');
                        })
                    );

                    it(
                        `should have the given class names applied to the ${itemsLayout} group wrapper`,
                        autoFlush(() => {
                            setItems([
                                {
                                    itemsLayout,
                                    items: [{ label: 'item1' }],
                                    className: `${itemsLayout}-group-class-1 ${itemsLayout}-group-class-2`,
                                } as MenuGroup,
                            ]);
                            openMenu();

                            const groupClass = getMenu(0).querySelector('a11y-menu-group-inline')?.classList;
                            expect(groupClass?.contains(`${itemsLayout}-group-class-1`)).toBeTrue();
                            expect(groupClass?.contains(`${itemsLayout}-group-class-2`)).toBeTrue();
                        })
                    );
                });
            });

            describe('Inline layout', () => {
                beforeEach(() =>
                    setItems([
                        {
                            layout: 'inline',
                            itemsLayout: 'inline',
                            label: 'inline group',
                            icon: { src: '/icon-inline.svg' },
                            items: [{ label: 'item1' }],
                        },
                    ])
                );

                describe('Inline Items', () => {
                    it(
                        `should wrap the group of items in a container with role="group" and other basic attributes`,
                        autoFlush(() => {
                            openMenu();
                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            expect(group).toBeTruthy();
                            expect(group?.getAttribute('role')).toEqual('group');
                            expect(group?.getAttribute('menu-group')).toEqual('inline');
                            expect(group?.getAttribute('layout')).toEqual('inline');
                        })
                    );
                });

                describe('Grid Items', () => {
                    beforeEach(() =>
                        setItems([{ layout: 'inline', itemsLayout: 'grid', items: [{ label: 'item1' }] }])
                    );

                    it(
                        `should wrap the group of items in a container with role="group" and other basic attributes`,
                        autoFlush(() => {
                            openMenu();
                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            expect(group).toBeTruthy();
                            expect(group?.getAttribute('role')).toEqual('group');
                            expect(group?.getAttribute('menu-group')).toEqual('inline');
                            expect(group?.getAttribute('layout')).toEqual('inline');
                        })
                    );
                });

                it(
                    'should render the icon, label, and the container with the item',
                    autoFlush(() => {
                        openMenu();

                        const group = getMenu(0).querySelector('a11y-menu-group-inline');
                        expect(group?.getAttribute('aria-label')).toEqual('inline group');

                        const icon = group?.querySelector('a11y-icon img');
                        expect(icon).toBeTruthy();
                        expect(icon?.getAttribute('src')).toEqual('/icon-inline.svg');

                        const label = group?.querySelector('[menu-group-label]');
                        expect(label).toBeTruthy();
                        expect(label?.textContent).toEqual('inline group');
                        expect(label?.getAttribute('aria-hidden')).toEqual('true');
                        expect(getComputedStyle(label as HTMLElement).textTransform).not.toEqual('uppercase');

                        const groupOfItems = group?.querySelector('[menu-group-items]');
                        expect(groupOfItems).toBeTruthy();
                        expect(groupOfItems?.getAttribute('role')).toEqual('none');
                        expect(groupOfItems?.querySelectorAll('[menu-item]')?.length).toBe(1);
                    })
                );
            });
        });

        describe('Item Layout ("itemsLayout" property)', () => {
            describe('"[has-icons]" attribute', () => {
                it(
                    'should NOT apply the attribute when no items have icons',
                    autoFlush(() => {
                        setItems([{ itemsLayout: 'grid', items: [{ label: 'item1' }, { label: 'item2' }] }]);
                        openMenu();

                        const group = getMenu(0).querySelector('a11y-menu-group-inline');
                        const groupOfItems = group?.querySelector('[menu-group-items]');
                        expect(groupOfItems?.getAttribute('has-icons')).toBeNull();
                    })
                );

                it(
                    'should apply the attribute when at least one item has an icon',
                    autoFlush(() => {
                        setItems([{ itemsLayout: 'grid', items: [{ label: 'item1' }, { label: 'item2', icon: 'i' }] }]);
                        openMenu();

                        const group = getMenu(0).querySelector('a11y-menu-group-inline');
                        const groupOfItems = group?.querySelector('[menu-group-items]');
                        expect(groupOfItems?.getAttribute('has-icons')).toEqual('');
                    })
                );
            });

            describe('"[has-icons-only]" attribute', () => {
                itemWithLabel.forEach((itemsLabelPosition) => {
                    it(
                        `should NOT apply the attribute when at least one item has an icon AND label position is "${itemsLabelPosition}"`,
                        autoFlush(() => {
                            setItems([
                                {
                                    itemsLayout: 'inline',
                                    itemsLabelPosition,
                                    items: [{ label: 'item1' }, { label: 'item2', icon: 'i' }],
                                } as MenuGroup,
                            ]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            const groupOfItems = group?.querySelector('[menu-group-items]');
                            expect(groupOfItems?.getAttribute('has-icons-only')).toBeNull();
                        })
                    );
                });

                itemWithNoLabel.forEach((itemsLabelPosition) => {
                    it(
                        `should NOT apply the attribute when no items have icons AND label position is "${itemsLabelPosition}"`,
                        autoFlush(() => {
                            setItems([
                                {
                                    itemsLayout: 'grid',
                                    itemsLabelPosition,
                                    items: [{ label: 'item1' }, { label: 'item2' }],
                                } as MenuGroup,
                            ]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            const groupOfItems = group?.querySelector('[menu-group-items]');
                            expect(groupOfItems?.getAttribute('has-icons-only')).toBeNull();
                        })
                    );

                    it(
                        `should apply the attribute when at least one item has an icon AND label position is "${itemsLabelPosition}"`,
                        autoFlush(() => {
                            setItems([
                                {
                                    itemsLayout: 'inline',
                                    itemsLabelPosition,
                                    items: [{ label: 'item1' }, { label: 'item2', icon: 'i' }],
                                } as MenuGroup,
                            ]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline');
                            const groupOfItems = group?.querySelector('[menu-group-items]');
                            expect(groupOfItems?.getAttribute('has-icons-only')).toEqual('');
                        })
                    );
                });
            });

            describe('Inline layout', () => {
                beforeEach(() => setItems([{ itemsLayout: 'inline', items: [{ label: 'item1' }] }]));

                describe('Items Justify', () => {
                    const itemsJustify: (MenuGroupJustifyItems | '')[] = ['', 'start', 'end', 'space-between'];

                    itemsJustify.forEach((justify) => {
                        const expected: string =
                            justify === ''
                                ? 'should apply the "justify" attribute with "start" by default if "itemsJustify" prop was not defined in the group'
                                : `should apply the "justify" attribute with "${justify}"`;

                        it(
                            expected,
                            autoFlush(() => {
                                setItems([
                                    {
                                        layout: 'inline',
                                        itemsLayout: 'inline',
                                        items: [{ label: 'item1' }],
                                        ...(justify === '' ? {} : { itemsJustify: justify }),
                                    },
                                ]);

                                openMenu();

                                const group = getMenu(0).querySelector('a11y-menu-group-inline');
                                const groupOfItems = group?.querySelector('[menu-group-items]');
                                const expectedValue: MenuGroupJustifyItems = justify === '' ? 'start' : justify;
                                expect(groupOfItems?.getAttribute('justify')).toEqual(expectedValue);
                            })
                        );
                    });
                });
            });

            describe('Grid layout', () => {
                beforeEach(() => setItems([{ itemsLayout: 'grid', items: [{ label: 'item1' }] }]));

                it(
                    `should NOT have the "justify" attribute applied to the items container`,
                    autoFlush(() => {
                        openMenu();

                        const group = getMenu(0).querySelector('a11y-menu-group-inline');
                        const groupOfItems = group?.querySelector('[menu-group-items]');
                        expect(groupOfItems?.getAttribute('justify')).toBeNull();
                    })
                );

                const columnsToCheck: (number | undefined)[] = [undefined, 0, -4];
                columnsToCheck.forEach((columns) => {
                    let expected: string = 'should apply a default of 5 columns';

                    if (columns === undefined) expected += ' via inline CSS variables';
                    else if (columns === 0) expected += ' even if the defined value is zero';
                    else expected += ' even if the defined value is negative';

                    it(
                        expected,
                        autoFlush(() => {
                            setItems([{ itemsLayout: 'grid', items: [{ label: 'item1' }], columns }]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline') as HTMLElement;
                            const colsVar = group.style.getPropertyValue('--cols');
                            expect(colsVar).toEqual('5');
                        })
                    );
                });

                it(
                    'should apply custom columns when specified in the group',
                    autoFlush(() => {
                        setItems([{ itemsLayout: 'grid', items: [{ label: 'item1' }], columns: 9 }]);
                        openMenu();

                        const group = getMenu(0).querySelector('a11y-menu-group-inline') as HTMLElement;
                        const colsVar = group.style.getPropertyValue('--cols');
                        expect(colsVar).toEqual('9');
                    })
                );

                describe('"itemsFlow" property', () => {
                    it(
                        'should apply inline styles when "itemsFlow" is "column"',
                        autoFlush(() => {
                            const items: number = 3;
                            const columns: number = 2;
                            setItems([
                                {
                                    itemsLayout: 'grid',
                                    itemsFlow: 'column',
                                    items: Array.from({ length: items }, (_, idx) => ({ label: `item${idx}` })),
                                    columns,
                                },
                            ]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline') as HTMLElement;
                            const groupOfItems = group?.querySelector('[menu-group-items]') as HTMLElement;
                            const styles = groupOfItems.getAttribute('style');
                            expect(styles).toContain('grid-auto-flow: column;');
                            expect(styles).toContain(
                                `grid-template-rows: repeat(${Math.ceil(items / columns)}, auto);`
                            );
                        })
                    );

                    it(
                        'should NOT apply inline styles when "itemsFlow" is not defined (aka "row")',
                        autoFlush(() => {
                            setItems([{ itemsLayout: 'grid', items: [{ label: 'item1' }], columns: 4 }]);
                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline') as HTMLElement;
                            const groupOfItems = group?.querySelector('[menu-group-items]') as HTMLElement;
                            const styles = groupOfItems.getAttribute('style');
                            expect(styles).toBeFalsy();
                        })
                    );
                });
            });
        });

        describe('Mobile', () => {
            beforeEach(() => setMobile(true));

            it(
                'should render the items within the "[menu-body]" wrapper',
                autoFlush(() => {
                    setItems([{ label: 'item1' }]);
                    openMenu();

                    const menuBody = getMenu(0).querySelector('[menu-body]') as HTMLElement;
                    expect(menuBody.getAttribute('role')).toEqual('none');

                    const item = getItem(menuBody, 0);
                    expect(item?.textContent?.trim()).toEqual('item1');
                })
            );

            it(
                'should render only the "close" button (NOT the "back" button) for root menu',
                autoFlush(() => {
                    setItems([{ label: 'item1' }]);
                    openMenu();

                    const mobileHeader = getMenu(0).querySelector('[menu-header]');
                    expect(mobileHeader).toBeTruthy();

                    const mobileActions = mobileHeader?.querySelector('[menu-actions]');
                    expect(mobileActions).toBeTruthy();

                    const closeButton = mobileHeader?.querySelector('[action-close]');
                    expect(closeButton).toBeTruthy();

                    const backButton = mobileHeader?.querySelector('[action-back]');
                    expect(backButton).toBeNull();
                })
            );

            it(
                'should render both "close" and "back" buttons for a submenu',
                autoFlush(() => {
                    setItems([{ label: 'item1', submenu: [{ label: 'item1a', submenu: [{ label: 'item1a1' }] }] }]);

                    openMenu('Enter'); // focus first item
                    sendKey('Enter'); // open submenu

                    const mobileHeader = getMenu(1).querySelector('[menu-header]');
                    expect(mobileHeader).toBeTruthy();

                    const closeButton = mobileHeader?.querySelector('[action-close]');
                    expect(closeButton).toBeTruthy();

                    const backButton = mobileHeader?.querySelector('[action-back]');
                    expect(backButton).toBeTruthy();
                })
            );

            it(
                'should render the label',
                autoFlush(() => {
                    setItems([{ label: 'item1' }]);

                    component.label = 'mobile menu label';
                    openMenu();

                    const label = getMenu(0).querySelector('[menu-header] [menu-label]');
                    expect(label).toBeTruthy();
                    expect(label?.getAttribute('aria-hidden')).toEqual('true');
                    expect(label?.textContent?.trim()).toEqual('mobile menu label');
                })
            );

            it(
                'should render the separators with aria-hidden="true"',
                autoFlush(() => {
                    setItems([{ label: 'item1' }, { separator: true }]);
                    openMenu();

                    const separator = getMenu(0).querySelector('a11y-menu-separator');
                    expect(separator?.getAttribute('aria-hidden')).toEqual('true');
                })
            );
        });
    });

    describe('Non-Interactive / Structural Items', () => {
        describe('Separators', () => {
            let separators: HTMLElement[];

            const getSeparators = (): void => {
                separators = Array.from(getMenu(0).querySelectorAll('a11y-menu-separator')) as HTMLElement[];
            };

            describe('Basic Attributes', () => {
                it(
                    'should render an element with role="separator" and aria-orientation="horizontal" between two items',
                    autoFlush(() => {
                        setItems([{ label: 'item1' }, { separator: true }, { label: 'item2' }]);
                        openMenu();

                        getSeparators();
                        const separator = separators[0];
                        expect(isVisible(separator)).toBeTrue();
                        expect(separator.getAttribute('role')).toEqual('separator');
                        expect(separator.getAttribute('aria-orientation')).toEqual('horizontal');
                    })
                );

                it(
                    'should render an element with role="separator" and aria-orientation="vertical" between two inline items',
                    autoFlush(() => {
                        setItems([
                            {
                                itemsLayout: 'inline',
                                items: [{ label: 'item1' }, { separator: true }, { label: 'item2' }],
                            },
                        ]);
                        openMenu();

                        getSeparators();
                        tick(16);
                        const separator = separators[1]; // 0 and 2 are before/after the group
                        expect(isVisible(separator)).toBeTrue();
                        expect(separator.getAttribute('role')).toEqual('separator');
                        expect(separator.getAttribute('aria-orientation')).toEqual('vertical');
                    })
                );
            });

            describe('Visibility', () => {
                it(
                    'should NOT render if is the first element in the menu',
                    autoFlush(() => {
                        setItems([{ separator: true }, { label: 'item1' }]);
                        openMenu();

                        getSeparators();
                        expect(separators.length).toBe(1);

                        separators.forEach((separator) => expect(isVisible(separator)).toBeFalse());
                    })
                );

                it(
                    'should NOT render if is the last element in the menu',
                    autoFlush(() => {
                        setItems([{ label: 'item1' }, { separator: true }]);
                        openMenu();

                        getSeparators();
                        expect(separators.length).toBe(1);

                        separators.forEach((separator) => expect(isVisible(separator)).toBeFalse());
                    })
                );

                it(
                    'should render only one if there are more than two together',
                    autoFlush(() => {
                        setItems([
                            { label: 'item1' },
                            { separator: true },
                            { separator: true },
                            { separator: true },
                            { label: 'item2' },
                        ]);
                        openMenu();

                        getSeparators();
                        expect(separators.length).toBe(3);

                        separators.forEach((separator, idx) => expect(isVisible(separator)).toBe(idx === 0));
                    })
                );

                it(
                    'should render only one between two groups',
                    autoFlush(() => {
                        setItems([
                            { label: 'group1', items: [{ label: 'item1' }, { label: 'item2' }] },
                            { label: 'group2', items: [{ label: 'item3' }, { label: 'item4' }] },
                        ]);
                        openMenu();

                        getSeparators();
                        expect(separators.length).toBe(4);

                        separators.forEach((separator, idx) => expect(isVisible(separator)).toBe(idx === 1));
                    })
                );
            });
        });

        describe('Info Items', () => {
            beforeEach(() =>
                setItems([
                    {
                        closeOnSelect: false,
                        items: [
                            {
                                label: 'item1',
                                action: (_, menuCtx) => {
                                    menuCtx
                                        .getItemInfo('the-info')
                                        ?.update({ className: 'info-new-1', icon: 'a', info: 'infoNew1' });
                                },
                            },
                            { info: 'info1', value: 'the-info', className: ['info-class-a', 'info-class-b'] },
                            { info: 'info2' },
                            {
                                label: 'item2',
                                action: (_, menuCtx) => {
                                    menuCtx.getItemInfo('the-info')?.update({ icon: { src: '/b.jpg' } });
                                },
                            },
                        ],
                    },
                ])
            );

            it(
                'should render plain text without interactive ARIA roles (no menuitem)',
                autoFlush(() => {
                    openMenu();
                    const info = getItemInfo(getMenu(0), 0);
                    expect(info).toBeTruthy();
                    expect(info?.getAttribute('role')).toEqual('none');
                    expect(info?.getAttribute('menu-item-info')).toEqual('');
                })
            );

            it(
                'should NOT be focusable via keyboard navigation',
                autoFlush(() => {
                    openMenu('Enter');

                    const menu = getMenu(0);
                    const item1 = getItem(menu, 0);
                    const item2 = getItem(menu, 1);

                    expect(document.activeElement).toEqual(item1);
                    sendKey('ArrowDown');
                    expect(document.activeElement).toEqual(item2);
                })
            );

            it(
                'should have the given class names applied to the info item',
                autoFlush(() => {
                    openMenu();

                    const info = getItemInfo(getMenu(0), 0).classList;
                    expect(info.contains('info-class-a')).toBeTrue();
                    expect(info.contains('info-class-b')).toBeTrue();
                })
            );

            it(
                `should update the item's data through the getItemInfo() in the menu's context`,
                autoFlush(() => {
                    openMenu('Enter'); // focus on first action item

                    const info = getItemInfo(getMenu(0), 0);
                    expect(info.querySelector('[menu-item-label]')?.textContent).toEqual('info1');
                    expect(info.querySelector('[menu-item-icon]')?.textContent).toEqual('');
                    expect(info.classList.contains('info-class-b')).toBeTrue();

                    sendKey('Enter'); // execute the action method from the item

                    expect(info.querySelector('[menu-item-label]')?.textContent).toEqual('infoNew1');
                    expect(info.querySelector('[menu-item-icon]')?.textContent).toEqual('a');
                    expect(info.classList.contains('info-class-b')).toBeFalse();
                    expect(info.classList.contains('info-new-1')).toBeTrue();

                    sendKey('End'); // focus on last action item
                    sendKey('Enter'); // execute the action method from the item

                    expect(info.querySelector('[menu-item-icon] img')?.getAttribute('src')).toEqual('/b.jpg');
                    expect(info.classList.contains('info-new-1')).toBeTrue();
                })
            );
        });
    });

    describe('Interactive Item Anatomy & DOM Elements', () => {
        (['inline', 'grid'] as const).forEach((itemsLayout) => {
            describe(`When items layout is "${itemsLayout}"`, () => {
                describe('Labels', () => {
                    describe('Inline positions (CSS driven)', () => {
                        it(
                            'should apply the "item-labels" attribute with "start" value',
                            autoFlush(() => {
                                setItems([
                                    {
                                        items: [{ label: 'item1' }],
                                        itemsLayout,
                                        itemsLabelPosition: 'start',
                                    } as MenuGroup,
                                ]);

                                openMenu();

                                const group = getMenu(0).querySelector('a11y-menu-group-inline');
                                expect(group?.getAttribute('item-labels')).toEqual('start');
                            })
                        );

                        it(
                            'should apply the "item-labels" attribute with "end" value',
                            autoFlush(() => {
                                setItems([
                                    {
                                        items: [{ label: 'item1' }],
                                        itemsLayout,
                                        itemsLabelPosition: 'end',
                                    } as MenuGroup,
                                ]);

                                openMenu();

                                const group = getMenu(0).querySelector('a11y-menu-group-inline');
                                expect(group?.getAttribute('item-labels')).toEqual('end');
                            })
                        );

                        it(
                            'should apply the "item-labels" attribute with "below" value (default)',
                            autoFlush(() => {
                                setItems([{ items: [{ label: 'item1' }], itemsLayout } as MenuGroup]);

                                openMenu();

                                const group = getMenu(0).querySelector('a11y-menu-group-inline');
                                expect(group?.getAttribute('item-labels')).toEqual('below');
                            })
                        );
                    });

                    describe('External positions (DOM structure)', () => {
                        const getTooltip = (item: HTMLElement | null): HTMLElement | null => {
                            const tooltip = item?.nextElementSibling as HTMLElement | null;
                            return tooltip?.tagName.toLowerCase() === 'a11y-menu-tooltip' ? tooltip : null;
                        };

                        describe('Tooltip', () => {
                            beforeEach(() =>
                                setItems([
                                    {
                                        items: [{ label: 'item with tooltip' }],
                                        itemsLayout,
                                        columns: 1,
                                        itemsLabelPosition: 'tooltip',
                                    } as MenuGroup,
                                ])
                            );

                            it(
                                'should NOT have a visible label and apply the "item-labels" attribute with "tooltip" value',
                                autoFlush(() => {
                                    openMenu();

                                    const menu = getMenu(0);
                                    const group = menu.querySelector('a11y-menu-group-inline');
                                    expect(group?.getAttribute('item-labels')).toEqual('tooltip');

                                    const item = getItem(menu, 0);
                                    expect(item.querySelector('[menu-item-label]')).toBeNull();
                                    expect(item.getAttribute('aria-label')).toEqual('item with tooltip');
                                })
                            );

                            describe('Positioning', () => {
                                let trigger: HTMLElement;

                                beforeEach(() => {
                                    trigger = getTrigger();
                                    trigger.style.setProperty('position', 'fixed');
                                });

                                afterEach(() => {
                                    trigger.style.removeProperty('position');
                                    trigger.style.removeProperty('left');
                                    trigger.style.removeProperty('right');
                                });

                                it(
                                    'should open "center" aligned (default)',
                                    autoFlush(() => {
                                        trigger.style.setProperty('left', '50%');
                                        fixture.detectChanges();
                                        openMenu();

                                        const item = getItem(getMenu(0), 0);
                                        focusItem(item);

                                        const tooltipRect = getTooltip(item)?.getBoundingClientRect();
                                        const itemRect = item.getBoundingClientRect();
                                        expect(tooltipRect?.left).toBeLessThan(itemRect.left);
                                    })
                                );

                                it(
                                    'should open "start" aligned when has not enough space on the left side',
                                    autoFlush(() => {
                                        fixture.detectChanges();
                                        openMenu();

                                        const item = getItem(getMenu(0), 0);
                                        focusItem(item);

                                        const tooltipRect = (getTooltip(item) as HTMLElement).getBoundingClientRect();
                                        const itemRect = item.getBoundingClientRect();
                                        expect(Math.abs(tooltipRect.left - itemRect.left)).toBeLessThanOrEqual(1);
                                    })
                                );

                                it(
                                    'should open "end" aligned when has not enough space on the right side',
                                    autoFlush(() => {
                                        trigger.style.setProperty('right', '5px');
                                        fixture.detectChanges();
                                        openMenu();

                                        const item = getItem(getMenu(0), 0);
                                        focusItem(item);

                                        const tooltipRect = (getTooltip(item) as HTMLElement).getBoundingClientRect();
                                        const itemRect = item.getBoundingClientRect();
                                        expect(Math.abs(tooltipRect.right - itemRect.right)).toBeLessThanOrEqual(1);
                                    })
                                );
                            });

                            describe('Lifecycle', () => {
                                describe('Under keyboard', () => {
                                    it(
                                        'should open (on focus) and close (on blur)',
                                        autoFlush(() => {
                                            openMenu();

                                            const item = getItem(getMenu(0), 0);
                                            focusItem(item);

                                            let tooltip = getTooltip(item);
                                            expect(tooltip).toBeTruthy();
                                            expect(tooltip?.textContent?.trim()).toEqual('item with tooltip');

                                            blurItem(item);
                                            tooltip = getTooltip(item);
                                            expect(tooltip).toBeNull();
                                        })
                                    );
                                });

                                describe('Under pointer', () => {
                                    it(
                                        'should open (on mouseenter), close (on mouseleave) and set focus back to the menu',
                                        autoFlush(() => {
                                            openMenu();

                                            const menu = getMenu(0);
                                            const item = getItem(menu, 0);
                                            // When the engine sets physical focus on the item, we trigger the fake focus
                                            spyOn(item, 'focus').and.callFake(() => focusItem(item));

                                            mouseEnterItem(item);
                                            expect(item.focus).toHaveBeenCalled();

                                            let tooltip = getTooltip(item);
                                            expect(tooltip).toBeTruthy();
                                            expect(tooltip?.textContent?.trim()).toEqual('item with tooltip');

                                            // When the engine sets physical focus on the menu (after executing the mouseleave), we trigger the fake item blur
                                            spyOn(menu, 'focus').and.callFake(() => blurItem(item));

                                            mouseLeaveItem(item);
                                            expect(menu.focus).toHaveBeenCalled();

                                            tooltip = getTooltip(item);
                                            expect(tooltip).toBeNull();
                                        })
                                    );
                                });
                            });
                        });

                        // Only grid items allow "panels"
                        if (itemsLayout === 'grid') {
                            describe('Fixed Panels ("panel-below" or "panel-above")', () => {
                                beforeEach(() =>
                                    setItems([
                                        {
                                            items: [
                                                { label: 'item1' },
                                                { label: 'item2', shortcut: { key: 's', ctrlCmd: true } },
                                            ],
                                            itemsLayout,
                                            itemsLabelPosition: 'panel-above',
                                        } as MenuGroup,
                                    ])
                                );

                                it(
                                    'should have a visible empty panel',
                                    autoFlush(() => {
                                        openMenu();

                                        const menu = getMenu(0);
                                        const group = menu.querySelector('a11y-menu-group-inline');
                                        expect(group?.getAttribute('item-labels')).toEqual('panel-above');

                                        const groupWrapper = group?.querySelector('[menu-group-wrapper]');
                                        expect(groupWrapper).toBeTruthy();

                                        const groupPanel = groupWrapper?.querySelector(
                                            '[menu-group-panel-label]'
                                        ) as HTMLElement;
                                        expect(groupPanel).toBeTruthy();
                                        expect(groupPanel.getAttribute('aria-hidden')).toEqual('true');
                                        expect(groupPanel.textContent?.trim()).toEqual('');
                                    })
                                );

                                describe('Under keyboard', () => {
                                    it(
                                        'should populate the panel (on focus) and clean it (on blur)',
                                        autoFlush(() => {
                                            openMenu();

                                            const menu = getMenu(0);
                                            const item1 = getItem(menu, 0);
                                            focusItem(item1);

                                            const panel = menu?.querySelector(
                                                '[menu-group-panel-label]'
                                            ) as HTMLElement;
                                            const panelLabel = panel.querySelectorAll(
                                                'span:first-of-type'
                                            )?.[0] as HTMLElement;
                                            expect(panelLabel.textContent?.trim()).toEqual('item1');
                                            expect(panel.querySelector('[menu-item-shortcut]')).toBeNull();

                                            const item2 = getItem(menu, 1);
                                            focusItem(item2);
                                            expect(panelLabel.textContent?.trim()).toEqual('item2');

                                            const panelShortcut = panel.querySelector(
                                                '[menu-item-shortcut]'
                                            ) as HTMLElement;
                                            expect(panelShortcut).toBeTruthy();
                                            expect(panelShortcut.textContent?.trim()).toEqual('Ctrl+S');

                                            blurItem(item2);
                                            expect(panel.textContent?.trim()).toEqual('');
                                        })
                                    );
                                });

                                describe('Under Pointer', () => {
                                    it(
                                        'should populate the panel (on mouseenter), clean it (on mouseleave) and set focus back to the menu',
                                        autoFlush(() => {
                                            openMenu();

                                            const menu = getMenu(0);
                                            const panel = menu?.querySelector(
                                                '[menu-group-panel-label]'
                                            ) as HTMLElement;
                                            const panelLabel = panel.querySelectorAll(
                                                'span:first-of-type'
                                            )?.[0] as HTMLElement;

                                            const item1 = getItem(menu, 0);
                                            spyOn(item1, 'focus').and.callFake(() => focusItem(item1));
                                            const item2 = getItem(menu, 1);
                                            spyOn(item2, 'focus').and.callFake(() => focusItem(item2));

                                            mouseEnterItem(item1);
                                            expect(panelLabel.textContent?.trim()).toEqual('item1');
                                            expect(panel.querySelector('[menu-item-shortcut]')).toBeNull();

                                            mouseEnterItem(item2);
                                            expect(panelLabel.textContent?.trim()).toEqual('item2');

                                            const panelShortcut = panel.querySelector(
                                                '[menu-item-shortcut]'
                                            ) as HTMLElement;
                                            expect(panelShortcut).toBeTruthy();
                                            expect(panelShortcut.textContent?.trim()).toEqual('Ctrl+S');

                                            spyOn(menu, 'focus').and.callFake(() => blurItem(item2));

                                            mouseLeaveItem(item2);
                                            expect(panel.textContent?.trim()).toEqual('');

                                            expect(document.activeElement).toEqual(menu);
                                        })
                                    );
                                });
                            });

                            describe('Floating Panels', () => {
                                const getPanel = (itemsWrapper: Element | null): HTMLElement | null => {
                                    const panel = itemsWrapper?.nextElementSibling as HTMLElement | null;
                                    return panel?.tagName.toLowerCase() === 'a11y-menu-tooltip' ? panel : null;
                                };

                                beforeEach(() =>
                                    setItems([
                                        {
                                            items: [
                                                { label: 'item1' },
                                                { label: 'item2', shortcut: { key: 's', ctrlCmd: true } },
                                            ],
                                            itemsLayout,
                                            itemsLabelPosition: 'floating-above',
                                        } as MenuGroup,
                                    ])
                                );

                                it(
                                    'should NOT render the fixed panel',
                                    autoFlush(() => {
                                        openMenu();

                                        const panel = getMenu(0)?.querySelector(
                                            '[menu-group-panel-label]'
                                        ) as HTMLElement;
                                        expect(panel).toBeNull();
                                    })
                                );

                                describe('Lifecycle', () => {
                                    describe('Under keyboard', () => {
                                        it(
                                            'should open the panel (on focus) and close it (on blur)',
                                            autoFlush(() => {
                                                openMenu();

                                                const menu = getMenu(0);
                                                const itemsWrapper = menu?.querySelector('[menu-group-items]');

                                                const item1 = getItem(menu, 0);
                                                focusItem(item1);

                                                let panel = getPanel(itemsWrapper);
                                                expect(panel).toBeTruthy();

                                                let panelLabel = panel?.querySelector('[menu-tooltip]');
                                                expect(panelLabel?.textContent?.trim()).toEqual('item1');

                                                blurItem(item1); // to destroy previous tooltip
                                                const item2 = getItem(menu, 1);
                                                focusItem(item2);

                                                panel = getPanel(itemsWrapper);
                                                panelLabel = panel?.querySelector('[menu-tooltip]');
                                                expect(panelLabel?.textContent?.trim()).toEqual('item2');

                                                const panelShortcut = panel?.querySelector('[menu-item-shortcut]');
                                                expect(panelShortcut).toBeTruthy();
                                                expect(panelShortcut?.textContent?.trim()).toEqual('Ctrl+S');

                                                blurItem(item2);
                                                expect(getPanel(itemsWrapper)).toBeNull();
                                            })
                                        );
                                    });

                                    describe('Under Pointer', () => {
                                        it(
                                            'should open the panel (on mouseenter), close it (on mouseleave) and set focus back to the menu',
                                            autoFlush(() => {
                                                openMenu();

                                                const menu = getMenu(0);
                                                const itemsWrapper = menu?.querySelector('[menu-group-items]');

                                                const item1 = getItem(menu, 0);
                                                spyOn(item1, 'focus').and.callFake(() => focusItem(item1));
                                                mouseEnterItem(item1);

                                                let panel = getPanel(itemsWrapper);
                                                expect(panel).toBeTruthy();

                                                let panelLabel = panel?.querySelector('[menu-tooltip]');
                                                expect(panelLabel?.textContent?.trim()).toEqual('item1');

                                                const item2 = getItem(menu, 1);
                                                spyOn(item2, 'focus').and.callFake(() => {
                                                    blurItem(item1);
                                                    focusItem(item2);
                                                });
                                                mouseEnterItem(item2);

                                                panel = getPanel(itemsWrapper);
                                                panelLabel = panel?.querySelector('[menu-tooltip]');
                                                expect(panelLabel?.textContent?.trim()).toEqual('item2');

                                                const panelShortcut = panel?.querySelector('[menu-item-shortcut]');
                                                expect(panelShortcut).toBeTruthy();
                                                expect(panelShortcut?.textContent?.trim()).toEqual('Ctrl+S');

                                                spyOn(menu, 'focus').and.callFake(() => blurItem(item2));

                                                mouseLeaveItem(item2);
                                                expect(getPanel(itemsWrapper)).toBeNull();

                                                expect(document.activeElement).toEqual(menu);
                                            })
                                        );
                                    });
                                });

                                describe('Positioning', () => {
                                    const getRect = (panel: Element | null): DOMRect =>
                                        panel?.getBoundingClientRect() as DOMRect;

                                    beforeEach(() => {
                                        const trigger = getTrigger();
                                        trigger.style.position = 'fixed';
                                        trigger.style.top = '50%';
                                        trigger.style.left = '50%';
                                    });

                                    describe('Floating Above', () => {
                                        it(
                                            `should open the panel above the item's container`,
                                            autoFlush(() => {
                                                openMenu();

                                                const menu = getMenu(0);
                                                const itemsWrapper = menu?.querySelector('[menu-group-items]');

                                                const item1 = getItem(menu, 0);
                                                focusItem(item1);

                                                const { top: containerTop } = getRect(itemsWrapper);
                                                const { bottom: panelBottom } = getRect(getPanel(itemsWrapper));
                                                expect(panelBottom).toBeLessThan(containerTop);
                                            })
                                        );
                                    });

                                    describe('Floating Below', () => {
                                        beforeEach(() =>
                                            setItems([
                                                {
                                                    items: [{ label: 'item1' }],
                                                    itemsLayout,
                                                    itemsLabelPosition: 'floating-below',
                                                } as MenuGroup,
                                            ])
                                        );

                                        it(
                                            `should open the panel below the item's container`,
                                            autoFlush(() => {
                                                openMenu();

                                                const menu = getMenu(0);
                                                const itemsWrapper = menu?.querySelector('[menu-group-items]');

                                                const item1 = getItem(menu, 0);
                                                focusItem(item1);

                                                const { bottom: containerBottom } = getRect(itemsWrapper);
                                                const { top: panelTop } = getRect(getPanel(itemsWrapper));
                                                expect(panelTop).toBeGreaterThan(containerBottom);
                                            })
                                        );
                                    });
                                });
                            });
                        }
                    });
                });
            });
        });

        describe('Icons', () => {
            const getIcons = (menu: Element | null): HTMLElement[] =>
                Array.from(menu?.querySelectorAll('[menu-item-icon]') as NodeListOf<HTMLElement>) as HTMLElement[];

            describe('Menu Element', () => {
                it(
                    'should NOT apply "has-icons" attribute when no icons are provided',
                    autoFlush(() => {
                        setItems([{ label: 'item1' }, { label: 'item2' }]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu.getAttribute('has-icons')).toBeNull();

                        expect(getIcons(menu).every(isVisible)).not.toBeTrue();
                    })
                );

                it(
                    'should NOT apply "has-icons" attribute when there are icons inside a selectable group (radio/checkbox)',
                    autoFlush(() => {
                        setItems([
                            { label: 'item1' },
                            { type: 'radio', items: [{ label: 'item2' }, { label: 'item3', icon: 'a' }] },
                        ]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu.getAttribute('has-icons')).toBeNull();

                        expect(getIcons(menu).every(isVisible)).not.toBeTrue();
                    })
                );

                it(
                    'should NOT apply "has-icons" attribute when there are icons inside an inline/grid group (stacked group)',
                    autoFlush(() => {
                        setItems([
                            { label: 'item1' },
                            { itemsLayout: 'inline', items: [{ label: 'item2' }, { label: 'item3', icon: 'a' }] },
                        ]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu.getAttribute('has-icons')).toBeNull();

                        const iconsVisible = getIcons(menu).filter(isVisible).length;
                        expect(iconsVisible).toBe(2); // only the ones inside the group
                    })
                );

                it(
                    'should apply "has-icons" attribute when at least one icon is provided (loose items)',
                    autoFlush(() => {
                        setItems([{ label: 'item1', icon: 'a' }, { label: 'item2' }]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu.getAttribute('has-icons')).toEqual('');

                        expect(getIcons(menu).every(isVisible)).toBeTrue();
                    })
                );

                it(
                    'should apply "has-icons" attribute when at least one icon is provided inside the group of items',
                    autoFlush(() => {
                        setItems([{ label: 'item1' }, { items: [{ info: 'item2', icon: 'a' }] }]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu.getAttribute('has-icons')).toEqual('');

                        expect(getIcons(menu).every(isVisible)).toBeTrue();
                    })
                );

                it(
                    'should apply "has-icons" attribute when at least one icon is provided in a loose item and there are a group of items',
                    autoFlush(() => {
                        setItems([{ label: 'item1', icon: 'a' }, { items: [{ label: 'item2' }, { label: 'item2' }] }]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu?.getAttribute('has-icons')).toEqual('');

                        const iconsVisible = getIcons(menu).filter(isVisible).length;
                        expect(iconsVisible).toBe(3);
                    })
                );

                it(
                    'should apply "has-icons" attribute when at least one icon is provided (inline group)',
                    autoFlush(() => {
                        setItems([
                            { label: 'item1' },
                            { layout: 'inline', itemsLayout: 'grid', icon: 'a', items: [{ label: 'item2' }] },
                        ]);

                        openMenu();

                        const menu = getMenu(0);
                        expect(menu.getAttribute('has-icons')).toEqual('');

                        const iconsVisible = getIcons(menu).filter(isVisible).length;
                        expect(iconsVisible).toBe(2); // every item except the one inside the group
                    })
                );
            });

            describe('Group Elements', () => {
                describe('Common Stack Group', () => {
                    it(
                        'should NOT apply "has-icons" attribute when no icons are provided',
                        autoFlush(() => {
                            setItems([{ items: [{ label: 'item2' }, { label: 'item2' }] }]);

                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group');
                            expect(group?.getAttribute('has-icons')).toBeNull();

                            const iconsVisible = getIcons(group).filter(isVisible).length;
                            expect(iconsVisible).toBe(0); // every item inside the group
                        })
                    );

                    it(
                        'should apply "has-icons" attribute when at least one icon is provided',
                        autoFlush(() => {
                            setItems([
                                { label: 'item1' },
                                { items: [{ label: 'item2', icon: 'a' }, { label: 'item2' }] },
                            ]);

                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group');
                            expect(group?.getAttribute('has-icons')).toEqual('');

                            const iconsVisible = getIcons(group).filter(isVisible).length;
                            expect(iconsVisible).toBe(2); // every item inside the group
                        })
                    );
                });

                describe('Inline Stack Group', () => {
                    it(
                        'should NOT apply "has-icons" attribute when no icons are provided',
                        autoFlush(() => {
                            setItems([
                                {
                                    label: 'group1',
                                    itemsLayout: 'inline',
                                    items: [{ label: 'item1' }, { label: 'item2' }],
                                },
                            ]);

                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline [menu-group-items]');
                            expect(group?.getAttribute('has-icons')).toBeNull();

                            const iconsVisible = getIcons(group).filter(isVisible).length;
                            expect(iconsVisible).toBe(0); // every item inside the group
                        })
                    );

                    it(
                        'should apply "has-icons" attribute when at least one icon is provided',
                        autoFlush(() => {
                            setItems([
                                {
                                    label: 'group1',
                                    itemsLayout: 'inline',
                                    items: [{ label: 'item1', icon: 'a' }, { label: 'item2' }],
                                },
                            ]);

                            openMenu();

                            const group = getMenu(0).querySelector('a11y-menu-group-inline [menu-group-items]');
                            expect(group?.getAttribute('has-icons')).toEqual('');

                            const iconsVisible = getIcons(group).filter(isVisible).length;
                            expect(iconsVisible).toBe(2); // every item inside the group
                        })
                    );

                    itemWithLabel.forEach((itemsLabelPosition) => {
                        it(
                            `should NOT apply "has-icons-only" attribute when at least one icon is provided and label position is "${itemsLabelPosition}"`,
                            autoFlush(() => {
                                setItems([
                                    {
                                        label: 'group1',
                                        itemsLayout: 'inline',
                                        itemsLabelPosition,
                                        items: [{ label: 'item1', icon: 'a' }, { label: 'item2' }],
                                    } as MenuGroup,
                                ]);

                                openMenu();

                                const group = getMenu(0).querySelector('a11y-menu-group-inline [menu-group-items]');
                                expect(group?.getAttribute('has-icons-only')).toBeNull();
                            })
                        );
                    });

                    itemWithNoLabel.forEach((itemsLabelPosition) => {
                        it(
                            `should apply "has-icons-only" attribute when at least one icon is provided and label position is "${itemsLabelPosition}"`,
                            autoFlush(() => {
                                setItems([
                                    {
                                        label: 'group1',
                                        itemsLayout: 'inline',
                                        itemsLabelPosition,
                                        items: [{ label: 'item1', icon: 'a' }, { label: 'item2' }],
                                    } as MenuGroup,
                                ]);

                                openMenu();

                                const group = getMenu(0).querySelector('a11y-menu-group-inline [menu-group-items]');
                                expect(group?.getAttribute('has-icons-only')).toEqual('');
                            })
                        );
                    });
                });
            });
        });

        describe('Shortcuts', () => {
            it(
                'should NOT apply "has-shortcuts" attribute when no shortcuts are provided',
                autoFlush(() => {
                    setItems([{ label: 'item1' }, { items: [{ label: 'item2' }, { label: 'item3' }] }]);

                    openMenu();
                    expect(getMenu(0).getAttribute('has-shortcuts')).toBeNull();
                })
            );

            it(
                'should NOT apply "has-shortcuts" attribute when shortcuts are provided inside an inline group of items',
                autoFlush(() => {
                    setItems([
                        { label: 'item1' },
                        {
                            itemsLayout: 'inline',
                            items: [{ label: 'item2' }, { label: 'item3', shortcut: { key: 'r' } }],
                        },
                    ]);

                    openMenu();
                    expect(getMenu(0).getAttribute('has-shortcuts')).toBeNull();
                })
            );

            it(
                'should apply "has-shortcuts" attribute when at least one shortcut is provided (loose items)',
                autoFlush(() => {
                    setItems([{ label: 'item1', shortcut: { key: 'a' } }, { label: 'item2' }]);

                    openMenu();
                    expect(getMenu(0).getAttribute('has-shortcuts')).toEqual('');
                })
            );

            it(
                'should apply "has-shortcuts" attribute when at least one shortcut is provided (stack group of items)',
                autoFlush(() => {
                    setItems([
                        { label: 'item1' },
                        { items: [{ label: 'item2', shortcut: { key: 'm' } }, { label: 'item3' }] },
                    ]);

                    openMenu();
                    expect(getMenu(0).getAttribute('has-shortcuts')).toEqual('');
                })
            );
        });

        describe('Submenus', () => {
            it(
                'should render the caret icon',
                autoFlush(() => {
                    setItems([{ label: 'item1', submenu: [{ label: 'item1a' }] }]);
                    openMenu();

                    const item = getItem(getMenu(0), 0);
                    expect(item.querySelector('[menu-item-caret]')).toBeTruthy();
                })
            );
        });

        describe('Selection Indicators (Checkboxes & Radios)', () => {
            (['radio', 'checkbox'] as const).forEach((type) => {
                describe(`Checked icon for "${type}" items`, () => {
                    beforeEach(() => setItems([{ type, items: [{ label: 'item1' }] }]));

                    it(
                        `should have the "item-check" attribute set with "${type}"`,
                        autoFlush(() => {
                            openMenu();

                            const check = getItem(getMenu(0), 0).querySelector('a11y-menu-item-check');
                            expect(check?.getAttribute('item-check')).toEqual(type);
                        })
                    );

                    it(
                        'should have the opacity set to "0.1" when NOT checked',
                        autoFlush(() => {
                            openMenu();

                            const check = getItem(getMenu(0), 0).querySelector('a11y-menu-item-check');
                            expect(getComputedStyle(check as Element).opacity).toEqual('0.1');
                        })
                    );

                    it(
                        'should have the opacity set to "1" when checked',
                        autoFlush(() => {
                            openMenu();
                            clickItem(getItem(getMenu(0), 0));

                            const check = getItem(getMenu(0), 0).querySelector('a11y-menu-item-check');
                            expect(getComputedStyle(check as Element).opacity).toEqual('1');
                        })
                    );
                });
            });
        });

        describe('Item Context', () => {
            it(
                'should update the label',
                autoFlush(() => {
                    setItems([{ label: 'item1', action: (itemCtx) => itemCtx.setLabel('new item 1') }]);
                    openMenu();

                    const item = getItem(getMenu(0), 0);
                    expect(item.textContent?.trim()).toEqual('item1');

                    clickItem(item);
                    expect(item.textContent?.trim()).toEqual('new item 1');
                })
            );

            it(
                'should update the icon',
                autoFlush(() => {
                    setItems([{ label: 'item1', action: (itemCtx) => itemCtx.setIcon({ src: '/close.png' }) }]);
                    openMenu();

                    const item = getItem(getMenu(0), 0);
                    let icon = item.querySelector('a11y-icon');
                    expect(icon?.textContent?.trim()).toEqual('');

                    clickItem(item);
                    icon = item.querySelector('a11y-icon img');
                    expect(icon?.getAttribute('src')).toEqual('/close.png');
                })
            );

            describe('Disabled state', () => {
                it(
                    'should NOT update when current state is the same as the new one',
                    autoFlush(() => {
                        setItems([
                            { label: 'item1', disabled: false, action: (itemCtx) => itemCtx.setDisabled(false) },
                        ]);
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        expect(item.getAttribute('aria-disabled')).toBeNull();

                        clickItem(item);
                        expect(item.getAttribute('aria-disabled')).toBeNull();
                    })
                );

                it(
                    'should set the "aria-disabled" with "true"',
                    autoFlush(() => {
                        setItems([{ label: 'item1', action: (itemCtx) => itemCtx.setDisabled(true) }]);
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        expect(item.getAttribute('aria-disabled')).toBeNull();

                        clickItem(item);
                        expect(item.getAttribute('aria-disabled')).toEqual('true');
                    })
                );

                it(
                    'should re-initialize KeyNav items when set to "true" and disabled items are NOT allowed to be navigated',
                    autoFlush(() => {
                        setConfig({ allowNavigateDisabled: false });
                        setItems([{ label: 'item1', action: (itemCtx) => itemCtx.setDisabled(true) }]);
                        openMenu();

                        spyOn(service, 'initKeyNavItems').and.callThrough();
                        spyOn(service.menuItemDisabledStateUpdated$, 'next').and.callThrough();

                        clickItem(getItem(getMenu(0), 0));
                        expect(service.initKeyNavItems).toHaveBeenCalledWith(true);
                        expect(service.menuItemDisabledStateUpdated$.next).toHaveBeenCalled();
                    })
                );

                it(
                    'should NOT re-initialize KeyNav items when set to "true" and disabled items ARE allowed to be navigated',
                    autoFlush(() => {
                        setItems([{ label: 'item1', action: (itemCtx) => itemCtx.setDisabled(true) }]);
                        openMenu();

                        spyOn(service, 'initKeyNavItems');

                        clickItem(getItem(getMenu(0), 0));
                        expect(service.initKeyNavItems).not.toHaveBeenCalled();
                    })
                );
            });

            describe('Busy state', () => {
                it(
                    'should announce a message via "setBusy()" method',
                    autoFlush(() => {
                        setItems([{ label: 'item1', action: (itemCtx) => itemCtx.setBusy(true, 'announce this') }]);

                        openMenu('Enter');
                        sendKey('Enter');

                        expect(getAnnouncer().textContent).toEqual('announce this');
                    })
                );

                it(
                    'should toggle the "aria-busy" & "item-busy" attributes',
                    autoFlush(() => {
                        setItems([
                            {
                                label: 'item1',
                                closeOnSelect: false,
                                action: (itemCtx) => {
                                    itemCtx.setBusy(true);
                                    setTimeout(() => itemCtx.setBusy(false), 500);
                                },
                            },
                        ]);
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        expect(item.getAttribute('aria-busy')).toBeNull();
                        expect(item.getAttribute('item-busy')).toBeNull();
                        expect(item.classList.contains('a11y-busy')).toBeFalse();

                        clickItem(item, false);
                        expect(item.getAttribute('aria-busy')).toEqual('true');
                        expect(item.getAttribute('item-busy')).toEqual('');
                        expect(item.classList.contains('a11y-busy')).toBeTrue();

                        tick(400);
                        expect(item.getAttribute('aria-busy')).toEqual('true');
                        expect(item.getAttribute('item-busy')).toEqual('');
                        expect(item.classList.contains('a11y-busy')).toBeTrue();

                        tick(100);
                        expect(item.getAttribute('aria-busy')).toBeNull();
                        expect(item.getAttribute('item-busy')).toBeNull();
                        expect(item.classList.contains('a11y-busy')).toBeFalse();
                    })
                );

                describe('Inline Groups only', () => {
                    let group!: HTMLElement;
                    let item1!: HTMLElement;
                    let item2!: HTMLElement;

                    const openMenuBusyState = (type: 'checkbox' | 'radio', busyScope?: 'group' | 'item'): void => {
                        setItems([
                            {
                                type,
                                busyScope,
                                itemsLayout: 'inline',
                                beforeChange: (itemCtx) => {
                                    itemCtx.setBusy(true); // set busy
                                    return of(true).pipe(delay(500)); // allow the change
                                },
                                items: [{ label: 'item1' }, { label: 'item2' }],
                            },
                        ]);
                        openMenu();

                        const menu = getMenu(0);
                        group = menu.querySelector('a11y-menu-group-inline') as HTMLElement;
                        item1 = getItem(menu, 0);
                        item2 = getItem(menu, 1);
                    };

                    const checkNoBusyState = (): void => {
                        // initial state (group)
                        expect(group.getAttribute('items-busy')).toBeNull();
                        // initial state (item1)
                        expect(item1.getAttribute('aria-busy')).toBeNull();
                        expect(item1.getAttribute('item-busy')).toBeNull();
                        expect(item1.classList.contains('a11y-busy')).toBeFalse();
                        // initial state (item2)
                        expect(item2.getAttribute('aria-busy')).toBeNull();
                        expect(item2.getAttribute('item-busy')).toBeNull();
                        expect(item2.classList.contains('a11y-busy')).toBeFalse();
                    };
                    const checkBusyStateGroup = (): void => {
                        // group is busy
                        expect(group.getAttribute('items-busy')).toEqual('');
                        // the activated item updates both attributes
                        expect(item1.getAttribute('aria-busy')).toEqual('true');
                        expect(item1.getAttribute('item-busy')).toEqual('');
                        expect(item1.classList.contains('a11y-busy')).toBeTrue();
                        // the sibling updates only "aria-busy"
                        expect(item2.getAttribute('aria-busy')).toEqual('true');
                        expect(item2.getAttribute('item-busy')).toBeNull();
                        expect(item2.classList.contains('a11y-busy')).toBeTrue();
                    };
                    const checkBusyStateItem = (): void => {
                        // group is NOT busy
                        expect(group.getAttribute('items-busy')).toBeNull();
                        // the activated item updates both attributes
                        expect(item1.getAttribute('aria-busy')).toEqual('true');
                        expect(item1.getAttribute('item-busy')).toEqual('');
                        expect(item1.classList.contains('a11y-busy')).toBeTrue();
                        // the sibling does NOT change its state
                        expect(item2.getAttribute('aria-busy')).toBeNull();
                        expect(item2.getAttribute('item-busy')).toBeNull();
                        expect(item2.classList.contains('a11y-busy')).toBeFalse();
                    };

                    describe('Checkbox group', () => {
                        it(
                            'should toggle the "items-busy" attribute in the group when "busyScope" is set to "group"',
                            autoFlush(() => {
                                openMenuBusyState('checkbox', 'group');
                                checkNoBusyState(); // initial state

                                clickItem(item1, false); // busy state
                                checkBusyStateGroup();

                                tick(200); // still in busy state
                                checkBusyStateGroup();

                                tick(300); // reset busy state
                                checkNoBusyState();
                            })
                        );

                        it(
                            'should NOT toggle the "items-busy" attribute in the group when "busyScope" is not defined (default)',
                            autoFlush(() => {
                                openMenuBusyState('checkbox');
                                checkNoBusyState(); // initial state

                                clickItem(item1, false); // busy state
                                checkBusyStateItem();

                                tick(200); // still in busy state
                                checkBusyStateItem();

                                tick(300); // reset busy state
                                checkNoBusyState();
                            })
                        );
                    });

                    describe('Radio group', () => {
                        it(
                            'should toggle the "items-busy" attribute in the group (default)',
                            autoFlush(() => {
                                openMenuBusyState('radio');
                                checkNoBusyState(); // initial state

                                clickItem(item1, false); // busy state
                                checkBusyStateGroup();

                                tick(200); // still in busy state
                                checkBusyStateGroup();

                                tick(300); // reset busy state
                                checkNoBusyState();
                            })
                        );

                        it(
                            'should toggle the "items-busy" attribute in the group even if "busyScope" is set to "item"',
                            autoFlush(() => {
                                openMenuBusyState('radio', 'item');
                                checkNoBusyState(); // initial state

                                clickItem(item1, false); // busy state
                                checkBusyStateGroup();

                                tick(200); // still in busy state
                                checkBusyStateGroup();

                                tick(300); // reset busy state
                                checkNoBusyState();
                            })
                        );
                    });
                });
            });
        });

        describe('Menu Context', () => {
            it(
                'should announce a message via "announce()" method',
                autoFlush(() => {
                    setItems([{ label: 'item1', action: (_, menuCtx) => menuCtx.announce('announce that') }]);

                    openMenu('Enter');
                    sendKey('Enter');

                    expect(getAnnouncer().textContent).toEqual('announce that');
                })
            );

            describe('"update()" method', () => {
                it(
                    'should update the class name for an action item',
                    autoFlush(() => {
                        setItems([
                            {
                                label: 'item1',
                                action: (_, menuCtx) =>
                                    menuCtx.getItemAction('the-item-2')?.update({ className: ['i2'] }),
                            },
                            { label: 'item2', value: 'the-item-2' },
                        ]);

                        openMenu('Enter');

                        const item2 = getItem(getMenu(0), 1);
                        expect(item2.classList.length).toBe(0);

                        sendKey('Enter');
                        expect(item2.classList.contains('i2')).toBeTrue();
                    })
                );

                it(
                    'should update the icon for the submenu item',
                    autoFlush(() => {
                        setItems([
                            {
                                label: 'item1',
                                action: (_, menuCtx) =>
                                    menuCtx.getItemSubmenu('the-item-2')?.update({ icon: { html: 'the-icon' } }),
                            },
                            { label: 'item2', value: 'the-item-2', submenu: [{ label: 'item2a' }] },
                        ]);

                        openMenu('Enter');

                        const item2 = getItem(getMenu(0), 1);
                        expect(item2.querySelector('[menu-item-icon]')?.textContent?.trim()).toEqual('');

                        sendKey('Enter');
                        expect(item2.querySelector('[menu-item-icon]')?.textContent?.trim()).toEqual('the-icon');
                    })
                );

                describe('Disabled state', () => {
                    it(
                        'should set the state to "true" for the selectable item and NOT re-initialize KeyNav items when disabled items ARE allowed to be navigated',
                        autoFlush(() => {
                            setItems([
                                {
                                    label: 'item1',
                                    action: (_, menuCtx) =>
                                        menuCtx.getItemSelectable('the-item-2')?.update({ disabled: true }),
                                },
                                { type: 'checkbox', items: [{ label: 'item2', disabled: false, value: 'the-item-2' }] },
                            ]);
                            openMenu('Enter');

                            spyOn(service, 'initKeyNavItems');

                            clickItem(getItem(getMenu(0), 0));
                            expect(service.initKeyNavItems).not.toHaveBeenCalledWith();
                        })
                    );

                    it(
                        'should re-initialize KeyNav items when set to "true" and disabled items are NOT allowed to be navigated',
                        autoFlush(() => {
                            setConfig({ allowNavigateDisabled: false });
                            setItems([
                                {
                                    label: 'item1',
                                    action: (_, menuCtx) =>
                                        menuCtx.getItemSelectable('the-item-2')?.update({ disabled: true }),
                                },
                                { type: 'checkbox', items: [{ label: 'item2', value: 'the-item-2' }] },
                            ]);
                            openMenu('Enter');

                            spyOn(service, 'initKeyNavItems');

                            clickItem(getItem(getMenu(0), 0));
                            expect(service.initKeyNavItems).toHaveBeenCalledWith(true);
                        })
                    );
                });
            });
        });
    });

    describe('Theming', () => {
        let componentFeature: MenuTestFeatureComponent;
        let fixtureFeature: ComponentFixture<MenuTestFeatureComponent>;

        beforeEach(() => TestBed.resetTestingModule());

        const setupThemeTestBed = (
            config: {
                a11yTheme?: Theme;
                menuGlobal?: Theme;
                menuInstance?: Theme;
                menuFeature?: Theme;
                menuFeatureInstance?: Theme;
            } = {},
            createFeatureAnyway: boolean = false
        ) => {
            const { a11yTheme, menuGlobal, menuInstance, menuFeature, menuFeatureInstance } = config;

            TestBed.configureTestingModule({
                providers: [
                    ...[a11yTheme ? provideA11yTheme(a11yTheme) : []],
                    ...[menuGlobal ? provideA11yMenu({ theme: menuGlobal }) : []],
                    ...[
                        menuFeature || createFeatureAnyway
                            ? provideA11yMenuFeature({
                                  selector: '.a11y-theme-menu',
                                  className: 'a11y-theme-menu',
                                  theme: menuFeature,
                              })
                            : [],
                    ],
                ],
                imports: [MenuTestModule],
            });

            service = TestBed.inject(MenuService);

            // We create the 1st "normal" menu
            fixture = TestBed.createComponent(MenuTestComponent);
            component = fixture.componentInstance;
            setItems([{ label: 'item1' }]);
            if (menuInstance) component.config.theme = menuInstance;

            // We create the 2nd "feature" menu
            fixtureFeature = TestBed.createComponent(MenuTestFeatureComponent);
            componentFeature = fixtureFeature.componentInstance;
            if (menuFeatureInstance) componentFeature.config.theme = menuFeatureInstance;

            fixture.detectChanges();
            document = TestBed.inject(DOCUMENT);
        };

        describe('Default Behavior', () => {
            it(
                'should NOT set the "theme" attribute when no configuration is provided',
                autoFlush(() => {
                    setupThemeTestBed();
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toBeNull();
                })
            );
        });

        describe('Level 1: Theme Global', () => {
            it(
                'should use the theme provided through the Theme Module / Provider',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'light' });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('light');
                })
            );
        });

        describe('Level 2: Menu Global', () => {
            it(
                'should use the theme provided through the Menu rootConfig() / Provider',
                autoFlush(() => {
                    setupThemeTestBed({ menuGlobal: 'dark' });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('dark');
                })
            );

            it(
                'should override the Theme Module configuration',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'dark', menuGlobal: 'light' });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('light');
                })
            );

            it(
                'should NOT override the Theme Module configuration when lower level is undefined',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'dark', menuGlobal: undefined });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('dark');
                })
            );
        });

        describe('Level 3: Menu Feature', () => {
            let menuFeature: HTMLElement;

            const openMenuFeature = (): void => {
                componentFeature.trigger.nativeElement.click();
                flush();
                menuFeature = document.body.querySelector(
                    'a11y-menu-container a11y-menu.a11y-theme-menu'
                ) as HTMLElement;
            };

            it(
                'should NOT set the "theme" attribute to the normal menu',
                autoFlush(() => {
                    setupThemeTestBed({ menuFeature: 'dark' });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toBeNull();
                })
            );

            it(
                'should use the theme provided through the Menu Feature / Provider',
                autoFlush(() => {
                    setupThemeTestBed({ menuFeature: 'dark' });
                    openMenuFeature();
                    expect(menuFeature.getAttribute('theme')).toEqual('dark');
                })
            );

            it(
                'should override the Menu Module rootConfig() configuration',
                autoFlush(() => {
                    setupThemeTestBed({ menuGlobal: 'dark', menuFeature: 'light' });
                    openMenuFeature();
                    expect(menuFeature.getAttribute('theme')).toEqual('light');
                })
            );

            it(
                'should override the Theme Module configuration',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'light', menuFeature: 'dark' });
                    openMenuFeature();
                    expect(menuFeature.getAttribute('theme')).toEqual('dark');
                })
            );

            it(
                'should override everything and use the established in the instance config',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'light', menuFeature: 'dark', menuFeatureInstance: 'light' });
                    openMenuFeature();
                    expect(menuFeature.getAttribute('theme')).toEqual('light');
                })
            );

            it(
                'should NOT override the Theme Module configuration when feature level is undefined',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'dark', menuFeature: undefined }, true);
                    openMenuFeature();
                    expect(menuFeature.getAttribute('theme')).toEqual('dark');
                })
            );

            it(
                'should NOT override the Feature configuration when instance level is undefined',
                autoFlush(() => {
                    setupThemeTestBed({ a11yTheme: 'dark', menuFeature: 'light', menuFeatureInstance: undefined });
                    openMenuFeature();
                    expect(menuFeature.getAttribute('theme')).toEqual('light');
                })
            );
        });

        describe('Level 4: Menu Instance', () => {
            it(
                'should use the instance theme when provided',
                autoFlush(() => {
                    setupThemeTestBed({ menuInstance: 'dark' });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('dark');
                })
            );

            it(
                'should override the Menu Module rootConfig() configuration',
                autoFlush(() => {
                    setupThemeTestBed({ menuGlobal: 'dark', menuInstance: 'light' });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('light');
                })
            );

            it(
                'should NOT override the Menu Module rootConfig() configuration when instance level is undefined',
                autoFlush(() => {
                    setupThemeTestBed({ menuGlobal: 'light', menuInstance: undefined });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('light');
                })
            );

            it(
                'should override all module-level configurations combined',
                autoFlush(() => {
                    setupThemeTestBed({
                        a11yTheme: 'dark',
                        menuFeature: 'light',
                        menuGlobal: 'light',
                        menuInstance: 'dark',
                    });
                    openMenu();
                    expect(getMenu(0).getAttribute('theme')).toEqual('dark');
                })
            );
        });
    });

    describe('Scrolling', () => {
        const items = Array.from({ length: 20 }, (_, idx) => ({ label: `item${idx}` })) as MenuItem[];

        beforeEach(() => {
            setConfig({ maxHeight: '400px', maxWidth: '200px' });
            setItems(items);
        });

        afterEach(() => delete items[1].submenu);

        it(
            'should scroll normally if no submenus are open',
            autoFlush(() => {
                openMenu('Enter');

                const event = new WheelEvent('wheel', { cancelable: true });

                wheel(getMenu(0), event);
                expect(event.defaultPrevented).toBeFalse();
            })
        );

        it(
            'should close open submenu when scrolling the parent menu with overflow',
            autoFlush(() => {
                items[1].submenu = [{ label: 'item-sm-1' }];
                setItems(items);
                openMenu();

                const menu = getMenu(0);

                // Open the submenu
                const submenuItem = getItem(menu, 1);
                mouseEnterItem(submenuItem);
                expect(getMenuCount()).toBe(2);

                // Scroll the parent menu
                wheel(menu, new WheelEvent('wheel', { deltaY: 100 }));
                expect(getMenuCount()).toBe(1);
            })
        );

        it(
            'should close everything when scrolling outside',
            autoFlush(() => {
                items[1].submenu = [{ label: 'item-sm-1' }];
                setItems(items);

                openMenu();
                expect(getMenuCount()).toBe(1);

                // Open the submenu
                const submenuItem = getItem(getMenu(0), 1);
                mouseEnterItem(submenuItem);
                expect(getMenuCount()).toBe(2);

                // Scroll the document
                document.dispatchEvent(new Event('scroll'));
                flush();
                expect(getMenuCount()).toBe(0);
            })
        );
    });

    describe('Mobile', () => {
        beforeEach(() => {
            setMobile(true);
            setItems([
                { label: 'item1', submenu: [{ label: 'item1a', submenu: [{ label: 'item1a1' }] }] },
                { label: 'item2', shortcut: { key: 'x' } },
            ]);
        });

        it(
            'should have all the "mobile" attributes correctly set when mobile',
            autoFlush(() => {
                openMenu('Enter');
                const menu = getMenu(0);
                const item = getItem(menu, 1);

                expect(container.getAttribute('aria-modal')).toEqual('true');
                expect(menu.getAttribute('mobile')).toEqual('');
                expect(item.getAttribute('mobile')).toEqual('');
                expect(item.querySelector('[menu-item-shortcut]')?.textContent?.trim()).toEqual('');
            })
        );

        it(
            'should NOT have all the "mobile" attributes correctly set when desktop',
            autoFlush(() => {
                setMobile(false);
                openMenu('Enter');
                const menu = getMenu(0);
                const item = getItem(menu, 1);

                expect(container.getAttribute('aria-modal')).toBeNull();
                expect(menu.getAttribute('mobile')).toBeNull();
                expect(item.getAttribute('mobile')).toBeNull();
                expect(item.querySelector('[menu-item-shortcut]')?.textContent?.trim()).toEqual('X');
            })
        );

        it(
            'should have "aria-hidden" applied for menus in the background (when submenus are open)',
            autoFlush(() => {
                openMenu('Enter');

                const menu1 = getMenu(0);
                expect(menu1.getAttribute('aria-hidden')).toBeNull();

                sendKey('Enter'); // access first submenu
                expect(getMenuCount()).toBe(2);

                const menu2 = getMenu(1);
                expect(menu1.getAttribute('aria-hidden')).toEqual('true');
                expect(menu2.getAttribute('aria-hidden')).toBeNull();

                sendKey('Enter'); // access second submenu
                expect(getMenuCount()).toBe(3);

                const menu3 = getMenu(2);
                expect(menu1.getAttribute('aria-hidden')).toEqual('true');
                expect(menu2.getAttribute('aria-hidden')).toEqual('true');
                expect(menu3.getAttribute('aria-hidden')).toBeNull();
            })
        );

        describe('Labels', () => {
            let actionBack: HTMLElement | null;
            let actionClose: HTMLElement | null;

            const getActionButtons = (menu: HTMLElement): void => {
                actionBack = menu.querySelector('[action-back]');
                actionClose = menu.querySelector('[action-close]');
            };

            it(
                'should have both values as their defaults if explicitly established them as undefined',
                autoFlush(() => {
                    setConfig({ mobileLabels: { close: undefined, back: undefined } });
                    openMenu('Enter'); // focus first item
                    sendKey('Enter'); // access submenu
                    getActionButtons(getMenu(1));
                    expect(actionClose?.getAttribute('aria-label')).toEqual('Close menu');
                    expect(actionBack?.getAttribute('aria-label')).toEqual('Go back to previous menu');
                })
            );

            describe('Close button', () => {
                it(
                    'should have aria-label attribute with "Close menu" (default)',
                    autoFlush(() => {
                        openMenu();
                        getActionButtons(getMenu(0));
                        expect(actionClose?.getAttribute('aria-label')).toEqual('Close menu');
                    })
                );

                it(
                    'should have aria-label attribute with "Cerrar menú" when specified',
                    autoFlush(() => {
                        setConfig({ mobileLabels: { close: 'Cerrar menú' } });
                        openMenu();

                        getActionButtons(getMenu(0));
                        expect(actionClose?.getAttribute('aria-label')).toEqual('Cerrar menú');
                    })
                );
            });

            describe('Back button', () => {
                it(
                    'should have aria-label attribute with "Go back to previous menu" (default)',
                    autoFlush(() => {
                        openMenu('Enter'); // focus first item
                        sendKey('Enter'); // access submenu
                        getActionButtons(getMenu(1));
                        expect(actionBack?.getAttribute('aria-label')).toEqual('Go back to previous menu');
                    })
                );

                it(
                    'should have aria-label attribute with "Volver" for the "back" when specified and default value for "close" when undefined',
                    autoFlush(() => {
                        setConfig({ mobileLabels: { back: 'Volver', close: undefined } });
                        openMenu('Enter'); // focus first item
                        sendKey('Enter'); // access submenu
                        getActionButtons(getMenu(1));
                        expect(actionBack?.getAttribute('aria-label')).toEqual('Volver');
                        expect(actionClose?.getAttribute('aria-label')).toEqual('Close menu');
                    })
                );
            });

            it(
                'should have the custom label for the "back" button and the default value for the close button',
                autoFlush(() => {
                    setConfig({ mobileLabels: { back: 'Volver' } });
                    openMenu('Enter'); // focus first item
                    sendKey('Enter'); // access submenu
                    getActionButtons(getMenu(1));
                    expect(actionBack?.getAttribute('aria-label')).toEqual('Volver');
                    expect(actionClose?.getAttribute('aria-label')).toEqual('Close menu');
                })
            );
        });

        describe('Keyboard interactions', () => {
            describe('Open action', () => {
                beforeEach(fakeAsync(() => {
                    openMenu();
                    sendKey('ArrowDown'); // focus first item
                }));

                it(
                    'should open the submenus with Enter key',
                    autoFlush(() => {
                        sendKey('Enter'); // access first submenu
                        expect(getMenuCount()).toBe(2);

                        sendKey('Enter'); // access second submenu
                        expect(getMenuCount()).toBe(3);
                    })
                );

                it(
                    'should open the submenus with Arrow Right key',
                    autoFlush(() => {
                        sendKey('ArrowRight'); // access first submenu
                        expect(getMenuCount()).toBe(2);

                        sendKey('ArrowRight'); // access second submenu
                        expect(getMenuCount()).toBe(3);
                    })
                );

                it(
                    'should NOT open with "ArrowRight" when item does NOT have submenu',
                    autoFlush(() => {
                        sendKey('ArrowDown'); // focus 2nd item (with NO submenu)
                        sendKey('ArrowRight'); // sending the "open" action
                        expect(getMenuCount()).toBe(1);
                    })
                );
            });

            describe('Close action', () => {
                beforeEach(fakeAsync(() => {
                    openMenu('Enter');
                    sendKey('Enter'); // access first submenu
                    sendKey('Enter'); // access second submenu
                }));

                it(
                    'should close the submenus and main menu with Escape key',
                    autoFlush(() => {
                        sendKey('Escape'); // close second submenu
                        expect(getMenuCount()).toBe(2);
                        sendKey('Escape'); // close first submenu
                        expect(getMenuCount()).toBe(1);
                        sendKey('Escape'); // close root menu
                        expect(getMenuCount()).toBe(0);
                    })
                );

                it(
                    'should close the submenus with Arrow Left key',
                    autoFlush(() => {
                        sendKey('ArrowLeft'); // close second submenu
                        expect(getMenuCount()).toBe(2);
                        sendKey('ArrowLeft'); // close first submenu
                        expect(getMenuCount()).toBe(1);
                        sendKey('ArrowLeft'); // ignore it for root menu
                        expect(getMenuCount()).toBe(1);
                    })
                );

                it(
                    'should close the submenus with the "back" button',
                    autoFlush(() => {
                        let backButton = getMenu(2).querySelector('[action-back]') as HTMLElement;
                        clickItem(backButton); // close second submenu
                        expect(getMenuCount()).toBe(2);

                        backButton = getMenu(1).querySelector('[action-back]') as HTMLElement;
                        clickItem(backButton); // close first submenu
                        expect(getMenuCount()).toBe(1);

                        backButton = getMenu(0).querySelector('[action-back]') as HTMLElement;
                        expect(backButton).toBeNull();
                    })
                );

                it(
                    'should close all the menus at once with the "close" button',
                    autoFlush(() => {
                        const closeButton = getMenu(2).querySelector('[action-close]') as HTMLElement;
                        clickItem(closeButton); // close everything
                        expect(getMenuCount()).toBe(0);
                    })
                );
            });
        });

        describe('Pointer interactions', () => {
            it(
                'should open the submenus with mouse enter',
                autoFlush(() => {
                    openMenu();

                    clickItem(getItem(getMenu(0), 0)); // access first submenu
                    expect(getMenuCount()).toBe(2);

                    clickItem(getItem(getMenu(1), 0)); // access second submenu
                    expect(getMenuCount()).toBe(3);
                })
            );
        });

        describe('Device interactions', () => {
            let myWindow: Window | null;

            beforeEach(() => (myWindow = TestBed.inject(WINDOW)));

            it(
                'should close the submenus and main menu with the device "back" button',
                autoFlush(() => {
                    openMenu('Enter');
                    sendKey('Enter'); // access first submenu
                    sendKey('Enter'); // access second submenu

                    // close second submenu
                    myWindow?.dispatchEvent(new PopStateEvent('popstate'));
                    flush();
                    expect(getMenuCount()).toBe(2);

                    // close first submenu
                    myWindow?.dispatchEvent(new PopStateEvent('popstate'));
                    flush();
                    expect(getMenuCount()).toBe(1);

                    // close root menu
                    myWindow?.dispatchEvent(new PopStateEvent('popstate'));
                    flush();
                    expect(getMenuCount()).toBe(0);
                })
            );
        });
    });

    describe('Config properties', () => {
        beforeEach(() => {
            setItems([
                { label: 'item1', icon: 'i' },
                { label: 'item2', submenu: [{ label: 'item2a', submenu: [{ label: 'item2a1' }] }] },
                {
                    label: 'item3',
                    icon: 'i',
                    closeOnSelect: false,
                    action: (itemCtx) => {
                        itemCtx.setBusy(true);
                        setTimeout(() => itemCtx.setBusy(false), 500);
                    },
                },
            ]);
        });

        describe('"alignMenuItemsWithTrigger" property', () => {
            const commonAlignItemWithTriggerExpect = (posA: number, posB: number) => {
                const positionDifference: number = Math.abs(posA - posB);
                expect(positionDifference).toBeLessThanOrEqual(1);
            };

            it(
                'should NOT align items with trigger (default)',
                autoFlush(() => {
                    openMenu('Enter');

                    const triggerRect = getTrigger().getBoundingClientRect();
                    const menuRect = getMenu(0).getBoundingClientRect();

                    commonAlignItemWithTriggerExpect(menuRect.left, triggerRect.left);
                })
            );

            describe('Positions', () => {
                let trigger: HTMLElement;

                beforeEach(() => {
                    trigger = getTrigger();
                    trigger.style.position = 'fixed';
                    trigger.style.top = '50%';
                    trigger.style.left = '50%';

                    setConfig({ alignMenuItemsWithTrigger: true });
                });

                it(
                    'should align items with trigger for "bottom-start" position (default)',
                    autoFlush(() => {
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 0).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.left, triggerRect.left);
                    })
                );

                it(
                    'should align items with trigger for "bottom-end" position',
                    autoFlush(() => {
                        setConfig({ position: 'bottom-end' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 0).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.right, triggerRect.right);
                    })
                );

                it(
                    'should align items with trigger for "top-start" position',
                    autoFlush(() => {
                        setConfig({ position: 'top-start' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 0).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.left, triggerRect.left);
                    })
                );

                it(
                    'should align items with trigger for "top-end" position',
                    autoFlush(() => {
                        setConfig({ position: 'top-end' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 0).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.right, triggerRect.right);
                    })
                );

                it(
                    'should align items with trigger for "left-start" position',
                    autoFlush(() => {
                        setConfig({ position: 'left-start' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 0).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.top, triggerRect.top);
                    })
                );

                it(
                    'should align items with trigger for "left-end" position',
                    autoFlush(() => {
                        setConfig({ position: 'left-end' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 2).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.bottom, triggerRect.bottom);
                    })
                );

                it(
                    'should align items with trigger for "right-start" position',
                    autoFlush(() => {
                        setConfig({ position: 'right-start' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 0).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.top, triggerRect.top);
                    })
                );

                it(
                    'should align items with trigger for "right-end" position',
                    autoFlush(() => {
                        setConfig({ position: 'right-end' });
                        openMenu('Enter');

                        const triggerRect = getTrigger().getBoundingClientRect();
                        const itemRect = getItem(getMenu(0), 2).getBoundingClientRect();

                        commonAlignItemWithTriggerExpect(itemRect.bottom, triggerRect.bottom);
                    })
                );
            });
        });

        describe('"closeOnScrollOutside" property', () => {
            it(
                'should close the menu when scrolled outside (default)',
                autoFlush(() => {
                    openMenu();
                    expect(getMenuCount()).toBe(1);

                    document.dispatchEvent(new Event('scroll'));
                    flush();
                    expect(getMenuCount()).toBe(0);
                })
            );

            it(
                'should NOT close the menu when scrolled outside',
                autoFlush(() => {
                    setConfig({ closeOnScrollOutside: false });
                    openMenu();
                    expect(getMenuCount()).toBe(1);

                    document.dispatchEvent(new Event('scroll'));
                    flush();
                    expect(getMenuCount()).toBe(1);
                })
            );
        });

        describe('"closeOnWindowBlur" property', () => {
            it(
                'should close the menu when blur the window (default)',
                autoFlush(() => {
                    openMenu();
                    expect(getMenuCount()).toBe(1);

                    window.dispatchEvent(new Event('blur'));
                    flush();
                    tick(16);
                    expect(getMenuCount()).toBe(0);
                })
            );

            it(
                'should NOT close the menu when blur the window',
                autoFlush(() => {
                    setConfig({ closeOnWindowBlur: false });
                    openMenu();
                    expect(getMenuCount()).toBe(1);

                    window.dispatchEvent(new Event('blur'));
                    flush();
                    expect(getMenuCount()).toBe(1);
                })
            );
        });

        describe('"iconDefaultLoader" property', () => {
            it(
                'should NOT update the icon when the item gets busy and a loader icon is NOT defined (default)',
                autoFlush(() => {
                    openMenu();

                    const item = getItem(getMenu(0), 2); // item with busy state
                    const icon = item.querySelector('a11y-icon');
                    expect(icon?.textContent?.trim()).toEqual('i');

                    clickItem(item, false);
                    tick(100);
                    fixture.detectChanges();
                    expect(icon?.textContent?.trim()).toEqual('i');

                    tick(400);
                    fixture.detectChanges();
                    expect(icon?.textContent?.trim()).toEqual('i');
                })
            );

            it(
                'should update the icon when the item gets busy and a loader icon is defined',
                autoFlush(() => {
                    setConfig({ iconDefaultLoader: 'LO' });
                    openMenu();

                    const item = getItem(getMenu(0), 2); // item with busy state
                    const icon = item.querySelector('a11y-icon');
                    expect(icon?.textContent?.trim()).toEqual('i');

                    clickItem(item, false);
                    tick(100);
                    fixture.detectChanges();
                    expect(icon?.textContent?.trim()).toEqual('LO');

                    tick(400);
                    fixture.detectChanges();
                    expect(icon?.textContent?.trim()).toEqual('i');
                })
            );
        });

        describe('"iconDefaultStrategy" property', () => {
            @Component({ selector: 'a11y-custom-icon-instance', template: '{{ icon }}' })
            class TestCustomIconInstanceComponent {
                @Input() icon: string = '';
            }

            @Component({ selector: 'a11y-custom-icon-module', template: '{{ icon }}' })
            class TestCustomIconModuleComponent {
                @Input() icon: string = '';
            }

            it(
                'should use the defined icon string as the image source when the strategy is "image"',
                autoFlush(() => {
                    setConfig({ iconDefaultStrategy: 'image' });
                    openMenu();

                    const item = getItem(getMenu(0), 0); // item with icon
                    const icon = item.querySelector('a11y-icon img');
                    expect(icon?.getAttribute('src')).toEqual('i');
                })
            );

            describe('Configured through the A11y Icon level, Module level and Instance level', () => {
                beforeEach(() => TestBed.resetTestingModule());

                const setupIconStrategyTestBed = (setModule: boolean = false): void => {
                    TestBed.configureTestingModule({
                        imports: [MenuTestModule],
                        providers: [
                            provideA11yIcon({ basePath: '/images/icons/', strategy: 'image' }),
                            ...(setModule
                                ? [
                                      provideA11yMenu({
                                          iconDefaultStrategy: {
                                              component: TestCustomIconModuleComponent,
                                              mainEntry: 'input',
                                              inputName: 'icon',
                                          },
                                      }),
                                  ]
                                : []),
                        ],
                    });
                    fixture = TestBed.createComponent(MenuTestComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                    setItems([{ label: 'item1', icon: 'i' }]);
                };

                it(
                    'should use ecosystem strategy when no other is configured',
                    autoFlush(() => {
                        setupIconStrategyTestBed();
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        const icon = item.querySelector('a11y-icon img');
                        expect(icon?.getAttribute('src')).toEqual('/images/icons/i');
                    })
                );

                it(
                    `should override the ecosystem strategy and use the defined in the module`,
                    autoFlush(() => {
                        setupIconStrategyTestBed(true);
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        const icon = item.querySelector('a11y-icon a11y-custom-icon-module');
                        expect(icon?.textContent?.trim()).toEqual('i');
                    })
                );

                it(
                    `should override the ecosystem strategy and use the defined in the instance`,
                    autoFlush(() => {
                        setupIconStrategyTestBed();
                        setConfig({
                            iconDefaultStrategy: {
                                component: TestCustomIconInstanceComponent,
                                mainEntry: 'input',
                                inputName: 'icon',
                            },
                        });
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        const icon = item.querySelector('a11y-icon a11y-custom-icon-instance');
                        expect(icon?.textContent?.trim()).toEqual('i');
                    })
                );

                it(
                    `should override the ecosystem & module strategies and use the defined in the instance`,
                    autoFlush(() => {
                        setupIconStrategyTestBed(true);
                        setConfig({
                            iconDefaultStrategy: {
                                component: TestCustomIconInstanceComponent,
                                mainEntry: 'input',
                                inputName: 'icon',
                            },
                        });
                        openMenu();

                        const item = getItem(getMenu(0), 0);
                        const icon = item.querySelector('a11y-icon a11y-custom-icon-instance');
                        expect(icon?.textContent?.trim()).toEqual('i');
                    })
                );
            });

            it(
                `should use the defined icon string as the component's input when the strategy is a component`,
                autoFlush(() => {
                    setConfig({
                        iconDefaultStrategy: {
                            component: TestCustomIconInstanceComponent,
                            mainEntry: 'input',
                            inputName: 'icon',
                        },
                    });
                    openMenu();

                    const item = getItem(getMenu(0), 0); // item with icon
                    const icon = item.querySelector('a11y-icon a11y-custom-icon-instance');
                    expect(icon?.textContent?.trim()).toEqual('i');
                })
            );
        });

        describe('"menuLabel" property', () => {
            it(
                'should NOT have the "aria-label" attribute defined when no label is provided',
                autoFlush(() => {
                    openMenu();
                    expect(getMenu(0).getAttribute('aria-label')).toBeNull();
                })
            );

            it(
                'should have the "aria-label" attribute defined when a label is provided',
                autoFlush(() => {
                    setConfig({ menuLabel: 'root menu label' });
                    openMenu();

                    expect(getMenu(0).getAttribute('aria-label')).toEqual('root menu label');
                })
            );
        });

        describe('"offsetMenu" property', () => {
            it(
                'should have a distance of 2px between trigger and menu (default)',
                autoFlush(() => {
                    openMenu('Enter');

                    const triggerRect = getTrigger().getBoundingClientRect();
                    const menuRect = getMenu(0).getBoundingClientRect();

                    expect(Math.round(menuRect.top)).toEqual(Math.round(triggerRect.bottom) + 2);
                })
            );

            it(
                'should have a distance of 20px between trigger and menu (custom)',
                autoFlush(() => {
                    setConfig({ offsetMenu: 20 });
                    openMenu('Enter');

                    const triggerRect = getTrigger().getBoundingClientRect();
                    const menuRect = getMenu(0).getBoundingClientRect();

                    expect(Math.round(menuRect.top)).toEqual(Math.round(triggerRect.bottom) + 20);
                })
            );
        });

        describe('"offsetSubmenu" property', () => {
            it(
                'should have a distance of 4px between item trigger and submenu (default)',
                autoFlush(() => {
                    openMenu('Enter');

                    const item = getItem(getMenu(0), 1);
                    mouseEnterItem(item);

                    const triggerRect = item.getBoundingClientRect();
                    const submenuRect = getMenu(1).getBoundingClientRect();

                    expect(Math.round(submenuRect.left)).toEqual(Math.round(triggerRect.right) + 4);
                })
            );

            it(
                'should have a distance of 15px between item trigger and submenu (custom)',
                autoFlush(() => {
                    setConfig({ offsetSubmenu: 15 });
                    openMenu('Enter');

                    const item = getItem(getMenu(0), 1);
                    mouseEnterItem(item);

                    const triggerRect = item.getBoundingClientRect();
                    const submenuRect = getMenu(1).getBoundingClientRect();

                    expect(Math.round(submenuRect.left)).toEqual(Math.round(triggerRect.right) + 15);
                })
            );
        });

        describe('Max Size properties', () => {
            it(
                'should have a max-width of 100px',
                autoFlush(() => {
                    setConfig({ maxWidth: '100px' });
                    openMenu('Enter');

                    const menu = getMenu(0);
                    expect(getComputedStyle(menu).width).toEqual('100px');
                })
            );

            it(
                'should have a max-height of 100px',
                autoFlush(() => {
                    setConfig({ maxHeight: '100px' });
                    openMenu('Enter');

                    const menu = getMenu(0);
                    expect(getComputedStyle(menu).height).toEqual('100px');
                })
            );
        });
    });
});
