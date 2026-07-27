import { TestBed } from '@angular/core/testing';
import { Component, ComponentRef, QueryList } from '@angular/core';

import { WINDOW } from './menu.module.providers.private';

import { A11yMenuModule } from './menu.module';

import { MenuService } from './menu.service';
import { MobileService } from './mobile/mobile.service';
import type { MenuComponent } from './components/menu.component';
import type { MenuItemComponent } from './components/menu-item.component';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './menu.errors';
import type { MenuMainConfig, MenuGroupSelectables, MenuItemUpdate } from './menu.type.private';
import type { MenuConfig, MenuCustomConfig, Menu, MenuItem } from './menu.type';

describe('MenuService', () => {
    let service: MenuService;

    const mockMenu = (): ComponentRef<MenuComponent> => {
        const mockItemCompSingle: MenuItemComponent = jasmine.createSpyObj('MenuItemComponent', ['detectChanges'], {
            groupComp: undefined,
            item: { label: 'item-single' },
        });
        const menuItem: MenuItem = { label: 'item-group' };
        const mockItemCompGroup: MenuItemComponent = jasmine.createSpyObj('MenuItemComponent', ['detectChanges'], {
            groupComp: { group: { type: 'checkbox', items: [menuItem] } as MenuGroupSelectables },
            item: menuItem,
        });
        /* const mockItemWithValue: MenuItemComponent = jasmine.createSpyObj('MenuItemComponent', ['detectChanges'], {
            item: { label: 'item-with-value', value: 'the-value' },
        }); */

        const menuItemComponents = new QueryList();
        menuItemComponents.reset([mockItemCompSingle, mockItemCompGroup /* mockItemWithValue */]);

        const mockMenuComp: MenuComponent = jasmine.createSpyObj(
            'MenuComponent',
            ['detectChanges', 'focusItem', 'closeMenu'],
            {
                menuItems: [{ label: 'item1' }],
                menuItemComponents,
                menuPath: [],
            }
        );

        const mockMenuCompRef: ComponentRef<MenuComponent> = jasmine.createSpyObj('MenuComponentRef', ['destroy'], {
            instance: mockMenuComp,
        });

        return mockMenuCompRef;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MenuService);
    });

    describe('when provided more than once', () => {
        @Component({ providers: [MenuService] })
        class TestMenuDuplicatedServiceComponent {
            constructor(private service: MenuService) {}
        }

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TestMenuDuplicatedServiceComponent],
                providers: [MenuService],
            });
        });

        it('should throw an error', () => {
            expect(() => TestBed.createComponent(TestMenuDuplicatedServiceComponent)).toThrowError(
                ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('MenuService')
            );
        });
    });

    describe('when a feature was instantiated', () => {
        const featureConfig: MenuCustomConfig = {
            selector: 'test-menu',
            className: 'test-menu',
            focusItemWhenOpen: 'first',
            showGroupLabels: false,
        };

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [A11yMenuModule.customConfig(featureConfig)] });
            service = TestBed.inject(MenuService);
        });

        it('should update its config properly', () => {
            const updateFeatureConfig: MenuConfig = { boundary: 'main', alignMenuItemsWithTrigger: true };
            service.updateConfig('test-menu', updateFeatureConfig);
            expect(service.getConfig('test-menu')).toEqual({ ...featureConfig, ...updateFeatureConfig });
        });
    });

    describe('"menuContext" getter', () => {
        it('should return undefined if there is NOT a menu open', () => {
            expect(service.menuContext).toBeUndefined();
        });

        it('should the context if there is a menu open', () => {
            service.initRootMenuData(new DOMRect(1, 1), [], 'test-menu-listeners');
            expect(service.menuContext).not.toBeUndefined();
        });
    });

    describe('"menuItemsMap" Map', () => {
        it('should return an empty map when no items containing "value" property', () => {
            service.initRootMenuData(new DOMRect(1, 1), [{ label: 'item1' }, { label: 'item2' }], 'test-menu');
            service.initKeyNavItems();

            expect(service.menuItemsMap).toEqual(new Map());
        });

        it('should return a map with the items that contain "value" property', () => {
            service.initRootMenuData(
                new DOMRect(1, 1),
                [{ label: 'item1', value: '#A#' }, { label: 'item2' }],
                'test-menu'
            );
            service.initKeyNavItems();

            expect(service.menuItemsMap.size).toBe(1);
            expect(service.menuItemsMap.get('#A#[action]')).toEqual({ label: 'item1', value: '#A#' });
        });

        it('should reset the map when the menu gets destroyed', () => {
            service.initRootMenuData(new DOMRect(1, 1), [{ label: 'item1', value: '#A#' }], 'test-menu');
            service.initKeyNavItems();
            expect(service.menuItemsMap.size).toBe(1);

            service.destroyMenu();
            expect(service.menuItemsMap.size).toBe(0);
        });
    });

    describe('Subjects', () => {
        describe('"menuItemSelected$"', () => {
            it('should emit just the "item" when it is NOT part of a selectable group', () => {
                service.initRootMenuData(new DOMRect(1, 1), [], 'test-menu');
                spyOnProperty(service, 'lastNavigationState').and.returnValue({ indexTo: 0 }); // the index for "item-single"

                service.menuList.push(mockMenu());

                spyOn(service.menuItemSelected$, 'next');

                service.selectMenuItem();
                expect(service.menuItemSelected$.next).toHaveBeenCalledWith({ item: { label: 'item-single' } });
            });

            it('should emit the "item" and "group" (with new "checked" state) when it is part of a selectable group', () => {
                service.initRootMenuData(new DOMRect(1, 1), [], 'test-menu');
                spyOnProperty(service, 'lastNavigationState').and.returnValue({ indexTo: 1 }); // the index for "item-group"

                service.menuList.push(mockMenu());

                spyOn(service.menuItemSelected$, 'next');

                service.selectMenuItem();
                expect(service.menuItemSelected$.next).toHaveBeenCalledWith({
                    item: { label: 'item-group', checked: true },
                    group: {
                        type: 'checkbox',
                        items: [{ label: 'item-group', checked: true }],
                    },
                });
            });
        });

        describe('"menuItemUpdated$"', () => {
            beforeEach(() => {
                service.initRootMenuData(new DOMRect(1, 1), [{ label: 'item1', value: 'the-value' }], 'test-menu');
                service.initKeyNavItems();

                spyOn(service.menuItemUpdated$, 'next');
            });

            it('should NOT emit anything if the "value" does not exist', () => {
                service.menuContext?.getItemAction('the-unexisting-value')?.update({ disabled: true });
                expect(service.menuItemUpdated$.next).not.toHaveBeenCalled();
            });

            it('should emit the "value", "type" and "data" of the item to be updated', () => {
                service.menuContext
                    ?.getItemAction('the-value')
                    ?.update({ disabled: true, icon: { src: '/path/icon.png' } });

                expect(service.menuItemUpdated$.next).toHaveBeenCalledWith({
                    value: 'the-value',
                    type: 'action',
                    data: { disabled: true, icon: { src: '/path/icon.png' } },
                } as MenuItemUpdate);
            });
        });
    });

    describe('"initKeyNavItems()" method', () => {
        const items: Menu = [
            { separator: true },
            { label: 'item1', submenu: [{ label: 'sub1a' }, { separator: true }, { info: 'sub1b' }] },
            { info: 'info1' },
            {
                items: [
                    { label: 'item2', submenu: [{ info: 'sub2a' }] },
                    { label: 'item3' },
                    { separator: true },
                    { info: 'info2' },
                ],
            },
            {
                items: [{ label: 'item4' }, { label: 'item5', disabled: true }],
                itemsLayout: 'grid',
            },
            {
                type: 'radio',
                items: [{ label: 'radio1' }, { label: 'radio2', checked: true }, { label: 'radio3' }],
            },
            {
                items: [{ label: 'item6' }, { separator: true }, { info: 'info3' }, { label: 'item7' }],
                itemsLayout: 'inline',
            },
            {
                type: 'checkbox',
                items: [{ label: 'check1', checked: true }, { label: 'check2', checked: true }, { label: 'check3' }],
            },
            { label: 'item8', className: 'class8', submenu: [{ info: 'sub8a' }, { label: 'sub8b' }] },
        ];

        const itemsExpected: MenuItem[] = [
            { label: 'item1', submenu: [{ label: 'sub1a' }] },
            { label: 'item2', submenu: [] },
            { label: 'item3' },
            { label: 'item4' },
            { label: 'item5', disabled: true },
            { label: 'radio1' },
            { label: 'radio2', checked: true } as unknown as MenuItem,
            { label: 'radio3' },
            { label: 'item6' },
            { label: 'item7' },
            { label: 'check1', checked: true } as unknown as MenuItem,
            { label: 'check2', checked: true } as unknown as MenuItem,
            { label: 'check3' },
            { label: 'item8', className: 'class8', submenu: [{ label: 'sub8b' }] },
        ];

        it('should filter non-navigable items', () => {
            service.initRootMenuData(new DOMRect(1, 1), items, 'test-menu');
            service.initKeyNavItems();

            expect(service.keyNavMenuItems).toEqual(itemsExpected);
        });

        it('should NOT notify the KeyNav to update', () => {
            spyOn(service.menuItemDisabledStateUpdated$, 'next');

            service.initRootMenuData(new DOMRect(1, 1), items, 'test-menu');
            service.initKeyNavItems();

            expect(service.menuItemDisabledStateUpdated$.next).not.toHaveBeenCalled();
        });

        it('should notify the KeyNav to update', () => {
            spyOn(service.menuItemDisabledStateUpdated$, 'next');

            service.initRootMenuData(new DOMRect(1, 1), items, 'test-menu');
            service.initKeyNavItems(true);

            expect(service.menuItemDisabledStateUpdated$.next).toHaveBeenCalled();
        });
    });

    describe('Retrieving menus', () => {
        let menu1: ComponentRef<MenuComponent>;
        let menu2: ComponentRef<MenuComponent>;
        let menu3: ComponentRef<MenuComponent>;

        beforeEach(() => {
            menu1 = mockMenu();
            menu2 = mockMenu();
            menu3 = mockMenu();

            service.menuList.push(menu1, menu2, menu3);
        });

        describe('"rootMenu" getter', () => {
            it('should return undefined when no menus were added', () => {
                service.menuList.length = 0;
                expect(service.rootMenu).toBeUndefined();
            });

            it('should return the root menu', () => {
                expect(service.rootMenu).toEqual(menu1.instance);
            });
        });

        describe('"lastMenu" getter', () => {
            it('should return undefined when no menus were added', () => {
                service.menuList.length = 0;
                expect(service.lastMenu).toBeUndefined();
            });

            it('should return the last menu', () => {
                expect(service.lastMenu).toEqual(menu3.instance);
            });
        });

        describe('"getMenu()" method', () => {
            it('should return the root menu when index 0 is provided', () => {
                expect(service.getMenu(0)).toEqual(menu1.instance);
            });

            it('should return the 1st submenu when index 1 is provided', () => {
                expect(service.getMenu(1)).toEqual(menu2.instance);
            });

            it('should return the 2nd submenu when index 2 is provided', () => {
                expect(service.getMenu(2)).toEqual(menu3.instance);
            });

            it('should return undefined when non-valid index is provided', () => {
                expect(service.getMenu(8)).toBeUndefined();
            });
        });
    });

    describe('"focusItem()" method', () => {
        let menu1: ComponentRef<MenuComponent>;
        let menu2: ComponentRef<MenuComponent>;

        beforeEach(() => {
            menu1 = mockMenu();
            menu2 = mockMenu();

            service.menuList.push(menu1, menu2);
        });

        it('should NOT set focus when providing a wrong path', () => {
            service.focusItem([2, 4], 2);
            expect(menu1.instance.focusItem).not.toHaveBeenCalled();
            expect(menu2.instance.focusItem).not.toHaveBeenCalled();
        });

        describe('Without path/index provided (Using "Last Navigation State")', () => {
            it('should set focus on item 0 from 1st menu', () => {
                service.updateMenuState({
                    key: 'ArrowDown',
                    action: 'next',
                    indexFrom: -1,
                    indexTo: 0,
                    pathFrom: [],
                    pathTo: [],
                    itemFrom: undefined,
                    itemTo: undefined,
                });
                service.focusItem();

                expect(menu1.instance.focusItem).toHaveBeenCalledWith(0);
            });

            it('should NOT set focus when there is NO last state', () => {
                service.focusItem();
                expect(menu1.instance.focusItem).not.toHaveBeenCalled();
            });
        });

        describe('With path/index provided', () => {
            it('should set focus on item 2 from 1st menu', () => {
                service.focusItem([], 2);
                expect(menu1.instance.focusItem).toHaveBeenCalledWith(2);
            });

            it('should set focus on item 2 from 2nd menu', () => {
                service.focusItem([0], 2);
                expect(menu2.instance.focusItem).toHaveBeenCalledWith(2);
            });

            it('should set focus on item 1 from 1st menu (no path / no last state provided)', () => {
                service.focusItem(undefined, 1);
                expect(menu1.instance.focusItem).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('"navigateFrom()" method', () => {
        it('should NOT update all menus when new navigation is the same as the previous one', () => {
            service.navigateFrom('pointer');
            spyOn(service, 'updateAllMenus');

            service.navigateFrom('pointer');
            expect(service.updateAllMenus).not.toHaveBeenCalled();
        });

        it('should update all menus when new navigation is different than previous one', () => {
            service.navigateFrom('kb');
            spyOn(service, 'updateAllMenus');

            service.navigateFrom('pointer');
            expect(service.updateAllMenus).toHaveBeenCalled();
        });

        it('should update "navFromKeyboard" value to "true" when "kb" is provided', () => {
            expect(service.navFromKeyboard).toBeFalse();

            service.navigateFrom('kb');
            expect(service.navFromKeyboard).toBeTrue();
        });

        it('should update "navFromKeyboard" value to "false" when "pointer" is provided', () => {
            service.navigateFrom('kb');
            expect(service.navFromKeyboard).toBeTrue();

            service.navigateFrom('pointer');
            expect(service.navFromKeyboard).toBeFalse();
        });

        it('should reset "currentItemIdxFromPointer" to "-1" when navigating from keyboard', () => {
            service.currentItemIdxFromPointer = 5;
            service.navigateFrom('kb');
            expect(service.currentItemIdxFromPointer).toEqual(-1);
        });
    });

    describe('Destroying the menu', () => {
        let menu1: ComponentRef<MenuComponent>;
        let menu2: ComponentRef<MenuComponent>;
        let menu3: ComponentRef<MenuComponent>;

        beforeEach(() => {
            menu1 = mockMenu();
            menu2 = mockMenu();
            menu3 = mockMenu();

            service.menuList.push(menu1, menu2, menu3);
        });

        describe('"destroyMenu()" method', () => {
            it('should destroy all the menus when no config povided', () => {
                service.destroyMenu();
                expect(service.menuList.length).toBe(0);
            });

            it('should notify the reason as "escape" when no specified', () => {
                spyOn(service.rootMenuDestroyed$, 'next');

                service.destroyMenu();
                expect(service.rootMenuDestroyed$.next).toHaveBeenCalledWith('escape');
            });

            it('should notify the reason as "host-destroyed" when specified', () => {
                spyOn(service.rootMenuDestroyed$, 'next');

                service.destroyMenu({ closeReason: 'host-destroyed' });
                expect(service.rootMenuDestroyed$.next).toHaveBeenCalledWith('host-destroyed');
            });

            it('should destroy last two menus and NOT notify', () => {
                spyOn(service.rootMenuDestroyed$, 'next');

                service.destroyMenu({ preserveFromLevel: 0 });
                expect(service.menuList.length).toBe(1);
                expect(service.rootMenuDestroyed$.next).not.toHaveBeenCalled();
            });

            it('should stop (safety Math.max() calculation) when sending preserve value lower than -1', () => {
                spyOn(service.menuList, 'pop').and.callThrough();
                service.destroyMenu({ preserveFromLevel: -5 });
                expect(service.menuList.pop).toHaveBeenCalledTimes(3); // one per menu created
            });
        });

        describe('"destroyLastMenu()" method', () => {
            it('should destroy only the last menu', () => {
                expect(service.menuList.length).toBe(3);

                spyOn(service, 'destroyMenu').and.callThrough();
                service.destroyLastMenu();
                expect(service.destroyMenu).toHaveBeenCalledWith({ preserveFromLevel: 1 });
                expect(service.menuList.length).toBe(2);
            });
        });

        describe('Listeners', () => {
            const initMenu = (config?: Partial<MenuMainConfig>): void =>
                service.initRootMenuData(new DOMRect(1, 1), [], 'test-menu-listeners', config);

            describe('"On Scroll Outside" Listener (Desktop only)', () => {
                let mobileService: MobileService;

                beforeEach(() => (mobileService = TestBed.inject(MobileService)));

                it('should NOT add nor remove the listener when device IS mobile', () => {
                    spyOnProperty(mobileService, 'isMobile').and.returnValue(true);
                    spyOn(document, 'addEventListener');
                    spyOn(document, 'removeEventListener');

                    initMenu();
                    expect(document.addEventListener).not.toHaveBeenCalledWith('scroll', service['onDocumentScroll'], {
                        passive: false,
                        capture: true,
                    });

                    service.destroyMenu();
                    expect(document.removeEventListener).not.toHaveBeenCalledWith(
                        'scroll',
                        service['onDocumentScroll'],
                        { capture: true }
                    );
                });
            });

            describe('Creation', () => {
                describe('Mobile', () => {
                    let mobileService: MobileService;

                    beforeEach(() => {
                        mobileService = TestBed.inject(MobileService);
                        // We force the "isMobile" to return "true"
                        spyOnProperty(mobileService, 'isMobile').and.returnValue(true);
                        // We call the method that invoke startListeners()
                        initMenu();
                    });

                    it(`should destroy all menus (one by one) when browser's back button activated (mobile only)`, () => {
                        const myWindow = TestBed.inject(WINDOW);
                        if (!myWindow) {
                            expect(true).toBeTrue();
                            return;
                        }

                        // We push a new state for each menu created (3)
                        mobileService.pushMobileState();
                        mobileService.pushMobileState();
                        mobileService.pushMobileState();

                        spyOn(service, 'navigateFrom');
                        spyOn(service, 'destroyMenu');
                        spyOn(service.executeKeyNavNavigation$, 'next');

                        // We fire the first "back"
                        myWindow.dispatchEvent(new PopStateEvent('popstate'));
                        expect(service.navigateFrom).toHaveBeenCalledWith('pointer');
                        expect(service.executeKeyNavNavigation$.next).toHaveBeenCalledTimes(1);
                        expect(service.executeKeyNavNavigation$.next).toHaveBeenCalledWith('Escape');
                        service.menuList.pop(); // We "emulate" the removal of the 3rd menu
                        expect(service.destroyMenu).not.toHaveBeenCalled();

                        // We fire the second "back"
                        myWindow.dispatchEvent(new PopStateEvent('popstate'));
                        expect(service.executeKeyNavNavigation$.next).toHaveBeenCalledTimes(2);
                        service.menuList.pop(); // We "emulate" the removal of the 2nd menu
                        expect(service.destroyMenu).not.toHaveBeenCalled();

                        // We fire the third and last "back"
                        myWindow.dispatchEvent(new PopStateEvent('popstate'));
                        expect(service.executeKeyNavNavigation$.next).toHaveBeenCalledTimes(2);
                        service.menuList.pop(); // We "emulate" the removal of the 1st menu
                        expect(service.destroyMenu).toHaveBeenCalledWith({ closeReason: 'mobile-back' });
                    });

                    it('should destroy all menus when mobile state changes', () => {
                        spyOn(service, 'destroyMenu');

                        mobileService.mobileStateChanged$.next();
                        expect(service.destroyMenu).toHaveBeenCalledWith({ closeReason: 'click-outside' });
                    });
                });

                describe('On Window Blur', () => {
                    it('should destroy all menus when "closeOnWindowBlur" is set to "true" (default)', () => {
                        initMenu();
                        spyOn(service, 'destroyMenu');

                        window.dispatchEvent(new Event('blur'));
                        expect(service.destroyMenu).toHaveBeenCalledWith({ closeReason: 'click-outside' });
                    });

                    it('should NOT destroy all menus when "closeOnWindowBlur" is set to "false"', () => {
                        initMenu({ closeOnWindowBlur: false });
                        spyOn(service, 'destroyMenu');

                        window.dispatchEvent(new Event('blur'));
                        expect(service.destroyMenu).not.toHaveBeenCalled();
                    });
                });

                describe('On Click Outside', () => {
                    it('should destroy all menus when "closeOnClickOutside" is set to "true" (default)', () => {
                        initMenu();
                        spyOn(service, 'destroyMenu');

                        document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
                        expect(service.destroyMenu).toHaveBeenCalledWith({ closeReason: 'click-outside' });
                    });

                    it('should NOT destroy all menus when "closeOnClickOutside" is set to "false"', () => {
                        initMenu({ closeOnClickOutside: false });
                        spyOn(service, 'destroyMenu');

                        document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
                        expect(service.destroyMenu).not.toHaveBeenCalled();
                    });
                });

                describe('On Scroll Outside', () => {
                    it('should destroy all menus when "closeOnScrollOutside" is set to "true" (default)', () => {
                        initMenu();
                        spyOn(service, 'destroyMenu');

                        document.dispatchEvent(new Event('scroll'));
                        expect(service.destroyMenu).toHaveBeenCalledWith({ closeReason: 'wheel-outside' });
                    });

                    it('should NOT destroy all menus when "closeOnScrollOutside" is set to "false"', () => {
                        initMenu({ closeOnScrollOutside: false });
                        spyOn(service, 'destroyMenu');

                        document.dispatchEvent(new Event('scroll'));
                        expect(service.destroyMenu).not.toHaveBeenCalled();
                    });
                });
            });

            describe('Destruction', () => {
                describe('On Window Blur', () => {
                    const initOnWindowBlur = (config?: Partial<MenuMainConfig>): void => {
                        initMenu(config);
                        spyOn(window, 'removeEventListener');

                        window.dispatchEvent(new Event('blur'));
                        service.destroyMenu();
                    };

                    it('should remove listener when "closeOnWindowBlur" is set to "true" (default)', () => {
                        initOnWindowBlur();
                        expect(window.removeEventListener).toHaveBeenCalledWith('blur', service['onWindowBlur']);
                    });

                    it('should NOT remove listener when "closeOnWindowBlur" is set to "false"', () => {
                        initOnWindowBlur({ closeOnWindowBlur: false });
                        expect(window.removeEventListener).not.toHaveBeenCalledWith('blur', service['onWindowBlur']);
                    });
                });

                describe('On Click Outside', () => {
                    const initOnClickOutside = (config?: Partial<MenuMainConfig>): void => {
                        initMenu(config);
                        spyOn(document, 'removeEventListener');

                        document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' }));
                        service.destroyMenu();
                    };

                    it('should remove listener when "closeOnClickOutside" is set to "true" (default)', () => {
                        initOnClickOutside();
                        expect(document.removeEventListener).toHaveBeenCalledWith(
                            'pointerdown',
                            service['onDocumentMouseDown']
                        );
                    });

                    it('should NOT remove listener when "closeOnClickOutside" is set to "false"', () => {
                        initOnClickOutside({ closeOnClickOutside: false });
                        expect(document.removeEventListener).not.toHaveBeenCalledWith(
                            'pointerdown',
                            service['onDocumentMouseDown']
                        );
                    });
                });

                describe('On Scroll Outside', () => {
                    const initOnScrollOutside = (config?: Partial<MenuMainConfig>): void => {
                        initMenu(config);
                        spyOn(document, 'removeEventListener');

                        document.dispatchEvent(new Event('scroll'));
                        service.destroyMenu();
                    };

                    it('should remove listener when "closeOnScrollOutside" is set to "true" (default)', () => {
                        initOnScrollOutside();
                        expect(document.removeEventListener).toHaveBeenCalledWith(
                            'scroll',
                            service['onDocumentScroll'],
                            { capture: true }
                        );
                    });

                    it('should NOT remove listener when "closeOnScrollOutside" is set to "false"', () => {
                        initOnScrollOutside({ closeOnScrollOutside: false });
                        expect(document.removeEventListener).not.toHaveBeenCalledWith(
                            'scroll',
                            service['onDocumentScroll'],
                            { capture: true }
                        );
                    });
                });
            });
        });
    });

    describe('Menu Change Detection on demand', () => {
        let menu1: ComponentRef<MenuComponent>;
        let menu2: ComponentRef<MenuComponent>;

        beforeEach(() => {
            menu1 = mockMenu();
            menu2 = mockMenu();

            service.menuList.push(menu1, menu2);
        });

        it('should update all menus', () => {
            service.updateAllMenus();

            expect(menu1.instance.detectChanges).toHaveBeenCalled();
            expect(menu2.instance.detectChanges).toHaveBeenCalled();
        });

        it('should update only the last menu', () => {
            service.updateLastMenu();

            expect(menu1.instance.detectChanges).not.toHaveBeenCalled();
            expect(menu2.instance.detectChanges).toHaveBeenCalled();
        });
    });

    it(`should return the item's id from a given path through the getItemId() method`, () => {
        expect(service.getItemId([4, 7, 0])).toEqual('a11y-menu-item-04-07-00');
    });
});
