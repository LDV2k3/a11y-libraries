import {
    Component,
    Inject,
    OnInit,
    OnDestroy,
    ViewChild,
    ChangeDetectionStrategy,
    ViewContainerRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KeyboardNavigationService } from '@a11y-ngx/keyboard-navigation';
import type { KeyboardNavigationEvent, KeyboardNavigationKey } from '@a11y-ngx/keyboard-navigation';

import { MenuService } from './menu.service';
import { MobileService } from './mobile/mobile.service';
import { MenuDirectorPrivateService } from './menu.director.service.private';

import type { MenuItemComponent } from './components/menu-item.component';

import { MENU_KEY_NAV_CONFIG } from './menu.type.private';
import type { Menu, MenuItem } from './menu.type';

@Component({
    selector: 'a11y-menu-container',
    template: '<ng-container #menuContainer></ng-container>',
    styleUrls: ['./menu.container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KeyboardNavigationService],
    host: {
        role: 'region',
        '[attr.aria-modal]': 'mobileService.isMobile || null',
        '(keydown)': 'onKeyDown($event)',
    },
})
export class MenuContainerComponent implements OnInit, OnDestroy {
    @ViewChild('menuContainer', { read: ViewContainerRef, static: true }) readonly container!: ViewContainerRef;

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(
        private directorPrivate: MenuDirectorPrivateService,
        private service: MenuService,
        protected mobileService: MobileService,
        @Inject(KeyboardNavigationService) private keyNav: KeyboardNavigationService
    ) {}

    ngOnInit(): void {
        // Subscribes to when the root menu gets destroyed to destroy the container
        this.service.rootMenuDestroyed$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.directorPrivate.destroyContainer());

        // Subscribes to re-initialize the KeyNav items if an item got disabled/enabled
        this.service.menuItemDisabledStateUpdated$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.setKeyNavItems());

        // Subscribes to the KeyNav proxy to execute the requested key
        this.service.executeKeyNavNavigation$
            .pipe(takeUntil(this.destroy$))
            .subscribe((key: KeyboardNavigationKey) => this.executeNavigation(this.keyNav.executeKey(key)));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * @description
     * Initializes the KeyNav Service data and config.
     */
    initKeyNavData(): void {
        const { throttleMs, allowNavigateDisabled } = this.service.config;

        this.keyNav.setConfig({ ...MENU_KEY_NAV_CONFIG, throttleMs, allowNavigateDisabled });
        this.keyNav.setCurrent({ index: -1, path: [] });
        this.setKeyNavItems();
    }

    /**
     * @description
     * Establishes the KeyNav items.
     */
    private setKeyNavItems(): void {
        this.keyNav.setItems(this.service.keyNavMenuItems);
    }

    /**
     * @description
     * Handles keyboard keydown events.
     */
    protected onKeyDown(event: KeyboardEvent): void {
        const { repeat, code } = event;

        if (repeat) event.preventDefault();

        // If Alt or F10 keys, close the entire menu
        if (code.startsWith('Alt') || code === 'F10') {
            this.eventPrevent(event);
            this.service.destroyMenu({ closeReason: 'keyboard' });
            return;
        }

        // If Tab key...
        if (code === 'Tab') {
            // ...and it's allowed to close on Tab, destroy the menu
            if (this.service.config.closeOnTab) this.service.destroyMenu({ closeReason: 'keyboard' });

            this.eventPrevent(event);
            return;
        }

        // If Space or F1-F12 keys, don't do anything
        if (code === 'Space' || /^F\d+$/.test(code)) {
            this.eventPrevent(event);
            return;
        }

        // Sets navigation via keyboard
        this.service.navigateFrom('kb');
        // Allow to auto select first child when open submenus
        this.keyNav.setConfig({ allowSelectFirstChild: true });

        // Get the navigation from the KeyNav Service
        const navigateTo: KeyboardNavigationEvent<MenuItem> | null = this.keyNav.manageKeyDown(event);

        if (!navigateTo) {
            // To prevent bubbling for when the Service does not return repeated events
            // and these keys fire movement within the page
            if (code.startsWith('Arrow') || code === 'Home' || code === 'End') this.eventPrevent(event);

            return;
        }

        this.eventPrevent(event);
        this.executeNavigation(navigateTo);
    }

    /**
     * @description
     * It decides what to do based on the retrieved navigation event.
     */
    private executeNavigation(navigateTo: KeyboardNavigationEvent<MenuItem> | null): void {
        if (!navigateTo) return;

        this.service.updateMenuState(navigateTo);

        const { action, pathTo, indexTo } = navigateTo;

        const isMoveAction: boolean = ['previous', 'next', 'first', 'last'].includes(action);
        const isOpenAction: boolean = action === 'open';
        //const isCloseAction: boolean = action === 'close';

        if (isMoveAction) this.service.focusItem(pathTo, indexTo);
        else if (isOpenAction) this.validateOpenAction(navigateTo);
        else this.validateCloseAction(navigateTo);
    }

    /**
     * @description
     * Validates the "open"/"select" actions.
     *
     * It either selects the chosen item or opens the submenu if it contains children items.
     */
    private validateOpenAction(navigateTo: KeyboardNavigationEvent): void {
        const { navFromKeyboard, lastMenu: parentMenu, currentItemIdxFromPointer: indexFromPointer } = this.service;
        // If by any chance the last menu got destroyed, break
        if (!parentMenu) return;

        const { key, indexFrom: indexFromKeyboard, pathTo: path } = navigateTo;
        const {
            matchingData: { menuIdx: menuIndices },
            menuItems,
            menuItemComponents,
        } = parentMenu;

        // Index from the KeyNav
        const keyNavIndex: number = navFromKeyboard ? indexFromKeyboard : indexFromPointer;
        // Index for the actual menu item
        const menuItemIndex: number = menuIndices[keyNavIndex] ?? -1;
        // Data of the actual menu item
        const { submenu: items, label = '', disabled } = (menuItems[menuItemIndex] ?? {}) as MenuItem;

        // If navigating from keyboard...
        if (navFromKeyboard) {
            // ... and is "Enter" key:
            // usually when user hovers over an item, submenu opens (no item selected yet) and hits "Enter"
            if (key === 'Enter') {
                // If no current index selected, go "down" to position in first available item
                if (menuItemIndex === -1) {
                    this.executeNavigation(this.keyNav.executeKey('ArrowDown'));
                    return;
                }
                // If there are no children items...
                else if (!items) {
                    // ... and is not disabled, process and emit the selected item
                    if (!disabled) this.service.selectMenuItem();
                    return;
                }
            }
            // ... and is "ArrowRight" key:
            // If there are no children items, break
            else if (!items) return;
        }

        // At this point the item has submenu,
        // find the menu item to use it as the trigger
        const itemComponent: MenuItemComponent = Array.from(menuItemComponents)[keyNavIndex] as MenuItemComponent;
        const trigger: HTMLElement = itemComponent.nativeElement;

        // Open submenu
        this.directorPrivate.createMenu(trigger, { items: items as Menu, path, label });

        // Change detection on parent menu
        parentMenu.detectChanges();
    }

    /**
     * @description
     * Validates the "close" action to destroy the last active menu.
     */
    private validateCloseAction(navigateTo: KeyboardNavigationEvent): void {
        const { key, pathFrom, pathTo, indexTo } = navigateTo;
        const isEscapeKey: boolean = key === 'Escape';
        const actionFromRootMenu: boolean = !pathFrom.length && !pathTo.length;

        // If action comes from root menu and is not "Escape" key (aka, is "ArrowLeft"), don't do anything
        if (actionFromRootMenu && !isEscapeKey) return;

        // Close the last open menu
        this.service.destroyLastMenu();

        // Change detection on last menu
        this.service.updateLastMenu();

        // Set focus on parent item
        this.service.focusItem(pathTo, indexTo);
    }

    /**
     * @description
     * To stop propagation and prevent default.
     */
    private eventPrevent(event: KeyboardEvent): void {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}
