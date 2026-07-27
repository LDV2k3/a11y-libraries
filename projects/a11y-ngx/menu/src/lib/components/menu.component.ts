import {
    Component,
    Input,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ViewChildren,
    QueryList,
    ChangeDetectorRef,
    ElementRef,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { ThemeService } from '@a11y-ngx/theme';
import { OverlayBase, OverlayBaseCalculatedPosition, OverlayBaseMaxSize } from '@a11y-ngx/overlay-base';
import { provideCustomA11yIcon } from '@a11y-ngx/icon';

import { MenuService } from '../menu.service';
import { MenuPrivateService } from '../menu.service.private';
import { MobileService } from '../mobile/mobile.service';

import { MenuItemComponent } from './menu-item.component';

import { MENU_SELECTOR, MENU_CONFIG_DEFAULTS as DEFAULTS } from '../menu.type.private';
import type {
    MenuHas,
    MenuAnimate,
    MenuAnimateType,
    MenuMatchingIndices,
    MenuGroupInlineBase,
    MenuMobileLabels,
} from '../menu.type.private';
import type { Menu, MenuGroup, MenuItem, MenuItemSelectable, MenuItemInfo, MenuItemSeparator } from '../menu.type';

@Component({
    selector: MENU_SELECTOR,
    template: `
        <ng-container *ngIf="isMobile; else mainStructure">
            <div menu-header>
                <span menu-actions *ngIf="mobileLabels as labels">
                    <button
                        type="button"
                        menu-action
                        action-back
                        role="menuitem"
                        [attr.aria-label]="labels.back"
                        (click)="onMobileBack()"
                        *ngIf="!isRootMenu">
                        &nbsp;
                    </button>
                    <button
                        type="button"
                        menu-action
                        action-close
                        role="menuitem"
                        [attr.aria-label]="labels.close"
                        (click)="onMobileClose()">
                        &nbsp;
                    </button>
                </span>
                <span menu-label aria-hidden="true" *ngIf="menuLabel">{{ menuLabel }}</span>
            </div>
            <div menu-body role="none">
                <ng-container *ngTemplateOutlet="mainStructure"></ng-container>
            </div>
        </ng-container>

        <ng-template #mainStructure>
            <ng-container *ngFor="let item of menuItems; let originalIdx = index">
                <ng-container *ngIf="!isSeparator(item); else separatorTemplate">
                    <ng-container *ngIf="!isGroup(item); else groupTemplateMain">
                        <ng-container
                            *ngTemplateOutlet="
                                itemTemplate;
                                context: { $implicit: item, idx: originalIdx }
                            "></ng-container>
                    </ng-container>

                    <ng-template #groupTemplateMain>
                        <ng-container
                            *ngTemplateOutlet="
                                groupTemplate;
                                context: { $implicit: item, idx: originalIdx }
                            "></ng-container>
                    </ng-template>
                </ng-container>
            </ng-container>
        </ng-template>

        <ng-template #separatorTemplate>
            <a11y-menu-separator [attr.aria-hidden]="isMobile ? true : null"></a11y-menu-separator>
        </ng-template>

        <ng-template #groupTemplate let-group let-idx="idx">
            <ng-container *ngTemplateOutlet="separatorTemplate"></ng-container>
            <ng-container
                *ngTemplateOutlet="
                    isGroupInlineGrid(group) ? groupInlineTemplate : groupSelectableTemplate;
                    context: { $implicit: group, idx }
                "></ng-container>
            <ng-container *ngTemplateOutlet="separatorTemplate"></ng-container>
        </ng-template>

        <ng-template #groupInlineTemplate let-group let-idx="idx">
            <a11y-menu-group-inline [group]="group" #groupInlineComp>
                <ng-container
                    *ngTemplateOutlet="
                        groupItemTemplate;
                        context: { $implicit: group.items, idx, groupComp: groupInlineComp };
                        injector
                    "></ng-container>
            </a11y-menu-group-inline>
        </ng-template>

        <ng-template #groupSelectableTemplate let-group let-idx="idx">
            <a11y-menu-group [group]="group" #groupSelectableComp>
                <ng-container
                    *ngTemplateOutlet="
                        groupItemTemplate;
                        context: { $implicit: group.items, idx, groupComp: groupSelectableComp }
                    "></ng-container>
            </a11y-menu-group>
        </ng-template>

        <ng-template #groupItemTemplate let-items let-idx="idx" let-groupComp="groupComp">
            <ng-container *ngFor="let item of items; let grpItemIdx = index">
                <ng-container *ngIf="!isSeparator(item); else separatorTemplate">
                    <ng-container
                        *ngTemplateOutlet="
                            itemTemplate;
                            context: { $implicit: item, idx: idx + '-' + grpItemIdx, groupComp }
                        "></ng-container>
                </ng-container>
            </ng-container>
        </ng-template>

        <ng-template #itemTemplate let-item let-idx="idx" let-groupComp="groupComp">
            <ng-template
                *ngTemplateOutlet="
                    !this.isInfoItem(item) ? itemActionTemplate : itemInfoTemplate;
                    context: { $implicit: item, idx, groupComp }
                "></ng-template>
        </ng-template>

        <ng-template #itemActionTemplate let-item let-idx="idx" let-groupComp="groupComp">
            <a11y-menu-item
                [item]="item"
                [path]="menuPath"
                [idx]="matchingData.keyNavIdx[idx]"
                [groupComp]="groupComp"></a11y-menu-item>
        </ng-template>

        <ng-template #itemInfoTemplate let-item>
            <a11y-menu-item-info [item]="item"></a11y-menu-item-info>
        </ng-template>
    `,
    styleUrls: ['./menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideCustomA11yIcon((service: MenuService) => service.iconDefault, [MenuService])],
    host: {
        role: 'menu',
        tabindex: '-1',
        class: 'a11y-scrollbar a11y-theme',
        '[style]': 'menuCustomStyles',
        '[style.--usr-max-width]': `!maxWidth || maxWidth === 'auto' ? null : maxWidth`,
        '[style.--usr-max-height]': `!maxHeight || maxHeight === 'auto' ? null : maxHeight`,
        '[style.--animate-ms]': 'styleAnimateMs',
        '[class]': 'menuClassNames',
        '[attr.id]': 'menuID',
        '[attr.aria-label]': 'menuLabel',
        '[attr.aria-hidden]': 'isMobile && !iAmLastMenu ? true : null',
        '[attr.mobile]': `isMobile ? '' : null`,
        '[attr.theme]': 'attrTheme',
        '[attr.loading]': 'attrLoading',
        '[attr.animate]': 'attrAnimate',
        '[attr.fade]': `menuFade ? '' : null`,
        '[attr.has-icons]': `menuHas.icons ? '' : null`,
        '[attr.has-shortcuts]': `menuHas.shortcuts ? '' : null`,
        '(wheel)': 'onMouseWheel($event)',
        '(mouseenter)': 'onMouseEnter()',
        '(contextmenu)': 'onContextMenu($event)',
    },
})
export class MenuComponent extends OverlayBase implements OnInit, AfterViewInit, OnDestroy {
    /** @description The label of the current menu. */
    @Input() menuLabel!: string | null;
    /** @description The items of the current menu. */
    @Input() menuItems!: Menu;
    /** @description The path of the current menu. */
    @Input() menuPath!: number[];

    /** @description The menu item components. */
    @ViewChildren(MenuItemComponent) readonly menuItemComponents!: QueryList<MenuItemComponent>;

    /** @description The menu's HTML Element instance. */
    get nativeElement(): HTMLElement {
        return this.hostElement.nativeElement;
    }

    /** @description If this is the _root_ menu instance. */
    get isRootMenu(): boolean {
        return this.menuPath.length === 0;
    }

    /** @description If is mobile device. */
    get isMobile(): boolean {
        return this.mobileService.isMobile;
    }

    /** @description The action labels for mobile. */
    get mobileLabels(): MenuMobileLabels {
        return this.menuService.mobileLabels;
    }

    /** @description The menu's unique ID. */
    protected menuID: string | null = null;

    /**
     * @description
     * If this instance is the _last_ menu.
     *
     * @note
     * For those menus that are **not** last instance, they will be hidden for screen readers (mobile only).
     */
    protected get iAmLastMenu(): boolean {
        return this.menuService.lastMenu?.uid === this.uid;
    }

    /** @description To map the relationship between KeyNav & Menu indices and Menu & KeyNav indices. */
    readonly matchingData: MenuMatchingIndices = { menuIdx: {}, keyNavIdx: {} };

    /** @description If the menu has icons or shortcuts. */
    protected readonly menuHas: MenuHas = { icons: false, shortcuts: false };

    /** @description The custom styles. */
    protected menuCustomStyles: Partial<CSSStyleDeclaration> = {};

    /** @description The class names. */
    protected menuClassNames: string[] = [];

    protected maxWidth: string | undefined = undefined;
    protected maxHeight: string | undefined = undefined;
    protected styleAnimateMs: string | null = null;

    /** @description Fades in or out the entire menu. */
    protected menuFade: boolean = false;

    /** @description Forces the menu's theming. */
    protected attrTheme: 'light' | 'dark' | null = null;

    /** @description Blocks pointer events via CSS while animation is taking place when open/close. */
    protected attrLoading: string | null = '';

    /** @description Establishes the current animation. */
    protected attrAnimate: MenuAnimate | 'mobile' | null = null;

    constructor(
        private hostElement: ElementRef<HTMLElement>,
        private menuService: MenuService,
        private privateService: MenuPrivateService,
        private mobileService: MobileService,
        private themeService: ThemeService,
        private cdr: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        const {
            classNames,
            config: { maxWidth, maxHeight, animateMs, theme },
        } = this.menuService;

        this.menuID = `a11y-menu-${this.uid}`;
        if (this.triggerElement instanceof HTMLElement) this.triggerElement.setAttribute('aria-controls', this.menuID);

        this.attrTheme = theme ?? this.themeService.theme ?? null;

        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;

        this.menuClassNames = classNames;

        this.styleAnimateMs = `${animateMs}ms`;

        this.menuHas.icons = this.menuItems.some((item) => {
            // If separator, ignore
            if (this.isSeparator(item)) return;
            // If group...
            if (this.isGroup(item)) {
                const group: MenuGroup = this.asGroup(item);
                const { type = DEFAULTS.groupType, itemsLayout = DEFAULTS.groupItemsLayout, items } = group;
                // ... item layout "stack"
                if (itemsLayout === 'stack') {
                    // ... type "checkbox" or "radio", ignore
                    // (these groups have the "check" item, can't be aligned with the rest)
                    if (['checkbox', 'radio'].includes(type)) return;
                    // ... check icons within items
                    return items.some((item) => item.icon);
                }
                // ... item layout "inline" or "grid"
                else {
                    const { layout = DEFAULTS.groupLayout } = group as MenuGroupInlineBase;
                    // Layouts with label above the items, ignore
                    if (layout === 'stack') return;
                }
                // ... layout "inline" or "grid", check group icon
                return item.icon;
            }
            // If action item or info item
            return item.icon;
        });

        let keyNavIdx: number = -1;

        const saveMatchingData = (keyNavObjIdx: string, originalIdx: number): void => {
            // Increment KeyNav "idx" value
            ++keyNavIdx;
            // Save matching KeyNav-Menu index
            this.matchingData.menuIdx[keyNavIdx] = originalIdx;
            // Save matching Menu-KeyNav index
            this.matchingData.keyNavIdx[keyNavObjIdx] = keyNavIdx;
        };

        const checkIfHasShortcut = ({ shortcut }: MenuItem | MenuItemSelectable) => {
            if (shortcut) this.menuHas.shortcuts = true;
        };

        // Iterate through all menu items to create KeyNav/MenuItem map indices
        this.menuItems.forEach((item, originalIdx) => {
            // If "separator" or "info", ignore
            if ('separator' in item || 'info' in item) return;
            // If "group"
            else if ('items' in item) {
                const { itemsLayout = DEFAULTS.groupItemsLayout, items } = this.asGroup(item);
                // Iterate through all group items
                items.forEach((item, grpIdx) => {
                    // If "separator" or "info", ignore
                    if ('separator' in item || 'info' in item) return;

                    saveMatchingData(`${originalIdx}-${grpIdx}`, originalIdx);
                    if (itemsLayout === 'stack') checkIfHasShortcut(item);
                });
            }
            // If "item"
            else {
                saveMatchingData(String(originalIdx), originalIdx);
                checkIfHasShortcut(item);
            }
        });

        const animation: MenuAnimateType | 'mobile' = this.isMobile ? 'mobile' : this.menuService.animateData.in;
        this.setAnimation(animation);
        this.detectChanges();
    }

    ngAfterViewInit(): void {
        const nativeElement: HTMLElement = this.nativeElement;
        const { animateMs, alignMenuItemsWithTrigger } = this.menuService.config;

        // Set focus on the menu
        this.focusMenu();

        const endLoading = (): void => {
            this.attrLoading = null;
            this.setAnimation('none');
            this.detectChanges();
        };

        // Mobile doesn't need anything else but fade in & animation
        if (this.isMobile) {
            this.menuFade = true;
            this.detectChanges();

            // End "loading" and remove "animation"
            setTimeout(() => endLoading(), 250);

            return;
        }

        // For desktop, init the overlay
        this.attachOverlay(nativeElement)
            .pipe(takeUntil(this.isDetached$))
            .subscribe(({ render, maxSize, alignment }: OverlayBaseCalculatedPosition) => {
                // Start fade in
                this.menuFade = true;
                this.detectChanges();

                let attrLoadingMs: number = 0;
                if (this.menuService.animateData.in.startsWith('scale')) attrLoadingMs = Math.max(0, animateMs);

                // End "loading" and remove "animation"
                setTimeout(() => endLoading(), attrLoadingMs);

                let addToTop: number = 0;
                let addToLeft: number = 0;

                // Compensate any menu padding to align trigger with first item of root menu (if required) or submenu
                if (alignment !== 'center' && (!this.isRootMenu || alignMenuItemsWithTrigger)) {
                    const { borderWidth, paddingTop, paddingBottom, paddingLeft, paddingRight } =
                        this.privateService.getMenuComputedStyles(nativeElement);

                    const menuBorder: number = parseFloat(borderWidth);

                    if (this.isTopBottom) {
                        const menuPaddingLeft: number = parseFloat(paddingLeft) + menuBorder;
                        const menuPaddingRight: number = parseFloat(paddingRight) + menuBorder;

                        addToLeft = alignment === 'start' ? menuPaddingLeft * -1 : menuPaddingRight;
                    } else {
                        const menuPaddingTop: number = parseFloat(paddingTop) + menuBorder;
                        const menuPaddingBottom: number = parseFloat(paddingBottom) + menuBorder;

                        addToTop = alignment === 'start' ? menuPaddingTop * -1 : menuPaddingBottom;
                    }
                }

                const customStyles: Partial<CSSStyleDeclaration> = {};

                const { width: maxWidth, height: maxHeight } = maxSize as OverlayBaseMaxSize;
                const { top, left, bottom, right } = render;

                // Sets max-width and max-height values from what Overlay Base specifies
                customStyles.maxWidth = `min(${maxWidth + addToLeft * -1}px, var(--usr-max-width, 100vw))`;
                customStyles.maxHeight = `min(${maxHeight + addToTop * -1}px, var(--usr-max-height, 100vh))`;

                // Sets the position
                customStyles.top = top !== null ? `${top + addToTop}px` : undefined;
                customStyles.left = left !== null ? `${left + addToLeft}px` : undefined;
                customStyles.bottom = bottom !== null ? `${bottom}px` : undefined;
                customStyles.right = right !== null ? `${right}px` : undefined;

                // Applies the styles
                this.menuCustomStyles = customStyles;

                this.detectChanges();
            });
    }

    ngOnDestroy(): void {
        if (this.triggerElement instanceof HTMLElement) this.triggerElement.removeAttribute('aria-controls');

        this.detachOverlay();
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
     * - Establishes the exit animation value
     * - Starts to fade out
     * - Adds the "loading" attribute to avoid any pointer events
     */
    closeMenu(): void {
        this.setAnimation(this.menuService.animateData.out);
        this.menuFade = false;
        this.attrLoading = '';
        this.detectChanges();
    }

    /**
     * @description
     * Sets focus on the menu element.
     */
    focusMenu(): void {
        this.nativeElement.focus({ preventScroll: true });
    }

    /**
     * @description
     * Sets focus on the item element based on the given index.
     */
    focusItem(idx: number): void {
        const itemComponent: MenuItemComponent = this.menuItemComponents.get(idx) as MenuItemComponent;
        itemComponent.nativeElement.focus({ preventScroll: true });
    }

    /**
     * @description
     * Checks if the given node is a "group" of items.
     */
    isGroup(node: MenuItem | MenuGroup | MenuItemInfo | MenuItemSeparator): boolean {
        return this.asGroup(node).items !== undefined;
    }

    /**
     * @description
     * Checks if the given node is an "inline" or "grid" group of items.
     */
    isGroupInlineGrid(node: MenuItem | MenuGroup | MenuItemInfo | MenuItemSeparator): boolean {
        return ['inline', 'grid'].includes(this.asGroup(node).itemsLayout ?? DEFAULTS.groupItemsLayout);
    }

    /**
     * @description
     * Checks if the given node is a "separator" item.
     */
    isSeparator(node: MenuItem | MenuGroup | MenuItemInfo | MenuItemSeparator): boolean {
        return 'separator' in (node as MenuItemSeparator);
    }

    /**
     * @description
     * Checks if the given node is an "info" item.
     */
    isInfoItem(node: MenuItem | MenuGroup | MenuItemInfo | MenuItemSeparator): boolean {
        return (node as MenuItemInfo).info !== undefined;
    }

    /**
     * @description
     * Returns the given node as a "group" item.
     */
    asGroup(node: MenuItem | MenuGroup | MenuItemInfo | MenuItemSeparator): MenuGroup {
        return node as MenuGroup;
    }

    /**
     * @description
     * Handles the "back" action on mobile layout.
     */
    onMobileBack(): void {
        this.mobileService.popMobileState();
    }

    /**
     * @description
     * Handles the "close" action on mobile layout.
     */
    onMobileClose(): void {
        this.menuService.destroyMenu({ closeReason: 'mobile-back' });
    }

    /**
     * @description
     * Prevents bubbling the mouse wheel.
     *
     * - Handles horizontal overflow for inline layouts.
     * - Handles vertical overflow for the entire menu.
     * - Closes any open submenu (if any).
     */
    onMouseWheel(event: WheelEvent): boolean | void {
        if (this.isMobile) return;

        event.stopImmediatePropagation();

        const target: HTMLElement = event.target as HTMLElement;
        const isHorizontalScroll: boolean = event.deltaX !== 0;

        // If user is scrolling horizontally
        if (isHorizontalScroll) {
            const itemsInlineContainer: HTMLElement | null = target.closest('[menu-group-items]');

            // If it's scrolling within an inline group of items
            if (itemsInlineContainer) {
                const { scrollWidth, offsetWidth } = itemsInlineContainer;
                const hasScrollbar: boolean = scrollWidth > offsetWidth;
                // If there is overflow, don't do anything (allows the scrolling)
                if (hasScrollbar) return;
            }
        }

        const { scrollHeight, offsetHeight } = this.nativeElement;
        const hasScrollbar: boolean = scrollHeight > offsetHeight;

        // If there is vertical overflow
        if (hasScrollbar) {
            // For some reason, when cursor is over the scrollbar
            // the wheel event pass the menu and scrolls whatever is behind.
            if (event.offsetX >= target.clientWidth) {
                // We block the wheel default
                event.preventDefault();
                // We manually scroll to the desired position
                target.scrollTo({ behavior: 'smooth', top: target.scrollTop + event.deltaY });
            }

            const thisMenuPath: number = this.menuPath.length;
            const openMenuPath: number = this.menuService.menuList.length - 1;

            // If there are no submenus open below this level, don't do anything
            if (thisMenuPath === openMenuPath) return;

            // Close every open submenu that exists
            // using "ArrowLeft" to keep record of the KeyNav state
            for (let path = 0; path < openMenuPath; path++) {
                this.menuService.executeKeyNavNavigation$.next('ArrowLeft');
            }
        }
        // If there is no overflow, prevent default for mouse wheel
        else event.preventDefault();
    }

    /**
     * @description
     * Keeps the current menu open (this one being hovered) when another item
     * from the parent menu was hovered and quickly moved the pointer back to this menu.
     */
    protected onMouseEnter(): void {
        const lastMenuPath: string | undefined = (this.menuService.lastMenu as MenuComponent).menuPath.join('-');
        const thisMenuPath: string = this.menuPath.join('-');

        // If the last open menu is the same as this one,
        // clear the timeout to NOT close it
        if (lastMenuPath === thisMenuPath) clearTimeout(this.privateService.lastMenuOpenTimeout);
    }

    /**
     * @description
     * Blocks the use of "context menu" inside the menu.
     */
    protected onContextMenu(event: PointerEvent): void {
        event.stopImmediatePropagation();
        event.preventDefault();
    }

    /**
     * @description
     * Sets the animation type.
     */
    private setAnimation(animateType: MenuAnimateType | 'mobile'): void {
        this.attrAnimate = animateType !== 'none' ? animateType : null;
    }
}
