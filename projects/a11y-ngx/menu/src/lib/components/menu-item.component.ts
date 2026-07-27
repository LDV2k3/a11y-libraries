import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    Inject,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ComponentRef,
    ElementRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { KeyboardNavigationService } from '@a11y-ngx/keyboard-navigation';
import type { KeyboardNavigationEvent } from '@a11y-ngx/keyboard-navigation';

import type { MenuGroupStackComponent } from './menu-group-stack.component';
import { MenuGroupInlineComponent } from './menu-group-inline.component';

import { MenuService } from '../menu.service';
import { MenuPrivateService } from '../menu.service.private';
import { MobileService } from '../mobile/mobile.service';
import { LiveAnnouncerService } from '../announcer/announcer.service';

import type { MenuComponent } from './menu.component';
import type { MenuTooltipComponent } from './menu-tooltip.component';

import { MENU_CONFIG_DEFAULTS as DEFAULTS, MENU_DELAY_MS } from '../menu.type.private';
import type {
    MenuItemIcon,
    MenuItemShortcutConfig,
    MenuGroupSelectables,
    MenuNavigatedFrom,
    MenuGroupTypeSelectable,
} from '../menu.type.private';
import type {
    MenuPosition,
    MenuItemSelectable,
    MenuItem,
    MenuItemContext,
    MenuItemSubmenu,
    MenuItemAction,
} from '../menu.type';

@Component({
    selector: 'a11y-menu-item',
    template: `
        <span menu-item-select *ngIf="isSelectableGroup">
            <a11y-menu-item-check [type]="selectableCheckType"></a11y-menu-item-check>
        </span>
        <a11y-icon
            menu-item-icon
            *ngIf="showIcon"
            [icon]="itemIsBusy && iconDefaultLoader ? iconDefaultLoader : item.icon"></a11y-icon>
        <span *ngIf="isLabelNormal" menu-item-label>{{ item.label }}</span>
        <span menu-item-caret *ngIf="item.submenu?.length; else shortcutTemplate">&nbsp;</span>

        <ng-template #shortcutTemplate>
            <span menu-item-shortcut *ngIf="showShortcut" [innerHTML]="shortcut?.visual ?? '&nbsp'"></span>
        </ng-template>
    `,
    styleUrls: ['./menu-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'menu-item': '',
        tabindex: '-1',
        '[class.a11y-busy]': 'itemIsBusy || groupComp?.groupIsBusy || false',
        '[class]': 'itemClassNames',
        '[style]': 'itemStyles',
        '[attr.id]': 'id',
        '[attr.role]': 'menuItemRole',
        '[attr.aria-label]': 'item.label',
        '[attr.aria-hidden]': 'itemNotNavigable ? true : null',
        '[attr.aria-disabled]': 'item.disabled ? true : null',
        '[attr.aria-haspopup]': `item.submenu?.length ? 'menu' : null`,
        '[attr.aria-expanded]': 'item.submenu?.length ? expandedItem : null',
        '[attr.aria-checked]': 'isSelectableGroup ? checkedItem : null',
        '[attr.aria-keyshortcuts]': 'shortcut?.aria ?? null',
        '[attr.aria-busy]': 'itemIsBusy || groupComp?.groupIsBusy ? true : null',
        '[attr.item-busy]': `itemIsBusy ? '' : null`, // Just a flag so the dev knows the actual busy item
        '[attr.active-item]': 'activeItem',
        '[attr.mobile]': `isMobile ? '' : null`,
        '(keydown.space)': 'onItemClick($event)',
        '(keydown.enter)': 'onItemClick($event)',
        '(click)': 'onItemClick()',
        '(focus)': 'onItemFocus()',
        '(blur)': 'onItemBlur()',
        '(mouseenter)': 'onItemMouseEnter()',
        '(mouseleave)': 'onItemMouseLeave()',
    },
})
export class MenuItemComponent implements OnInit, OnDestroy {
    /** @description The item. */
    @Input() item!: MenuItem;
    /** @description The path of the parent menu. */
    @Input() path!: number[];
    /** @description The index of the KeyNav item within the menu. */
    @Input() idx!: number;
    /** @description The group component instance, if any. */
    @Input() groupComp: MenuGroupInlineComponent | MenuGroupStackComponent | undefined = undefined;

    /** @description Is a group of type "checkbox" or "radio". */
    isSelectableGroup: boolean = false;

    /** @description Whether the item is busy or not. */
    itemIsBusy: boolean = false;

    /** @description To show the icon element. @default true // most cases are being hidden through CSS */
    showIcon: boolean = true;
    /** @description To show the shortcut element. @default true // for 'stack' lists */
    showShortcut: boolean = true;

    /** @description Label is inside item. */
    isLabelNormal: boolean = true;
    /** @description Label is a tooltip. */
    private isLabelTooltip: boolean = false;
    /** @description Label is a floating panel. */
    private isLabelFloating: boolean = false;
    /** @description The floating panel position. */
    private isLabelFloatingPosition: MenuPosition = 'top';

    get iconDefaultLoader(): MenuItemIcon | undefined {
        return this.menuService.config.iconDefaultLoader;
    }

    get selectableCheckType(): MenuGroupTypeSelectable {
        return ((this.groupComp as MenuGroupStackComponent).group as MenuGroupSelectables).type;
    }

    /** @description The processed aria & visual shortcut data. */
    shortcut: MenuItemShortcutConfig | undefined = undefined;

    /** @description Defines if the item should be hidden to the Screen Reader. */
    protected get itemNotNavigable(): boolean {
        return !this.menuService.config.allowNavigateDisabled && this.item.disabled === true;
    }

    protected menuItemRole: string = 'menuitem';
    protected id!: string;

    /** @description The full item path: menu-path + item-index. */
    private itemPath!: number[];
    /** @description The full item path, dash separated. */
    private itemPathID!: string;
    protected itemClassNames: string[] = [];
    protected itemStyles: Partial<CSSStyleDeclaration> = {};

    private tooltip: ComponentRef<MenuTooltipComponent> | undefined = undefined;

    /** @description Returns whether the item is active or not. */
    protected get activeItem(): string | null {
        return this.menuService.currentItemID?.startsWith(this.id)
            ? this.menuService.navFromKeyboard
                ? 'kb'
                : ''
            : null;
    }

    /** @description Returns whether the item is expanded (for submenus) or not. */
    protected get expandedItem(): boolean {
        return this.menuService.menuListIDs[this.itemPath.length] === this.itemPathID;
    }

    /** @description Returns whether the item is checked (for selectable items) or not. */
    get checkedItem(): boolean {
        return (this.item as MenuItemSelectable).checked ?? false;
    }

    /** @description The menu item's HTML Element instance. */
    get nativeElement(): HTMLElement {
        return this.hostElement.nativeElement;
    }

    /** @description If is mobile device. */
    protected get isMobile(): boolean {
        return this.mobileService.isMobile;
    }

    /**
     * @description
     * The item's context to:
     * - Update the label.
     * - Update the icon.
     * - Update the disabled state.
     * - Update the busy state.
     */
    get itemContext(): MenuItemContext {
        const setLabel = (label: string): void => {
            this.item.label = label;
            this.detectChanges();
        };
        const setIcon = (icon: MenuItemIcon): void => {
            this.item.icon = icon;
            this.detectChanges();
        };
        const setBusy = (isBusy: boolean, message?: string): void => {
            this.itemIsBusy = isBusy;

            if (this.groupComp && this.isSelectableGroup) {
                const { type, busyScope = DEFAULTS.groupBusyScope } = this.groupComp.group as MenuGroupSelectables;
                if (type === 'radio' || busyScope === 'group') this.groupComp.groupIsBusy = isBusy;
            }

            this.detectChanges();
            if (message) setTimeout(() => this.announcerService.announce(message), 5);
        };
        const setDisabled = (isDisabled: boolean): void => {
            if ((this.item.disabled ?? false) === isDisabled) return;

            this.item.disabled = isDisabled;
            this.detectChanges();

            // If disabled items are not allowed to be navigated, update the KeyNav structure items
            if (!this.menuService.config.allowNavigateDisabled) this.menuService.initKeyNavItems(true);
        };
        const item = this.item;

        return { item, setLabel, setBusy, setDisabled, setIcon };
    }

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(
        private hostElement: ElementRef<HTMLElement>,
        private menuService: MenuService,
        private privateService: MenuPrivateService,
        private mobileService: MobileService,
        private announcerService: LiveAnnouncerService,
        private cdr: ChangeDetectorRef,
        @Inject(KeyboardNavigationService) private keyNav: KeyboardNavigationService
    ) {}

    ngOnInit(): void {
        this.itemPath = [...this.path, this.idx];
        this.itemPathID = this.itemPath.join('-');
        this.id = this.menuService.getItemId(this.itemPath);

        const { value: itemValue, disabled, shortcut, icon } = this.item;

        // If item has a "value" defined, listen for changes in the item
        if (itemValue?.length)
            this.menuService.menuItemUpdated$
                .pipe(
                    takeUntil(this.destroy$),
                    filter(({ value, type }) => type !== 'info' && value === itemValue)
                )
                .subscribe(({ data: updateData, type }) => {
                    let data: MenuItemSubmenu | MenuItemAction | MenuItemSelectable;
                    if (type === 'submenu') data = updateData as MenuItemSubmenu;
                    else if (type === 'selectable') data = updateData as MenuItemSelectable;
                    else data = updateData as MenuItemAction;

                    const prevDisabledState: boolean = disabled ?? false;

                    Object.assign(this.item, data);

                    if (data.className) this.initClassNames();

                    // If disabled items are not allowed to be navigated and
                    // previous disabled state is different than new state,
                    // update the KeyNav structure items
                    if (
                        'disabled' in data &&
                        !this.menuService.config.allowNavigateDisabled &&
                        prevDisabledState !== data.disabled
                    )
                        this.menuService.initKeyNavItems(true);

                    this.detectChanges();
                });

        this.initClassNames();

        this.shortcut = this.privateService.processShortcut(shortcut);

        if (!this.groupComp) return;

        // Inline groups
        if (this.groupComp instanceof MenuGroupInlineComponent) {
            const { itemsLabelPosition, itemsLabelNormal, labelFloating, groupItemLayout } = this.groupComp;

            this.isLabelNormal = itemsLabelNormal;
            this.isLabelTooltip = itemsLabelPosition === 'tooltip';
            this.isLabelFloating = labelFloating;

            // If group layout is of type "inline" and label is "start" or "end",
            // check icon existence to remove the element from the template
            // in order to save space ("grid" and "stack" layouts should stay vertically aligned if there are icons)
            if (groupItemLayout === 'inline' && ['start', 'end'].includes(itemsLabelPosition)) {
                this.showIcon = icon !== undefined;
            }

            if (labelFloating && itemsLabelPosition.endsWith('below')) this.isLabelFloatingPosition = 'bottom';
        }
        // Stacked groups
        else this.isLabelNormal = true;

        // Establishes if shortcut element should be rendered or not for "inline" or "grid" layouts
        if (this.groupComp.groupItemLayout !== 'stack')
            this.showShortcut = this.isLabelNormal && this.shortcut !== undefined;

        // Checkbox/Radio items
        const { type = DEFAULTS.groupType } = this.groupComp.group;
        if (['checkbox', 'radio'].includes(type)) {
            this.isSelectableGroup = true;
            this.menuItemRole += type;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * @description
     * Forces change detection.
     */
    detectChanges(): void {
        this.cdr.markForCheck();
    }

    /**
     * @description
     * Initializes the class names for the element.
     */
    private initClassNames(): void {
        this.itemClassNames = this.menuService.classNameToArray(this.item.className);
    }

    /**
     * @description
     * Creates the tooltip.
     */
    private createTooltip(trigger: HTMLElement): ComponentRef<MenuTooltipComponent> {
        return this.privateService.createTooltip(trigger, this.item.label, this.isLabelFloatingPosition, this.shortcut);
    }

    /**
     * @description
     * - Handles appropriate scroll for inline items when item gets focused and shows tooltip.
     * - Shows tooltip, when applies.
     * - Shows panel's label, when applies.
     */
    protected onItemFocus(): void {
        // Scrolls the item into the view
        this.nativeElement.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });

        // Tooltips or Panels are for "inline"/"grid" items only
        if (!this.groupComp?.groupItemLayout) return;

        // If label is of type "tooltip", open tooltip with item as its trigger
        if (this.isLabelTooltip) this.tooltip = this.createTooltip(this.nativeElement);
        // If is group of type "inline" or "grid"
        else if (this.groupComp instanceof MenuGroupInlineComponent) {
            const {
                groupItems: { nativeElement: inlineGrpElement },
                labelPanel,
            } = this.groupComp;

            // If label is of type "floating", open tooltip with group container as its trigger
            if (this.isLabelFloating) this.tooltip = this.createTooltip(inlineGrpElement);
            // If label is of type "panel"
            else if (labelPanel) {
                const { visual: visualShortcut = '' } = this.shortcut ?? {};
                // Send relevant data (text & shortcut) to show within the group's panel
                this.groupComp.itemPanelText = this.item.label;
                this.groupComp.itemPanelShortcut = visualShortcut || undefined;
            }
        }
    }

    /**
     * @description
     * Handles:
     * - Hide the tooltip
     * - Reset the group's panel
     */
    protected onItemBlur(): void {
        if ((this.isLabelTooltip || this.isLabelFloating) && this.tooltip) this.tooltip.destroy();
        else if (this.groupComp instanceof MenuGroupInlineComponent) {
            this.groupComp.itemPanelText = undefined;
            this.groupComp.itemPanelShortcut = undefined;
        }
    }

    /**
     * @description
     * Handles pointer click event for each menu item.
     */
    protected onItemClick(event?: Event): void {
        // If "event" (Space/Enter key)
        if (event) {
            // If NOT "check/radio" group type defined (it's just a normal item), don't do anything.
            // The selection of the item (on "Enter" key) is handled by the KeyNav main listener.
            if (!this.isSelectableGroup) return;

            // Set navigation as "keyboard"
            this.navigateFrom('kb');

            event.stopImmediatePropagation();
            event.preventDefault();
        } else {
            // Set navigation as "pointer"
            this.navigateFrom('pointer');
        }

        const { disabled, submenu } = this.item;

        // If the item is disabled or busy (local or group), block the action
        if (disabled || this.itemIsBusy || this.groupComp?.groupIsBusy) return;

        const menuIdx: number = this.itemPath.length;
        const submenuPath: string = (this.menuService.getMenu(menuIdx)?.menuPath ?? []).join('-');
        const itemPath: string = this.itemPath.join('-');
        const ifSubmenuExistsAndIsOpen: boolean = itemPath === submenuPath;

        // If the item has submenu and that menu exists and is already open, block the action
        if (ifSubmenuExistsAndIsOpen) return;

        // We cancel any possible opening of the submenu triggered by "mouseenter"
        clearTimeout(this.privateService.lastMouseEnterTimeout);

        // Save the current item index for pointer
        this.menuService.currentItemIdxFromPointer = this.idx;

        // Get the last menu state "index to"
        const { indexTo: lastMenuIdx = -1 } = this.menuService.lastNavigationState ?? {};

        // This is for when the user has the pointer hover an item with submenu and
        // gets out of the menu with the keybaord and then clicks again in the item
        if (lastMenuIdx !== this.idx) {
            const path: number[] = this.path;

            // Updates the menu state
            this.menuService.updateMenuState({
                key: 'ArrowDown',
                action: 'next',
                indexFrom: lastMenuIdx,
                indexTo: this.idx,
                itemFrom: this.item,
                itemTo: this.item,
                pathFrom: path,
                pathTo: path,
            });

            // Set the current navigation to current index
            this.keyNav.setCurrent({ index: this.idx, path });
        }

        // If the item has submenu
        if (submenu?.length) {
            // Send "Enter" key to open the submenu
            this.menuService.executeKeyNavNavigation$.next('Enter');
            return;
        }

        // At this point, it's a selectable item
        this.menuService.selectMenuItem();
    }

    /**
     * @description
     * Handles pointer "mouseenter" event for each menu item.
     */
    protected onItemMouseEnter(): void {
        if (this.isMobile || this.itemNotNavigable || this.itemIsBusy || this.groupComp?.groupIsBusy) return;

        clearTimeout(this.privateService.lastMouseLeaveTimeout);
        clearTimeout(this.privateService.lastMouseEnterTimeout);

        // Set navigation as "pointer"
        this.navigateFrom('pointer');

        const lastMenu: MenuComponent = this.menuService.lastMenu as MenuComponent;
        const lastMenuPath: string = lastMenu.menuPath.join('-');

        const submenuAlreadyOpen: boolean = this.itemPathID === lastMenuPath;

        // If this item is from a submenu that is already open, then:
        // - the user enters another item (starts timer to close the submenu)
        // - the user re-enters back to this item while its submenu is still open,
        // we clear the timeout to NOT close the submenu
        if (submenuAlreadyOpen) clearTimeout(this.privateService.lastMenuOpenTimeout);

        // If this item is not in the same path of the last open menu,
        // then destroy all open menus under this path (any siblings' open menu)
        if (!this.itemPathID.startsWith(lastMenuPath)) {
            clearTimeout(this.privateService.lastMenuOpenTimeout);

            this.privateService.lastMenuOpenTimeout = setTimeout(
                () => this.menuService.destroyMenu({ preserveFromLevel: this.path.length }),
                MENU_DELAY_MS
            );
        }

        // Set the current navigation to current index minus one
        this.keyNav.setCurrent({ index: this.idx - 1, path: this.path });

        // Send "arrow down" key so the KeyNav Service emits updated state and selected item is this one
        this.menuService.executeKeyNavNavigation$.next('ArrowDown');

        // Save the current item index for pointer
        this.menuService.currentItemIdxFromPointer = this.idx;

        // If last open menu is this item's submenu,
        // set current index to "nothing", path to current open submenu and then break
        if (submenuAlreadyOpen) {
            this.keyNav.setCurrent({ index: -1, path: [...this.path, this.idx] });
            return;
        }

        // If the item has submenu
        if (this.item.submenu?.length)
            // Send "Enter" key to open the submenu
            this.privateService.lastMouseEnterTimeout = setTimeout(
                () => this.menuService.executeKeyNavNavigation$.next('Enter'),
                MENU_DELAY_MS
            );
    }

    /**
     * @description
     * Handles pointer "mouseleave" event for each menu item.
     */
    protected onItemMouseLeave(): void {
        if (this.isMobile || this.itemNotNavigable) return;

        clearTimeout(this.privateService.lastMouseLeaveTimeout);
        clearTimeout(this.privateService.lastMouseEnterTimeout);

        // Set navigation as "pointer"
        this.navigateFrom('pointer');

        this.privateService.lastMouseLeaveTimeout = setTimeout(() => {
            const lastMenu: MenuComponent | undefined = this.menuService.lastMenu;
            if (!lastMenu) return;

            const lastMenuPath: string = lastMenu.menuPath.join('-');

            // If pointer leaves the item of an already opened menu, don't do anything
            if (lastMenuPath.startsWith(this.itemPathID)) return;

            // Set the current navigation to no index
            this.keyNav.setCurrent({ index: -1, path: this.path });

            // Set focus on the menu since no item is selected
            lastMenu.focusMenu();

            // Clears the current item index for pointer
            this.menuService.currentItemIdxFromPointer = -1;

            const lastNavigationState: KeyboardNavigationEvent<MenuItem> | undefined =
                this.menuService.lastNavigationState;
            if (!lastNavigationState) return;

            // We set the "indexTo" to -1 in order to the currentItemID updates properly to null
            this.menuService.updateMenuState({ ...lastNavigationState, indexTo: -1 });
            this.menuService.updateLastMenu();
        }, MENU_DELAY_MS);
    }

    /**
     * @description
     * Specifies where the user is navigating from (keyboard or mouse).
     */
    private navigateFrom(navFrom: MenuNavigatedFrom): void {
        this.menuService.navigateFrom(navFrom);
        this.keyNav.setConfig({ allowSelectFirstChild: this.menuService.navFromKeyboard });
    }
}
