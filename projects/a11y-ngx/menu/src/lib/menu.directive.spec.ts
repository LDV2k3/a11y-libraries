import { TestBed, ComponentFixture, flush, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';

import { A11yMenuModule } from './menu.module';
import { MenuDirective } from './menu.directive';
import { MenuService } from './menu.service';
import { MobileService } from './mobile/mobile.service';

import { WINDOW } from './menu.module.providers.private';
import * as ERRORS from './menu.errors';

import type {
    Menu,
    MenuConfig,
    MenuItem,
    MenuItemInfo,
    MenuItemSelectable,
    MenuItemSubmenu,
    MenuGroupSelectableStack,
} from './menu.type';

@Component({
    selector: 'a11y-test-menu',
    template: `
        <button
            *ngIf="showTrigger"
            type="button"
            class="trigger"
            [a11yMenu]="items"
            [a11yMenuConfig]="config"
            [a11yMenuLabel]="label"
            [a11yIconTemplate]="iconTemplate"
            #menu="a11yMenu">
            trigger
        </button>

        <ng-container *ngIf="showTriggerIconTemplate">
            <button type="button" class="trigger" [a11yMenu]="items" [a11yIconTemplate]="iconTemplate">trigger</button>

            <ng-template #iconTemplate let-theIcon>
                <em>{{ theIcon }}</em>
            </ng-template>
        </ng-container>

        <!-- To test host not being a "button" -->
        <button *ngIf="showTriggerSubmit" type="submit" class="trigger-submit" [a11yMenu]="items">trigger</button>
        <a *ngIf="showTriggerAnchor" href="#" class="trigger-anchor" [a11yMenu]="items">trigger</a>
        <span *ngIf="showTriggerSpanButtonWrong" role="button" class="trigger-span-button-wrong" [a11yMenu]="items">
            trigger
        </span>
        <span
            *ngIf="showTriggerSpanButtonRight"
            role="button"
            tabindex="0"
            class="trigger-span-button-right"
            [a11yMenu]="items">
            trigger
        </span>
        <!-- To test host not being a "button" -->
    `,
})
class MenuTestComponent {
    items: Menu = [];
    label: string | undefined = undefined;
    config: MenuConfig = {};

    @ViewChild('menu') menu!: MenuDirective;

    showTrigger: boolean = true;
    showTriggerSubmit: boolean = false;
    showTriggerAnchor: boolean = false;
    showTriggerSpanButtonWrong: boolean = false;
    showTriggerSpanButtonRight: boolean = false;

    showTriggerIconTemplate: boolean = false;
}

@NgModule({
    declarations: [MenuTestComponent],
    imports: [CommonModule, A11yMenuModule],
})
class MenuTestModule {}

describe('MenuDirective', () => {
    let component: MenuTestComponent;
    let fixture: ComponentFixture<MenuTestComponent>;

    let document!: Document;

    let container!: HTMLElement;

    const setItems = (items: Menu): void => {
        component.items = items;
    };

    const getTrigger = (selector: string = 'button.trigger'): HTMLButtonElement => {
        const trigger: HTMLButtonElement = fixture.debugElement.query(By.css(selector))?.nativeElement;
        fixture.detectChanges();
        return trigger;
    };

    const getMenu = (menuIdx: number): HTMLElement => {
        return container.querySelectorAll('a11y-menu')?.[menuIdx] as HTMLElement;
    };

    const getMenuCount = (): number => {
        return container?.querySelectorAll('a11y-menu').length ?? 0;
    };

    const getItem = (menuEl: HTMLElement, itemIdx: number = 0): HTMLElement => {
        return menuEl.querySelectorAll('a11y-menu-item')?.[itemIdx] as HTMLElement;
    };

    const openMenu = (viaKeyboard: boolean = false): void => {
        const trigger: HTMLElement = getTrigger();

        if (viaKeyboard) {
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
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

    const clickItem = (itemEl: HTMLElement): void => {
        itemEl.dispatchEvent(new PointerEvent('click'));
        flush();
    };

    const mouseEnterItem = (itemEl: HTMLElement): void => {
        itemEl.dispatchEvent(new PointerEvent('mouseenter'));
        flush();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [MenuTestModule] }).compileComponents();

        fixture = TestBed.createComponent(MenuTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        document = TestBed.inject(DOCUMENT);
    });

    describe('Host Attributes', () => {
        describe('[aria-haspopup]', () => {
            it('should apply the attribute if the host is a <button>', fakeAsync(() => {
                const trigger = getTrigger();
                expect(trigger.getAttribute('aria-haspopup')).toEqual('menu');
            }));

            it('should apply the attribute if the host is a valid "button", aka <span role="button" tabindex="n">', fakeAsync(() => {
                component.showTrigger = false;
                component.showTriggerSpanButtonRight = true;
                fixture.detectChanges();

                const trigger = getTrigger('.trigger-span-button-right');
                expect(trigger.getAttribute('aria-haspopup')).toEqual('menu');
            }));
        });

        describe('[aria-expanded]', () => {
            beforeEach(() => setItems([{ label: 'item1' }]));

            it('should be "true" when the menu is open', fakeAsync(() => {
                const trigger = getTrigger();
                expect(trigger.getAttribute('aria-expanded')).toEqual('false');

                openMenu();
                expect(trigger.getAttribute('aria-expanded')).toEqual('true');
                tick(16);
            }));

            it('should be "false" when the menu is closed', fakeAsync(() => {
                const trigger = getTrigger();

                openMenu();
                expect(trigger.getAttribute('aria-expanded')).toEqual('true');

                sendKey('Escape');
                expect(trigger.getAttribute('aria-expanded')).toEqual('false');
                tick(16);
            }));
        });
    });

    describe('menuContext', () => {
        const itemAction: MenuItem = { label: 'itemAction', value: 'action-item' };
        const itemSubmenu: MenuItemSubmenu = {
            label: 'submenu-item',
            submenu: [{ label: '' }],
            value: 'submenu-item',
        };
        const itemInfo: MenuItemInfo = { info: 'itemInfo', value: 'info-item' };
        const itemRadio: MenuItemSelectable = { label: 'itemSelectableRadio', value: 'radio-item' };
        const itemSelectableRadio: MenuGroupSelectableStack = { type: 'radio', items: [itemRadio] };
        const itemCheckbox: MenuItemSelectable = { label: 'itemSelectableCheckbox', value: 'checkbox-item' };
        const itemSelectableCheckbox: MenuGroupSelectableStack = { type: 'checkbox', items: [itemCheckbox] };

        beforeEach(() => setItems([itemAction, itemSubmenu, itemInfo, itemSelectableRadio, itemSelectableCheckbox]));

        it('should return "undefined" when menu is not open', fakeAsync(() => {
            expect(component.menu.menuContext).toBeUndefined();
        }));

        it('should NOT return "undefined" when menu is open', fakeAsync(() => {
            openMenu();
            expect(component.menu.menuContext).not.toBeUndefined();
            tick(16);
        }));

        it('should close the entire menu using the "closeMenu()" method', fakeAsync(() => {
            openMenu();
            expect(getMenuCount()).toBe(1);
            component.menu.menuContext?.closeMenu();
            flush();
            expect(getMenuCount()).toBe(0);
            tick(16);
        }));

        describe('"getItemAction()" method', () => {
            it('should return the action item for the "action-item" value', fakeAsync(() => {
                openMenu();
                const item = component.menu.menuContext?.getItemAction('action-item')?.item;
                expect(item).toEqual(itemAction);
                tick(16);
            }));

            it('should return "undefined" for the non-existing "another-action-item" value', fakeAsync(() => {
                spyOn(console, 'error');
                openMenu();
                const item = component.menu.menuContext?.getItemAction('another-action-item')?.item;
                expect(item).toBeUndefined();
                expect(console.error).toHaveBeenCalledWith(
                    ERRORS.ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND('another-action-item')
                );
                tick(16);
            }));
        });

        describe('"getItemInfo()" method', () => {
            it('should return the info item for the "info-item" value', fakeAsync(() => {
                openMenu();
                const item = component.menu.menuContext?.getItemInfo('info-item')?.item;
                expect(item).toEqual(itemInfo);
                tick(16);
            }));

            it('should return "undefined" for the non-existing "another-info-item" value', fakeAsync(() => {
                spyOn(console, 'error');
                openMenu();
                const item = component.menu.menuContext?.getItemInfo('another-info-item')?.item;
                expect(item).toBeUndefined();
                expect(console.error).toHaveBeenCalledWith(
                    ERRORS.ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND('another-info-item')
                );
                tick(16);
            }));
        });

        describe('"getItemSelectable()" method', () => {
            it('should return the radio item for the "radio-item" value', fakeAsync(() => {
                openMenu();
                const item = component.menu.menuContext?.getItemSelectable('radio-item')?.item;
                expect(item).toEqual(itemRadio);
                tick(16);
            }));

            it('should return the checkbox item for the "checkbox-item" value', fakeAsync(() => {
                openMenu();
                const item = component.menu.menuContext?.getItemSelectable('checkbox-item')?.item;
                expect(item).toEqual(itemCheckbox);
                tick(16);
            }));

            it('should return "undefined" for the non-existing "another-checkbox-item" value', fakeAsync(() => {
                spyOn(console, 'error');
                openMenu();
                const item = component.menu.menuContext?.getItemSelectable('another-checkbox-item')?.item;
                expect(item).toBeUndefined();
                expect(console.error).toHaveBeenCalledWith(
                    ERRORS.ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND('another-checkbox-item')
                );
                tick(16);
            }));
        });

        describe('"getItemSubmenu()" method', () => {
            it('should return the submenu item for the "submenu-item" value', fakeAsync(() => {
                openMenu();
                const item = component.menu.menuContext?.getItemSubmenu('submenu-item')?.item;
                expect(item).toEqual(itemSubmenu);
                tick(16);
            }));

            it('should return "undefined" for the non-existing "another-submenu-item" value', fakeAsync(() => {
                spyOn(console, 'error');
                openMenu();
                const item = component.menu.menuContext?.getItemSubmenu('another-submenu-item')?.item;
                expect(item).toBeUndefined();
                expect(console.error).toHaveBeenCalledWith(
                    ERRORS.ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND('another-submenu-item')
                );
                tick(16);
            }));
        });

        describe('"announce()" method', () => {
            it('should update the live region text', fakeAsync(() => {
                openMenu();
                component.menu.menuContext?.announce('announce something');
                flush();

                const announcerEl = document.body.querySelector('a11y-live-announcer');
                expect(announcerEl?.textContent).toEqual('announce something');
            }));
        });
    });

    describe('Outputs', () => {
        describe('"itemSelected"', () => {
            let item1: MenuItem;
            let item2: MenuItem;
            let item3: MenuGroupSelectableStack;
            let item4: MenuGroupSelectableStack;

            beforeEach(() => {
                item1 = { label: 'item1', submenu: [{ label: 'item1a' }] };
                item2 = { label: 'item2' };
                item3 = { type: 'radio', items: [{ label: 'item3a' }, { label: 'item3b' }] };
                item4 = { type: 'checkbox', items: [{ label: 'item4a' }, { label: 'item4b' }] };

                setItems([item1, item2, item3, item4]);
            });

            describe('Action item', () => {
                it('should emit the item when selected by pointer', fakeAsync(() => {
                    openMenu();

                    spyOn(component.menu.itemSelected, 'emit');

                    const item: HTMLElement = getItem(getMenu(0), 1);
                    clickItem(item);

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({ item: item2 });
                    tick(16);
                }));

                it('should emit the item when selected by keyboard', fakeAsync(() => {
                    openMenu(true);

                    spyOn(component.menu.itemSelected, 'emit');

                    sendKey('Enter'); // Enter the submenu
                    sendKey('Enter'); // Select the item

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({ item: { label: 'item1a' } });
                    tick(16);
                }));
            });

            describe('Selectable Radio item', () => {
                it('should emit the radio item and group when selected by pointer and not emit again if it is the currently checked one', fakeAsync(() => {
                    openMenu();

                    spyOn(component.menu.itemSelected, 'emit');

                    const item1: HTMLElement = getItem(getMenu(0), 2); // item3a
                    clickItem(item1);

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item3a', checked: true },
                        group: {
                            type: 'radio',
                            items: [
                                { label: 'item3a', checked: true },
                                { label: 'item3b', checked: false },
                            ],
                        },
                    });

                    const item2: HTMLElement = getItem(getMenu(0), 3); // item3b
                    clickItem(item2);

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item3b', checked: true },
                        group: {
                            type: 'radio',
                            items: [
                                { label: 'item3a', checked: false },
                                { label: 'item3b', checked: true },
                            ],
                        },
                    });

                    clickItem(item2);
                    expect(component.menu.itemSelected.emit).toHaveBeenCalledTimes(2);
                    tick(16);
                }));

                it('should emit the radio item and group when selected by keyboard and not emit again if it is the currently checked one', fakeAsync(() => {
                    openMenu();

                    spyOn(component.menu.itemSelected, 'emit');

                    const menu = getMenu(0);
                    const item1: HTMLElement = getItem(menu, 2); // item3a
                    const item2: HTMLElement = getItem(menu, 3); // item3b

                    item2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item3b', checked: true },
                        group: {
                            type: 'radio',
                            items: [
                                { label: 'item3a', checked: false },
                                { label: 'item3b', checked: true },
                            ],
                        },
                    });

                    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item3a', checked: true },
                        group: {
                            type: 'radio',
                            items: [
                                { label: 'item3a', checked: true },
                                { label: 'item3b', checked: false },
                            ],
                        },
                    });

                    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
                    expect(component.menu.itemSelected.emit).toHaveBeenCalledTimes(2);
                    tick(16);
                }));
            });

            describe('Selectable Checkbox item', () => {
                it('should emit the checkbox item and group when selected by pointer', fakeAsync(() => {
                    openMenu();

                    spyOn(component.menu.itemSelected, 'emit');

                    const menu = getMenu(0);
                    const item1: HTMLElement = getItem(menu, 4); // item4a
                    const item2: HTMLElement = getItem(menu, 5); // item4b

                    item2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item4b', checked: true },
                        group: {
                            type: 'checkbox',
                            items: [
                                { label: 'item4a', checked: false },
                                { label: 'item4b', checked: true },
                            ],
                        },
                    });

                    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item4a', checked: true },
                        group: {
                            type: 'checkbox',
                            items: [
                                { label: 'item4a', checked: true },
                                { label: 'item4b', checked: true },
                            ],
                        },
                    });

                    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
                    expect(component.menu.itemSelected.emit).toHaveBeenCalledTimes(3);
                    tick(16);
                }));

                it('should emit the checkbox item and group when selected by keyboard', fakeAsync(() => {
                    openMenu();

                    spyOn(component.menu.itemSelected, 'emit');

                    sendKey('End'); // item4b
                    sendKey('Enter'); // Select the item

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item4b', checked: true },
                        group: {
                            type: 'checkbox',
                            items: [
                                { label: 'item4a', checked: false },
                                { label: 'item4b', checked: true },
                            ],
                        },
                    });

                    sendKey('ArrowUp'); // item4a
                    sendKey('Enter'); // Select the item

                    expect(component.menu.itemSelected.emit).toHaveBeenCalledWith({
                        item: { label: 'item4b', checked: true },
                        group: {
                            type: 'checkbox',
                            items: [
                                { label: 'item4a', checked: true },
                                { label: 'item4b', checked: true },
                            ],
                        },
                    });

                    sendKey('Enter'); // Select the item again
                    expect(component.menu.itemSelected.emit).toHaveBeenCalledTimes(3);
                    tick(16);
                }));
            });
        });

        describe('"menuOpened"', () => {
            beforeEach(() => setItems([{ label: 'item1' }]));

            it('should emit "click" when opened via pointer', fakeAsync(() => {
                spyOn(component.menu.menuOpened, 'emit');
                openMenu();

                expect(component.menu.menuOpened.emit).toHaveBeenCalledWith('click');
                tick(16);
            }));

            it('should emit "keyboard" when opened via keyboard', fakeAsync(() => {
                spyOn(component.menu.menuOpened, 'emit');
                openMenu(true);

                expect(component.menu.menuOpened.emit).toHaveBeenCalledWith('keyboard');
                tick(16);
            }));
        });
    });

    describe('Inputs', () => {
        describe('"a11yIconTemplate"', () => {
            it('should render the icon using the given template', fakeAsync(() => {
                component.showTrigger = false;
                fixture.detectChanges();
                component.showTriggerIconTemplate = true;
                fixture.detectChanges();

                setItems([{ label: 'item1', icon: 'the-template-icon' }]);
                openMenu();

                const emElement = getItem(getMenu(0)).querySelector('[menu-item-icon] em');
                expect(emElement).toBeTruthy();
                expect(emElement?.textContent).toEqual('the-template-icon');
                tick(16);
            }));
        });

        describe('"a11yMenuLabel"', () => {
            beforeEach(() => setItems([{ label: 'item1' }]));

            it('should NOT render the aria-label attribute by default', fakeAsync(() => {
                openMenu();

                const ariaLabel: string | null = getMenu(0).getAttribute('aria-label');
                expect(ariaLabel).toBeNull();
                tick(16);
            }));

            it('should apply the provided text to the aria-label attribute', fakeAsync(() => {
                component.label = 'menu label';
                openMenu();

                const ariaLabel: string | null = getMenu(0).getAttribute('aria-label');
                expect(ariaLabel).toEqual('menu label');
                tick(16);
            }));
        });
    });

    describe('Initialization', () => {
        beforeEach(() => {
            spyOn(console, 'error');
            setItems([{ label: 'test' }]);
        });

        describe('Invalid Host Elements', () => {
            it('should throw an error if host is a <button type="submit">', () => {
                component.showTriggerSubmit = true;
                fixture.detectChanges();
                expect(console.error).toHaveBeenCalledWith(
                    ERRORS.ERROR_NO_BUTTON_HOST(getTrigger('button.trigger-submit'))
                );
            });

            it('should throw an error if host is a <a>', () => {
                component.showTriggerAnchor = true;
                fixture.detectChanges();
                expect(console.error).toHaveBeenCalledWith(ERRORS.ERROR_NO_BUTTON_HOST(getTrigger('a.trigger-anchor')));
            });

            it('should throw an error if host is a <span>', () => {
                component.showTriggerSpanButtonWrong = true;
                fixture.detectChanges();
                expect(console.error).toHaveBeenCalledWith(
                    ERRORS.ERROR_NO_BUTTON_HOST(getTrigger('span.trigger-span-button-wrong'))
                );
            });
        });

        describe('Valid Host Elements', () => {
            it('should NOT throw an error if host is a <button type="button">', () => {
                expect(console.error).not.toHaveBeenCalled();
            });

            it('should NOT throw an error if host is a <span role="button" tabindex="0">', () => {
                component.showTriggerSpanButtonRight = true;
                fixture.detectChanges();
                expect(console.error).not.toHaveBeenCalled();
            });
        });
    });

    describe('Opening the menu', () => {
        it('should throw a warning when no items are provided', () => {
            spyOn(console, 'warn');
            getTrigger().click();
            expect(console.warn).toHaveBeenCalledWith(ERRORS.ERROR_NO_DATA_PROVIDED());
        });

        it('should NOT open if the button trigger is disabled', fakeAsync(() => {
            setItems([{ label: 'item1' }]);
            getTrigger().disabled = true;
            openMenu();
            expect(getMenuCount()).toBe(0);
            tick(16);
        }));

        it('should NOT open if the role="button" trigger is disabled (using [aria-disabled])', fakeAsync(() => {
            setItems([{ label: 'item1' }]);

            component.showTrigger = false;
            component.showTriggerSpanButtonRight = true;
            fixture.detectChanges();
            tick();

            const trigger = getTrigger('.trigger-span-button-right');
            trigger.setAttribute('aria-disabled', 'true');
            trigger.click();

            flush();
            fixture.detectChanges();

            container = document.body.querySelector('a11y-menu-container') as HTMLElement;

            expect(getMenuCount()).toBe(0);
            tick(16);
        }));

        it('should establish navigation as "kb" when opened via keyboard', fakeAsync(() => {
            setItems([{ label: 'item1' }]);
            const service = TestBed.inject(MenuService);
            spyOn(service, 'navigateFrom');
            openMenu(true);
            expect(service.navigateFrom).toHaveBeenCalledWith('kb');
            tick(16);
        }));

        it('should establish navigation as "pointer" when opened via mouse', fakeAsync(() => {
            setItems([{ label: 'item1' }]);
            const service = TestBed.inject(MenuService);
            spyOn(service, 'navigateFrom');
            openMenu();
            expect(service.navigateFrom).toHaveBeenCalledWith('pointer');
            tick(16);
        }));

        describe('initial item selection', () => {
            beforeEach(() => setItems([{ label: 'item1' }, { label: 'item2', submenu: [{ label: 'item2a' }] }]));

            it('should select the first item immediately when opened with keyboard', fakeAsync(() => {
                openMenu(true);

                // Root menu
                const firstItem: HTMLElement = getItem(getMenu(0), 0);
                expect(firstItem.getAttribute('active-item')).toEqual('kb');

                // First submenu
                sendKey('ArrowDown');
                sendKey('Enter');

                const secondItem: HTMLElement = getItem(getMenu(1), 0);
                expect(secondItem.getAttribute('active-item')).toEqual('kb');
                tick(16);
            }));

            it('should select the first item when opened with pointer and pressing "Enter"', fakeAsync(() => {
                openMenu();

                // Root menu
                const firstItem: HTMLElement = getItem(getMenu(0), 0);
                expect(firstItem.getAttribute('active-item')).toBeNull();

                sendKey('Enter');
                expect(firstItem.getAttribute('active-item')).toEqual('kb');

                // First submenu
                mouseEnterItem(getItem(getMenu(0), 1));

                const secondItem: HTMLElement = getItem(getMenu(1), 0);
                expect(secondItem.getAttribute('active-item')).toBeNull();

                sendKey('Enter');
                expect(secondItem.getAttribute('active-item')).toEqual('kb');
                tick(16);
            }));
        });
    });

    describe('Closing the menu', () => {
        let spyOnMenuClosed: jasmine.Spy;

        beforeEach(() => {
            setItems([{ label: 'item1' }]);
            spyOnMenuClosed = spyOn(component.menu.menuClosed, 'emit');
        });

        it('should emit "internal" and NOT return focus to the host when the close reason is "internal"', fakeAsync(() => {
            const service = TestBed.inject(MenuService);
            openMenu();

            service.destroyMenu({ closeReason: 'internal' });
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('internal');
            expect(document.activeElement).not.toEqual(getTrigger());
        }));

        it('should emit "escape" and return focus to the host when pressing "Escape" key', fakeAsync(() => {
            openMenu();
            sendKey('Escape');

            expect(spyOnMenuClosed).toHaveBeenCalledWith('escape');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "keyboard" and return focus to the host when pressing "Tab" key', fakeAsync(() => {
            openMenu();
            sendKey('Tab');

            expect(spyOnMenuClosed).toHaveBeenCalledWith('keyboard');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "keyboard" and return focus to the host when pressing "AltLeft" key', fakeAsync(() => {
            openMenu();
            sendKey('AltLeft');

            expect(spyOnMenuClosed).toHaveBeenCalledWith('keyboard');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "keyboard" and return focus to the host when pressing "AltRight" key', fakeAsync(() => {
            openMenu();
            sendKey('AltRight');

            expect(spyOnMenuClosed).toHaveBeenCalledWith('keyboard');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "keyboard" and return focus to the host when pressing "F10" key', fakeAsync(() => {
            openMenu();
            sendKey('F10');

            expect(spyOnMenuClosed).toHaveBeenCalledWith('keyboard');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "toggle" and kept focus to the host when it gets retriggered via pointer', fakeAsync(() => {
            const trigger = getTrigger();
            openMenu();
            trigger.click();
            trigger.focus();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('toggle');
            tick(16);

            expect(document.activeElement).toEqual(trigger);
        }));

        it('should emit "toggle" and kept focus to the host when it gets retriggered via keyboard', fakeAsync(() => {
            const trigger = getTrigger();
            openMenu();
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            trigger.focus();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('toggle');
            tick(16);

            expect(document.activeElement).toEqual(trigger);
        }));

        it('should emit "item-selected-click" and return focus to the host after item gets selected via pointer', fakeAsync(() => {
            openMenu();
            clickItem(getItem(getMenu(0)));

            expect(spyOnMenuClosed).toHaveBeenCalledWith('item-selected-click');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "item-selected-keyboard" and return focus to the host after item gets selected via keyboard', fakeAsync(() => {
            openMenu(true);
            sendKey('Enter');

            expect(spyOnMenuClosed).toHaveBeenCalledWith('item-selected-keyboard');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "programmatically" and return focus to the host when closed manually via menu context', fakeAsync(() => {
            openMenu();
            component.menu.menuContext?.closeMenu();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('programmatically');
            tick(16);

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "click-outside" and NOT return focus to the host when closed via clicking outside', fakeAsync(() => {
            openMenu();
            document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
            tick();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('click-outside');
            tick(16);

            expect(document.activeElement).not.toEqual(getTrigger());
        }));

        it('should emit "click-outside" and NOT return focus to the host when closed via window blur', fakeAsync(() => {
            openMenu();
            window.dispatchEvent(new Event('blur'));
            tick();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('click-outside');
            tick(16);

            expect(document.activeElement).not.toEqual(getTrigger());
        }));

        it(`should emit "click-outside" and NOT return focus to the host when closed via mobile's state changed`, fakeAsync(() => {
            const mobileService = TestBed.inject(MobileService);
            openMenu();

            mobileService.mobileStateChanged$.next();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('click-outside');
            tick(16);
            flush();

            expect(document.activeElement).not.toEqual(getTrigger());
        }));

        it('should emit "touch-outside" and NOT return focus to the host when closed via touching outside', fakeAsync(() => {
            openMenu();
            document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }));
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('touch-outside');
            tick(16);

            expect(document.activeElement).not.toEqual(getTrigger());
        }));

        it('should emit "wheel-outside" and NOT return focus to the host when closed via using the wheel outside', fakeAsync(() => {
            openMenu();
            document.dispatchEvent(new Event('scroll'));
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('wheel-outside');
            tick(16);

            expect(document.activeElement).not.toEqual(getTrigger());
        }));

        it(`should emit "mobile-back" and return focus to the host when closed via the browser's back button (popstate) on mobile`, fakeAsync(() => {
            const myWindow = TestBed.inject(WINDOW);
            if (!myWindow) {
                expect(true).toBeTrue();
                return;
            }

            const mobileService = TestBed.inject(MobileService);
            mobileService['isMobileBreakpoint'] = true;

            openMenu();
            myWindow.dispatchEvent(new PopStateEvent('popstate'));
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('mobile-back');
            tick(16);
            flush();

            expect(document.activeElement).toEqual(getTrigger());
        }));

        it('should emit "host-destroyed" when closed via the host being destroyed', fakeAsync(() => {
            openMenu();
            component.showTrigger = false;
            fixture.detectChanges();
            flush();

            expect(spyOnMenuClosed).toHaveBeenCalledWith('host-destroyed');
            tick(16);
        }));
    });
});
