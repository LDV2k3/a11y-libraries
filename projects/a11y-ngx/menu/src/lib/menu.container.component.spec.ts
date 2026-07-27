import { TestBed, ComponentFixture } from '@angular/core/testing';

import { KeyboardNavigationService } from '@a11y-ngx/keyboard-navigation';

import { MenuService } from './menu.service';
import { MobileService } from './mobile/mobile.service';
import { MenuDirectorPrivateService } from './menu.director.service.private';

import { MenuContainerComponent } from './menu.container.component';
import { MenuComponent } from './components/menu.component';

import type { MenuMainConfig } from './menu.type.private';
import type { Menu, MenuItem, MenuItemSubmenu } from './menu.type';

describe('MenuContainerComponent', () => {
    let component: MenuContainerComponent;
    let fixture: ComponentFixture<MenuContainerComponent>;
    let service: MenuService;
    let director: MenuDirectorPrivateService;
    let keyNav: KeyboardNavigationService;

    let container: HTMLElement;

    const sendKey = (code: string, repeat: boolean = false): void => {
        container.dispatchEvent(new KeyboardEvent('keydown', { code, repeat }));
    };

    const setConfig = (config: Partial<MenuMainConfig> = {}): void => {
        service.initRootMenuData(new DOMRect(400, 400), [], 'menu-selector', config);
    };

    const setItems = (items: Menu): void => {
        service['menuOriginalItems'] = items;
        service.initKeyNavItems();
        component.initKeyNavData();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ declarations: [MenuContainerComponent] });

        fixture = TestBed.createComponent(MenuContainerComponent);
        service = TestBed.inject(MenuService);
        director = TestBed.inject(MenuDirectorPrivateService);
        keyNav = fixture.debugElement.injector.get(KeyboardNavigationService);
        component = fixture.componentInstance;
        container = fixture.debugElement.nativeElement;
        fixture.detectChanges();
    });

    describe('Host Attributes', () => {
        it('should have the role "region" set', () => {
            expect(container.getAttribute('role')).toEqual('region');
        });

        it('should NOT have "aria-modal" attribute set when is NOT mobile device', () => {
            spyOnProperty(TestBed.inject(MobileService), 'isMobile').and.returnValue(false);
            fixture.detectChanges();
            expect(container.getAttribute('aria-modal')).toBeNull();
        });

        it('should have "aria-modal" attribute set to "true" when is mobile device', () => {
            spyOnProperty(TestBed.inject(MobileService), 'isMobile').and.returnValue(true);
            fixture.detectChanges();
            expect(container.getAttribute('aria-modal')).toEqual('true');
        });
    });

    describe('Listeners', () => {
        it('should destroy itself when menu gets destroyed through "rootMenuDestroyed$" subject', () => {
            spyOn(director, 'destroyContainer');
            service.rootMenuDestroyed$.next('escape');
            expect(director.destroyContainer).toHaveBeenCalled();
        });

        it('should re-asign the items to the KeyNav service through "menuItemDisabledStateUpdated$" subject', () => {
            spyOn(keyNav, 'setItems');
            setItems([{ label: 'item1' }]);
            service.menuItemDisabledStateUpdated$.next();
            expect(keyNav.setItems).toHaveBeenCalledWith([{ label: 'item1' }]);
        });

        it('should update the menu state through "executeKeyNavNavigation$" subject', () => {
            spyOn(service, 'updateMenuState');
            setItems([{ label: 'item1' }]);
            service.executeKeyNavNavigation$.next('ArrowDown');
            expect(service.updateMenuState).toHaveBeenCalledWith({
                key: 'ArrowDown',
                action: 'next',
                indexFrom: -1,
                indexTo: 0,
                pathFrom: [],
                pathTo: [],
                itemFrom: undefined,
                itemTo: { label: 'item1' },
            });
        });

        it('should NOT update the menu state through "executeKeyNavNavigation$" subject when the same key has been pressed twice and the result is null', () => {
            spyOn(service, 'updateMenuState');
            setItems([{ label: 'item1' }]);
            service.executeKeyNavNavigation$.next('End');
            expect(service.updateMenuState).toHaveBeenCalledTimes(1);
            service.executeKeyNavNavigation$.next('End');
            expect(service.updateMenuState).toHaveBeenCalledTimes(1);
        });
    });

    describe('Keyboard Navigation', () => {
        it('should prevent default when event.repeat', () => {
            const event = new KeyboardEvent('keydown', { code: 'Enter', repeat: true, cancelable: true });
            container.dispatchEvent(event);
            expect(event.defaultPrevented).toBeTrue();
        });

        describe('Prevent Navigation and Early Returns', () => {
            ['AltLeft', 'AltRight', 'F10'].forEach((code) => {
                it(`should prevent, destroy the menu and stop when "${code}" key`, () => {
                    const event = new KeyboardEvent('keydown', { code, cancelable: true });
                    spyOn(event, 'preventDefault');
                    spyOn(event, 'stopImmediatePropagation');
                    spyOn(service, 'destroyMenu');
                    spyOn(service, 'navigateFrom');

                    container.dispatchEvent(event);
                    expect(event.preventDefault).toHaveBeenCalled();
                    expect(event.stopImmediatePropagation).toHaveBeenCalled();
                    expect(service.destroyMenu).toHaveBeenCalled();
                    expect(service.navigateFrom).not.toHaveBeenCalled();
                });
            });

            [true, false].forEach((closeOnTab) => {
                const expected: string = closeOnTab
                    ? 'should prevent, destroy the menu and stop when "Tab" key and "closeOnTab" is set to "true"'
                    : 'should prevent, NOT destroy the menu and stop when "Tab" key and "closeOnTab" is set to "false"';

                it(expected, () => {
                    const event = new KeyboardEvent('keydown', { code: 'Tab', cancelable: true });
                    spyOn(event, 'preventDefault');
                    spyOn(event, 'stopImmediatePropagation');
                    spyOn(service, 'destroyMenu');
                    spyOn(service, 'navigateFrom');

                    setConfig({ closeOnTab });
                    container.dispatchEvent(event);
                    expect(event.preventDefault).toHaveBeenCalled();
                    expect(event.stopImmediatePropagation).toHaveBeenCalled();

                    if (closeOnTab) expect(service.destroyMenu).toHaveBeenCalled();
                    else expect(service.destroyMenu).not.toHaveBeenCalled();

                    expect(service.navigateFrom).not.toHaveBeenCalled();
                });
            });

            ['Space', 'F1', 'F2', 'F5', 'F8', 'F9', 'F12'].forEach((code) => {
                it(`should prevent and stop when "${code}" key`, () => {
                    const event = new KeyboardEvent('keydown', { code, cancelable: true });
                    spyOn(event, 'preventDefault');
                    spyOn(event, 'stopImmediatePropagation');
                    spyOn(service, 'navigateFrom');

                    container.dispatchEvent(event);
                    expect(event.preventDefault).toHaveBeenCalled();
                    expect(event.stopImmediatePropagation).toHaveBeenCalled();
                    expect(service.navigateFrom).not.toHaveBeenCalled();
                });
            });

            ['Home', 'End', 'ArrowLeft', 'ArrowRight'].forEach((code) => {
                it(`should prevent and stop on second pressing of "${code}" key`, () => {
                    setItems([{ label: 'item1' }, { label: 'item2' }]);

                    let event: KeyboardEvent;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    spyOn<any>(component, 'executeNavigation');

                    event = new KeyboardEvent('keydown', { code });
                    container.dispatchEvent(event);
                    expect(component['executeNavigation']).toHaveBeenCalled();

                    event = new KeyboardEvent('keydown', { code, cancelable: true });
                    spyOn(event, 'preventDefault');
                    spyOn(event, 'stopImmediatePropagation');

                    container.dispatchEvent(event);
                    expect(event.preventDefault).toHaveBeenCalled();
                    expect(event.stopImmediatePropagation).toHaveBeenCalled();
                    expect(component['executeNavigation']).toHaveBeenCalledTimes(1);
                });
            });
        });

        describe('Allow Navigation', () => {
            const itemSubmenu: MenuItemSubmenu = { label: 'item1', submenu: [{ label: 'item1a' }] };
            const itemDisabled: MenuItem = { label: 'item2', disabled: true };
            const itemEnabled: MenuItem = { label: 'item3' };
            const menuItems: Menu = [itemSubmenu, itemDisabled, itemEnabled];

            beforeEach(() => setItems(menuItems));

            it('should prevent and execute the navigation when a valid key has been pressed', () => {
                const event = new KeyboardEvent('keydown', { code: 'ArrowUp', cancelable: true });
                spyOn(event, 'preventDefault');
                spyOn(event, 'stopImmediatePropagation');
                spyOn(service, 'updateMenuState');

                container.dispatchEvent(event);
                expect(event.preventDefault).toHaveBeenCalled();
                expect(event.stopImmediatePropagation).toHaveBeenCalled();
                expect(service.updateMenuState).toHaveBeenCalledWith({
                    key: 'ArrowUp',
                    action: 'previous',
                    indexFrom: -1,
                    indexTo: 2,
                    pathFrom: [],
                    pathTo: [],
                    itemFrom: undefined,
                    itemTo: itemEnabled,
                });
            });

            describe('Move Actions', () => {
                ['ArrowUp', 'ArrowDown', 'Home', 'End'].forEach((key) => {
                    it(`should focus the item when is the "${key}" key`, () => {
                        spyOn(service, 'focusItem');
                        sendKey(key);
                        expect(service.focusItem).toHaveBeenCalled();
                    });
                });
            });

            describe('Open Actions', () => {
                let trigger: HTMLButtonElement;
                let items: Menu;
                let label: string;

                let lastMenu: jasmine.Spy<jasmine.Func>;
                let mockMenuComp: MenuComponent;

                beforeEach(() => {
                    trigger = document.createElement('button');
                    items = itemSubmenu.submenu;
                    label = 'item1';

                    mockMenuComp = jasmine.createSpyObj('MenuComponent', ['detectChanges'], {
                        matchingData: { menuIdx: { 0: 0, 1: 1, 2: 2 } },
                        menuItemComponents: [{ nativeElement: trigger }],
                        menuItems: menuItems,
                    });

                    lastMenu = spyOnProperty(service, 'lastMenu').and.returnValue(mockMenuComp);
                });

                ['Enter', 'ArrowRight'].forEach((key) => {
                    it(`should open the submenu when is the "${key}" key`, () => {
                        spyOn(director, 'createMenu');

                        sendKey('ArrowDown'); // 1st item (with submenu)
                        sendKey(key); // sending the "open" action
                        expect(director.createMenu).toHaveBeenCalledWith(trigger, { items, path: [0], label });
                    });
                });

                it('should stop (early return) when there is NO last menu active (menubar use case: arrows left/right closes open menu to open prev/next)', () => {
                    spyOn(service, 'selectMenuItem');

                    sendKey('ArrowDown'); // 1st item (with submenu)
                    lastMenu.and.returnValue(undefined); // killing the menu
                    sendKey('ArrowRight'); // sending the "open" action

                    expect(service.selectMenuItem).not.toHaveBeenCalled();
                });

                it('should NOT open with "ArrowRight" when item does NOT have submenu', () => {
                    spyOn(director, 'createMenu');

                    sendKey('ArrowDown'); // 1st item (with submenu)
                    sendKey('ArrowDown'); // 2nd item (disabled)
                    sendKey('ArrowDown'); // 3rd item (with NO submenu)
                    sendKey('ArrowRight'); // sending the "open" action

                    expect(director.createMenu).not.toHaveBeenCalled();
                });

                it('should open the submenu with pointer', () => {
                    spyOn(director, 'createMenu');

                    sendKey('ArrowDown'); // 1st item (with submenu)
                    service.navigateFrom('pointer');
                    service.currentItemIdxFromPointer = 0;
                    service.executeKeyNavNavigation$.next('Enter'); // sending the "open" action
                    expect(director.createMenu).toHaveBeenCalledWith(trigger, { items, path: [0], label });
                });

                it('should focus on first available item when current index is -1 and user hits Enter', () => {
                    spyOn(keyNav, 'executeKey').and.callThrough();
                    spyOn(director, 'createMenu');

                    sendKey('Enter'); // sending the "open" action
                    expect(keyNav.executeKey).toHaveBeenCalledWith('ArrowDown');
                    expect(director.createMenu).not.toHaveBeenCalled();
                });

                describe('Without submenu (Item selection)', () => {
                    it('should select the item when it is enabled', () => {
                        spyOn(service, 'selectMenuItem');
                        spyOn(director, 'createMenu');

                        sendKey('End'); // 3rd item (normal item)
                        sendKey('Enter'); // sending the "open" action
                        expect(service.selectMenuItem).toHaveBeenCalled();
                        expect(director.createMenu).not.toHaveBeenCalled();
                    });

                    it('should NOT select the item when it is disabled', () => {
                        spyOn(service, 'selectMenuItem');
                        spyOn(director, 'createMenu');

                        sendKey('ArrowDown'); // 1st item
                        sendKey('ArrowDown'); // 2nd item (disabled)
                        sendKey('Enter'); // sending the "open" action
                        expect(service.selectMenuItem).not.toHaveBeenCalled();
                        expect(director.createMenu).not.toHaveBeenCalled();
                    });
                });
            });

            describe('Close Actions', () => {
                ['Escape', 'ArrowLeft'].forEach((key) => {
                    it(`should close the submenu when is the "${key}" key`, () => {
                        spyOn(service, 'destroyLastMenu');
                        spyOn(service, 'focusItem');

                        keyNav.setCurrent({ index: 0, path: [0] }); // entering item with submenu
                        sendKey(key); // sending the "close" action
                        expect(service.destroyLastMenu).toHaveBeenCalled();
                        expect(service.focusItem).toHaveBeenCalledWith([], 0);
                    });
                });

                it('should NOT close the root menu when is the "ArrowLeft" key', () => {
                    spyOn(service, 'destroyLastMenu');

                    sendKey('ArrowLeft'); // sending the "close" action
                    expect(service.destroyLastMenu).not.toHaveBeenCalled();
                });

                it('should close the root menu when is the "Escape" key', () => {
                    spyOn(service, 'destroyLastMenu');
                    spyOn(service, 'focusItem');

                    sendKey('Escape'); // sending the "close" action
                    expect(service.destroyLastMenu).toHaveBeenCalled();
                    expect(service.focusItem).toHaveBeenCalledWith([], -1);
                });
            });
        });
    });
});
