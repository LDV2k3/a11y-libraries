import { Injectable, Inject, Optional, SkipSelf, ComponentRef, TemplateRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isObservable, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import type { KeyboardNavigationEvent, KeyboardNavigationKey } from '@a11y-ngx/keyboard-navigation';
import type { IconDefaultComponent } from '@a11y-ngx/icon';

import { WINDOW } from './menu.module.providers.private';

import { MenuRootService } from './menu.service.root';
import { MenuPrivateService } from './menu.service.private';
import { MobileService } from './mobile/mobile.service';
import { LiveAnnouncerService } from './announcer/announcer.service';

import { ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND, ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './menu.errors';

import type { MenuComponent } from './components/menu.component';
import type { MenuItemComponent } from './components/menu-item.component';

import {
    MENU_CONFIG_DEFAULTS as DEFAULTS,
    MENU_MOBILE_LABELS as MOBILE_LABELS,
    MENU_SELECTOR,
} from './menu.type.private';
import type {
    MenuMainConfig,
    MenuNavigatedFrom,
    MenuDestroyConfig,
    MenuAnimateInOut,
    MenuGroupTypeCommon,
    MenuGroupTypeSelectable,
    MenuItemTypes,
    MenuContextForItem,
    MenuItemUpdate,
    MenuItemUpdateOmitProperties,
    MenuGroupSelectables,
    MenuMobileLabels,
} from './menu.type.private';
import type {
    Menu,
    MenuItem,
    MenuItemInfo,
    MenuItemAction,
    MenuItemSubmenu,
    MenuItemSelectable,
    MenuItemSeparator,
    MenuItemSelected,
    MenuGroup,
    MenuConfig,
    MenuContext,
    MenuItemContext,
    MenuCloseReason,
} from './menu.type';

@Injectable({ providedIn: 'root' })
export class MenuService {
    /** @description The root menu component instance. */
    get rootMenu(): MenuComponent | undefined {
        return this.menuList[0]?.instance;
    }

    /** @description The last menu component instance. */
    get lastMenu(): MenuComponent | undefined {
        return this.menuList[this.menuList.length - 1]?.instance;
    }

    /** @description The latest menu navigation state. */
    get lastNavigationState(): KeyboardNavigationEvent<MenuItem> | undefined {
        return this.menuNavigationState;
    }

    /** @description The current item ID. */
    get currentItemID(): string | null {
        return this.menuCurrentItemID;
    }

    /** @description The global menu config. @note All the defaults and user's config when `A11yMenuModule.rootConfig()` used. */
    get globalConfig(): Partial<MenuMainConfig> {
        return this.rootService.globalConfig;
    }

    /** @description The user's custom config for the entire custom feature (aka a custom type of menu). @note When `A11yMenuModule.customConfig()` used. */
    get featureConfig(): Partial<MenuMainConfig> {
        return this.menuFeatureConfig ?? {};
    }

    /** @description The user's custom config for the instance. @note When `MenuService.initRootMenuData()` used. */
    get instanceConfig(): Partial<MenuMainConfig> {
        return this.menuInstanceConfig ?? {};
    }

    /** @description The merged config (global => feature => instance). */
    get config(): MenuMainConfig {
        return { ...this.globalConfig, ...this.featureConfig, ...this.instanceConfig } as MenuMainConfig;
    }

    /** @description The original menu data items. */
    get menuItems(): Menu {
        return this.menuOriginalItems;
    }

    /** @description The feature selector (to handle the feature's configuration). */
    get featureSelector(): string | undefined {
        return this.menuFeatureSelector;
    }

    /** @description If the navigation is from keyboard (`true`) or pointer/mouse (`false`). */
    get navFromKeyboard(): boolean {
        return this.menuNavFromKeyboard;
    }

    /** @description The plain nested array of items for the KeyNav Service. */
    get keyNavMenuItems(): MenuItem[] {
        return this.menuKeyNavMenuItems;
    }

    /** @description The merged class names for the component (global => feature => instance). */
    get classNames(): string[] {
        return this.menuClassNames;
    }

    /** @description Text labels used for the "back" and "close" mobile layout buttons. */
    get mobileLabels(): MenuMobileLabels {
        return this.menuMobileLabels;
    }

    /** @description The template, component or 'image' to use as default entry for all icons. */
    get iconDefault(): TemplateRef<unknown> | IconDefaultComponent | 'image' | undefined {
        return this.menuIconDefault;
    }

    /**
     * @description
     * The menu context to:
     * - Make screen reader announcements.
     * - Retrieve items (action, selectable, info or submenu).
     * - Close the menu.
     */
    get menuContext(): MenuContext | undefined {
        return this.featureSelector
            ? {
                  announce: (message: string) => this.announcerService.announce(message),
                  closeMenu: () => this.destroyMenu({ closeReason: 'programmatically' }),
                  getItemAction: (value: string) => this.getItemContext<MenuItemAction>(value, 'action'),
                  getItemInfo: (value: string) => this.getItemContext<MenuItemInfo>(value, 'info'),
                  getItemSelectable: (value: string) => this.getItemContext<MenuItemSelectable>(value, 'selectable'),
                  getItemSubmenu: (value: string) => this.getItemContext<MenuItemSubmenu>(value, 'submenu'),
              }
            : undefined;
    }

    /** @description The current item index from pointer event (for navigation purposes only). */
    currentItemIdxFromPointer: number = -1;

    /** @description The animation entry and exit config. */
    readonly animateData: MenuAnimateInOut = { in: 'none', out: 'none' };

    /** @description The array list of open menu components. */
    readonly menuList: ComponentRef<MenuComponent>[] = [];

    /** @description The array list of open menu IDs. */
    readonly menuListIDs: string[] = [];

    /** @description The map of items that have `value`, to be retrieved for context. */
    readonly menuItemsMap: Map<string, MenuItem | MenuItemInfo | MenuItemSelectable> = new Map();

    /** @description To _announce_ the selected item. */
    readonly menuItemSelected$: Subject<MenuItemSelected> = new Subject<MenuItemSelected>();

    /** @description To _announce_ the updated item. */
    readonly menuItemUpdated$: Subject<MenuItemUpdate> = new Subject<MenuItemUpdate>();

    /** @description To _announce_ that an item's disabled state has changed (to update the KeyNav items when `allowNavigateDisabled` is set to `true`). */
    readonly menuItemDisabledStateUpdated$: Subject<void> = new Subject<void>();

    /** @description To _announce_ when the navigation state gets updated. */
    readonly navigationState$: Subject<KeyboardNavigationEvent | null> = new Subject<KeyboardNavigationEvent | null>();

    /** @description To _announce_ when the root menu gets destroyed. */
    readonly rootMenuDestroyed$: Subject<MenuCloseReason> = new Subject<MenuCloseReason>();

    /** @description A proxy to execute a keyboard action when using the pointer. */
    readonly executeKeyNavNavigation$: Subject<KeyboardNavigationKey> = new Subject<KeyboardNavigationKey>();

    /** @description Last instance of the checked/unchecked item to avoid extra emissions (for group item). */
    private menuLastItemSelected: MenuItem | MenuItemSelectable | undefined = undefined;

    /** @description The time to destroy each menu (to wait for fade/animation). */
    private menuDestroyMs: number = 0;

    /** @description To handle change detection on every open menu (or prevent it, if state changes too quickly). */
    private updateMenusTimeout!: ReturnType<typeof setTimeout>;

    /** @description The menu's trigger element. */
    private menuTrigger: HTMLElement | DOMRect | undefined = undefined;

    private menuOriginalItems: Menu = [];
    private menuIconDefault: TemplateRef<unknown> | IconDefaultComponent | 'image' | undefined = undefined;

    private menuCurrentItemID: string | null = null;
    private menuNavigationState: KeyboardNavigationEvent<MenuItem> | undefined = undefined;
    private menuFeatureSelector: string | undefined = undefined;
    private menuNavFromKeyboard: boolean = false;
    private menuKeyNavMenuItems: MenuItem[] = [];

    private menuClassNames: string[] = [];
    private menuMobileLabels: MenuMobileLabels = { ...MOBILE_LABELS };

    private menuFeatureConfig: Partial<MenuMainConfig> | undefined = undefined;
    private menuInstanceConfig: Partial<MenuMainConfig> | undefined = undefined;

    constructor(
        private rootService: MenuRootService,
        private privateService: MenuPrivateService,
        private mobileService: MobileService,
        private announcerService: LiveAnnouncerService,

        @Inject(DOCUMENT) private document: Document,
        @Inject(WINDOW) private window: Window,
        @Optional() @SkipSelf() private parentService: MenuService | null
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('MenuService'));
    }

    /**
     * @description
     * To parse the class names into an array of strings.
     */
    classNameToArray(classNames: string | string[] | undefined): string[] {
        return this.rootService.classNameToArray(classNames);
    }

    /**
     * @description
     * Removes any undefined property from the given config object.
     */
    cleanConfigUndefined<T extends Record<string, unknown>>(config: T): T {
        return this.rootService.cleanConfigUndefined<T>(config);
    }

    /**
     * @description
     * Updates the feature level config (aka a custom type of menu).
     */
    updateConfig(selector: string, config: MenuConfig): void {
        this.rootService.updateConfig(selector, config);
    }

    /**
     * @description
     * Gets the feature's custom configuration.
     *
     * @note
     * If you need the entire merged config, use the `config` getter instead.
     */
    getConfig(selector: string): MenuConfig {
        return this.rootService.getFeatureConfig(selector);
    }

    /**
     * @description
     * Initializes everything for the root menu:
     *
     * - Items
     * - Keyboard navigation
     * - Instance config
     * - Class names
     * - Listeners
     * - Etc...
     *
     * @internal
     * **DO NOT USE DIRECTLY.** This is called automatically by the `MenuDirectorService`.
     */
    initRootMenuData(
        trigger: HTMLElement | DOMRect,
        items: Menu,
        selector: string,
        instanceConfig?: Partial<MenuMainConfig>,
        iconTemplate?: TemplateRef<unknown>
    ): void {
        this.menuTrigger = trigger;
        this.menuOriginalItems = items;
        this.initKeyNavItems();

        this.useSelector(selector);

        this.menuInstanceConfig = this.cleanConfigUndefined(instanceConfig ?? {});

        this.menuMobileLabels = {
            ...MOBILE_LABELS,
            ...this.globalConfig.mobileLabels,
            ...this.featureConfig.mobileLabels,
            ...this.instanceConfig.mobileLabels,
        };

        this.menuClassNames = [
            ...this.classNameToArray(this.globalConfig.className),
            ...this.classNameToArray(this.featureConfig.className),
            ...this.classNameToArray(this.instanceConfig.className),
        ];

        const { animateMs, iconDefaultStrategy } = this.config;

        this.menuDestroyMs = Math.max(animateMs, 0);
        this.menuIconDefault = iconTemplate ?? iconDefaultStrategy;

        // Initializes the mobile state (to close the menus using the device's "back" button, block the body, etc.)
        this.mobileService.initMobileState('menu', 'a11y-live-announcer, a11y-menu-container');

        this.initAnimateData();
        this.startListeners();
    }

    /**
     * @description
     * Resets everything and announces that the root menu has been destroyed.
     */
    private destroyRootMenu(closeReason: MenuCloseReason): void {
        this.killListeners();
        this.useSelector(undefined);
        this.menuItemsMap.clear();
        this.menuTrigger = undefined;
        this.menuOriginalItems = [];
        this.menuKeyNavMenuItems = [];
        this.menuClassNames = [];
        this.menuMobileLabels = { ...MOBILE_LABELS };
        this.menuCurrentItemID = null;
        this.menuInstanceConfig = undefined;
        this.menuLastItemSelected = undefined;
        this.menuNavigationState = undefined;
        this.menuFeatureSelector = undefined;
        this.menuIconDefault = undefined;
        this.menuDestroyMs = 0;

        // Stops the mobile state (unblocks the body)
        this.mobileService.destroyMobileState('menu');
        this.privateService.resetMenuComputedStyles();

        this.rootMenuDestroyed$.next(closeReason);
    }

    /**
     * @description
     * Filters the menu items into a list of items that the KeyNav engine can navigate (all except info/separators).
     *
     * If required, announces that the KeyNav Service should also update the items.
     */
    initKeyNavItems(updateKeyNavService: boolean = false): void {
        this.menuKeyNavMenuItems = this.unwrapMenuStructure(this.menuItems);
        if (updateKeyNavService) this.menuItemDisabledStateUpdated$.next();
    }

    /**
     * @description
     * Sets the selector and the feature config from that selector.
     */
    private useSelector(selector: string | undefined) {
        this.menuFeatureSelector = selector;
        this.menuFeatureConfig = this.cleanConfigUndefined(selector ? this.getConfig(selector) : {});
    }

    /**
     * @description
     * Process the array of menu items into a clean version of _just items_ (without groups/separators/info)
     * to be provided to the KeyNav Service.
     */
    private unwrapMenuStructure(menu: Menu): MenuItem[] {
        const keyNavMenuItems: MenuItem[] = [];

        const isGroup = (node: MenuItem | MenuGroup): node is MenuGroup => (node as MenuGroup).items !== undefined;

        const isSeparator = (
            node: MenuItem | MenuItemSelectable | MenuGroup | MenuItemInfo | MenuItemSeparator
        ): node is MenuItemSeparator => (node as MenuItemSeparator).separator !== undefined;

        const isInfo = (
            node: MenuItem | MenuItemSelectable | MenuGroup | MenuItemInfo | MenuItemSeparator
        ): node is MenuItemInfo => (node as MenuItemInfo).info !== undefined;

        const processItem = (theItem: MenuItem | MenuItemSelectable | MenuItemInfo | MenuItemSeparator) => {
            if (isSeparator(theItem) || isInfo(theItem)) return;

            const item: MenuItem = { ...theItem } as MenuItem;
            if (item.submenu && item.submenu.length) item.submenu = this.unwrapMenuStructure(item.submenu);
            keyNavMenuItems.push(item);
        };

        // We save the item that has a unique value within the map for context access by the dev
        const addToMap = (
            node: MenuItem | MenuItemSelectable | MenuItemInfo | MenuItemSeparator,
            grpType?: MenuGroupTypeCommon | MenuGroupTypeSelectable
        ): void => {
            if ('separator' in node || !node.value) return;

            let type: MenuItemTypes;
            if (grpType && ['checkbox', 'radio'].includes(grpType)) type = 'selectable';
            else if ('submenu' in node) type = 'submenu';
            else if ('info' in node) type = 'info';
            else type = 'action';

            this.menuItemsMap.set(`${node.value}[${type}]`, node);
        };

        menu.forEach((node: MenuItem | MenuGroup | MenuItemInfo | MenuItemSeparator) => {
            if (isSeparator(node)) return;
            else if (isInfo(node)) addToMap(node);
            else if (isGroup(node))
                node.items.forEach((groupItem) => {
                    processItem(groupItem);
                    addToMap(groupItem, node.type ?? DEFAULTS.groupType);
                });
            else {
                processItem(node);
                addToMap(node);
            }
        });

        return keyNavMenuItems;
    }

    /**
     * @description
     * Updates:
     *
     * - The menu state with the current navigation.
     * - The current item ID.
     */
    updateMenuState(navigationState: KeyboardNavigationEvent<MenuItem>): void {
        clearTimeout(this.updateMenusTimeout);

        this.menuNavigationState = navigationState;
        this.navigationState$.next(navigationState);

        const { pathTo: currentPath, indexTo: currentIndex } = navigationState;

        const pathID: number[] = [...currentPath];

        // Index = -1 means that menu state is alive, but no item is selected
        // If index is valid, push it to the path
        if (currentIndex !== -1) pathID.push(currentIndex);

        // If there is a path, assign the current item ID...
        if (pathID.length) this.menuCurrentItemID = this.getItemId(pathID);
        // ... or null, otherwise
        else this.menuCurrentItemID = null;

        if (this.menuNavFromKeyboard) return;

        // Change detection on every menu to keep the visual path alive (only for pointer events)
        this.updateMenusTimeout = setTimeout(() => this.updateAllMenus(), 30);
    }

    /**
     * @description
     * Fires change detection on every open menu.
     */
    updateAllMenus(): void {
        this.menuList.forEach(({ instance: menu }) => menu.detectChanges());
    }

    /**
     * @description
     * Fires change detection on the last (current) open menu.
     */
    updateLastMenu(): void {
        this.lastMenu?.detectChanges();
    }

    /**
     * @description
     * Gets a menu component instance by its index.
     */
    getMenu(idx: number): MenuComponent | undefined {
        return this.menuList[idx]?.instance;
    }

    /**
     * @description
     * Gets the menu item ID from the given path: `[1, 4, 0]` => `a11y-menu-item-01-04-00`.
     */
    getItemId(numericPath: number[]): string {
        const id: string = numericPath.map((n) => String(n).padStart(2, '0')).join('-');
        return `a11y-menu-item-${id}`;
    }

    /**
     * @description
     * Retrieves an item from its given `value` property.
     */
    private getItemContext<T extends Partial<MenuItemAction | MenuItemSubmenu | MenuItemSelectable | MenuItemInfo>>(
        value: string,
        type: MenuItemTypes
    ): MenuContextForItem<T> | undefined {
        const item: T = this.menuItemsMap.get(`${value}[${type}]`) as T;
        if (!item) {
            console.error(ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND(value));
            return;
        }

        const update = (data: Omit<Partial<T>, MenuItemUpdateOmitProperties>): T => {
            this.menuItemUpdated$.next({ value, type, data });
            return item;
        };

        return { item, update };
    }

    /**
     * @description
     * When _action_ item:
     * - Emits the selected item (unless a custom method was configured using the `action` property).
     * - Destroys the menu (unless item or group specifies otherwise by using `closeOnSelect=false`).
     *
     * When _selectable_ item (checkbox or radio):
     * - Emits the selected item & group with updated state (unless a custom method was configured using the `beforeChange` property).
     * - Keeps the menu open (unless item or group specifies otherwise by using `closeOnSelect=true`).
     */
    async selectMenuItem(): Promise<void> {
        const { indexTo } = this.lastNavigationState as KeyboardNavigationEvent;

        const menuContext: MenuContext = this.menuContext as MenuContext;

        const lastMenu: MenuComponent = this.lastMenu as MenuComponent;
        const menuItem: MenuItemComponent = lastMenu.menuItemComponents.get(indexTo) as MenuItemComponent;
        const group: MenuGroup | undefined = menuItem.groupComp?.group;

        const closeTheMenu = (): void => {
            const closeReason: MenuCloseReason = this.menuNavFromKeyboard
                ? 'item-selected-keyboard'
                : 'item-selected-click';
            this.destroyMenu({ closeReason });
        };

        const processCheckedState = (group: MenuGroupSelectables): void => {
            const { type, items: groupItems } = group;
            const { value: origValue, label: origLabel } = menuItem.item;

            // Compares the original and given items
            const matchItem = (item: MenuItemSelectable): boolean =>
                item.label === origLabel && item.value === origValue;

            // Process every item
            groupItems.forEach((groupItem) => {
                // If type "radio", the one selected will have the "checked" set on true, the rest will be restored to false
                if (type === 'radio') groupItem.checked = matchItem(groupItem);
                // If type "checkbox", switch the selected item's "checked" state
                else {
                    const checked: boolean = matchItem(groupItem) ? !groupItem.checked : !!groupItem.checked;
                    groupItem.checked = checked;
                }
            });
        };

        const groupType: 'radio' | 'checkbox' | 'common' = group?.type ?? DEFAULTS.groupType;
        // If it is a group and is not 'common' items (but 'checkbox' or 'radio')
        if (group && groupType !== 'common') {
            const item: MenuItemSelectable = menuItem.item as MenuItemSelectable;
            const selectableGroup: MenuGroupSelectables = group as MenuGroupSelectables;
            const beforeChange = item.beforeChange ?? selectableGroup.beforeChange;

            // If item or group has custom "before change", execute it
            if (beforeChange) {
                const itemCtx: MenuItemContext = menuItem.itemContext;
                itemCtx.setBusy(true);

                try {
                    const newState: boolean = groupType === 'radio' ? true : !(item.checked ?? false);
                    const result: void | boolean | Promise<boolean> | Observable<boolean> = beforeChange(
                        itemCtx,
                        menuContext,
                        newState
                    );

                    let canChange: boolean;

                    if (typeof result === 'boolean') {
                        canChange = result;
                    } else if (isObservable(result)) {
                        canChange = (await (result as Observable<boolean>).toPromise()) ?? true;
                    } else if (result instanceof Promise) {
                        canChange = (await result) ?? true;
                    } else {
                        // void
                        canChange = true;
                    }

                    if (canChange) processCheckedState(selectableGroup);
                } catch (error) {
                    console.warn(error);
                } finally {
                    itemCtx.setBusy(false);
                }
            }
            // Apply the corresponding "checked" state to the radio/checkbox item
            else {
                processCheckedState(selectableGroup);

                const {
                    value: lastValue,
                    label: lastLabel,
                    checked: lastChecked,
                } = (this.menuLastItemSelected ?? {}) as MenuItemSelectable;

                // Do NOT emit if same item was selected
                if (item.value === lastValue && item.label === lastLabel && item.checked === lastChecked) return;

                // Save and emit selected item
                this.menuLastItemSelected = { ...item };
                this.menuItemSelected$.next({ item, group: group as MenuGroupSelectables });
            }

            // Close the menu if applies (default "false" for selectable items)
            const closeOnSelect: boolean | undefined = item.closeOnSelect ?? group.closeOnSelect ?? false;
            if (closeOnSelect) closeTheMenu();

            return;
        }

        // When it's an action item...
        const item: MenuItemAction = menuItem.item as MenuItemAction;

        // If item has custom "action", execute it
        if (item.action) item.action(menuItem.itemContext, menuContext);
        // Save and emit selected item
        else {
            this.menuLastItemSelected = { ...item };
            this.menuItemSelected$.next({ item });
        }

        // Close the menu if applies (default "true" for action items)
        const closeOnSelect: boolean | undefined = item.closeOnSelect ?? group?.closeOnSelect ?? true;
        if (closeOnSelect) closeTheMenu();
    }

    /**
     * @description
     * Sets focus on the item from the given path + index.
     *
     * If no data is provided, it will use last state's path + index.
     */
    focusItem(pathTo?: number[], indexTo?: number): void {
        const { indexTo: lastIndexTo, pathTo: lastPathTo } = this.lastNavigationState ?? {};

        if (indexTo === undefined) indexTo = lastIndexTo ?? -1;
        if (indexTo === -1) return;

        if (pathTo === undefined) pathTo = lastPathTo ?? [];

        this.menuList[pathTo.length]?.instance.focusItem(indexTo);
    }

    /**
     * @description
     * Specifies where the user is navigating from (keyboard or pointer/mouse).
     */
    navigateFrom(navFrom: MenuNavigatedFrom): void {
        const navFromKeyboard: boolean = navFrom === 'kb';

        // If type of navigation does NOT change, break
        //if (this.navFromKeyboard === navFromKeyboard) return;

        // If type of navigation changes, update all menus in order to update the proper styles
        if (this.menuNavFromKeyboard !== navFromKeyboard) this.updateAllMenus();

        // Update value
        this.menuNavFromKeyboard = navFromKeyboard;

        // If navigating from keyboard, then reset current index for pointer
        if (navFromKeyboard) this.currentItemIdxFromPointer = -1;
    }

    /**
     * @description
     * Destroys the last open menu.
     */
    destroyLastMenu(): void {
        const preserveFromLevel: number = Math.max(-1, this.menuList.length - 2);
        this.destroyMenu({ preserveFromLevel });
    }

    /**
     * @description
     * Destroys every menu (from last to first) up to the specified level.
     *
     * `preserveFromLevel` means the index position NOT to touch, then all the rest.
     *
     * @example
     * { preserveFromLevel: 1 } // means that root menu (0) and first submenu (1) are going to be preserved.
     */
    destroyMenu(data?: MenuDestroyConfig): void {
        const { preserveFromLevel: preserveLevel = -1, closeReason = 'escape' } = data ?? {};
        // Not allowing values lower than -1
        const preserveFromLevel: number = Math.max(-1, preserveLevel);
        const menuDestroyMs: number = this.menuDestroyMs;

        while (this.menuList.length - 1 > preserveFromLevel) {
            // Removes last menu from array
            const closedMenu = this.menuList.pop() as ComponentRef<MenuComponent>;
            // Invoke to close it (for animation purposes)
            closedMenu.instance.closeMenu();
            // Destroy the component after animation ends
            setTimeout(() => closedMenu.destroy(), menuDestroyMs);
            // Removes last menu ID from array
            this.menuListIDs.pop();
        }

        // If all menus were destroyed, reset everything else.
        if (!this.menuList.length) this.destroyRootMenu(closeReason);
    }

    /**
     * @description
     * Establishes the animation's in and out data from the config.
     */
    private initAnimateData(): void {
        const { animate } = this.config;

        if (typeof animate === 'string') {
            this.animateData.in = animate;
            this.animateData.out = this.privateService.oppositeAnimation(animate);
        } else {
            this.animateData.in = animate.in;
            this.animateData.out = this.privateService.oppositeAnimation(animate.out);
        }
    }

    /**
     * @description
     * Starts the listeners when the root menu gets created.
     */
    private startListeners(): void {
        const { isMobile, mobileHistoryBack$, mobileStateChanged$ } = this.mobileService;
        const { closeOnWindowBlur, closeOnClickOutside, closeOnScrollOutside } = this.config;

        // We listen on the "back" press on mobile
        if (isMobile)
            mobileHistoryBack$.pipe(takeUntil(this.rootMenuDestroyed$)).subscribe(() => {
                this.navigateFrom('pointer');
                // To go back one level
                if (this.menuList.length > 1) this.executeKeyNavNavigation$.next('Escape');
                // To close the root menu with the reason
                else this.destroyMenu({ closeReason: 'mobile-back' });
            });

        // We always listen to mobile breakpoint state change to destroy the menu
        mobileStateChanged$
            .pipe(takeUntil(this.rootMenuDestroyed$))
            .subscribe(() => this.destroyMenu({ closeReason: 'click-outside' }));

        if (closeOnWindowBlur) this.window.addEventListener('blur', this.onWindowBlur);
        if (closeOnClickOutside) this.document.addEventListener('pointerdown', this.onDocumentMouseDown);

        if (isMobile) return;

        if (closeOnScrollOutside)
            this.document.addEventListener('scroll', this.onDocumentScroll, { passive: false, capture: true });
    }

    /**
     * @description
     * Kills the listeners when the root menu gets destroyed.
     */
    private killListeners(): void {
        const { closeOnWindowBlur, closeOnClickOutside, closeOnScrollOutside } = this.config;

        if (closeOnWindowBlur) this.window.removeEventListener('blur', this.onWindowBlur);
        if (closeOnClickOutside) this.document.removeEventListener('pointerdown', this.onDocumentMouseDown);

        if (this.mobileService.isMobile) return;

        if (closeOnScrollOutside) this.document.removeEventListener('scroll', this.onDocumentScroll, { capture: true });
    }

    /**
     * @description
     * Destroys the entire menu when user clicks outside the document/viewport.
     */
    private onWindowBlur = ((): void => this.destroyMenu({ closeReason: 'click-outside' })).bind(this);

    /**
     * @description
     * Destroys the entire menu when user uses the mouse wheel outside the menu.
     */
    private onDocumentScroll = ((event: Event): boolean | void =>
        !this.eventFromInsideMenu(event) && this.destroyMenu({ closeReason: 'wheel-outside' })).bind(this);

    /**
     * @description
     * Destroys the entire menu when user clicks on any other part of the document but the menu.
     */
    private onDocumentMouseDown = ((event: PointerEvent): boolean | void => {
        const eventFromTrigger: boolean =
            this.menuTrigger instanceof HTMLElement && this.menuTrigger.contains(event.target as Node);
        if (this.eventFromInsideMenu(event) || eventFromTrigger) return;

        const closeReason: MenuCloseReason = event.pointerType === 'mouse' ? 'click-outside' : 'touch-outside';
        this.destroyMenu({ closeReason });
    }).bind(this);

    /**
     * @description
     * Detects if the event comes from within the context menu.
     */
    private eventFromInsideMenu({ target }: Event): boolean {
        return target instanceof Element && target.closest(MENU_SELECTOR) !== null;
    }
}
