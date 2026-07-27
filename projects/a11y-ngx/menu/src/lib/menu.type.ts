import type { OverlayBaseConfig, POSITION, ALIGNMENT } from '@a11y-ngx/overlay-base';

import type {
    Prettify,
    RejectProperties,
    MenuMainConfig,
    MenuItemBase,
    MenuItemIcon,
    MenuItemSelectableBeforeChange,
    MenuGroupBase,
    MenuGroupInlineBase,
    MenuGroupGridBase,
    MenuGroupCommonType,
    MenuGroupSelectableType,
    MenuGroupSelectableBusyScope,
    MenuGroupItemsStackLayout,
    MenuGroupItemsInlineLayout,
    MenuGroupItemsGridLayout,
    MenuGroupSelectableItems,
    MenuGroupActionItems,
    MenuGroupActionInlineItems,
    MenuGroupActionGridItems,
    MenuGroupSelectables,
    MenuContextForItem,
} from './menu.type.private';

export const MENU_CONFIG_DEFAULT: Pick<OverlayBaseConfig, 'fluidAlignment' | 'keepInViewport'> & MenuMainConfig = {
    offsetMenu: 2,
    offsetSubmenu: 4,
    maxWidth: 'auto',
    maxHeight: 'auto',
    className: 'a11y-menu',
    position: 'bottom-start',
    alignmentOrder: ['start', 'end', 'center'],
    closeOnTab: true,
    closeOnClickOutside: true,
    closeOnScrollOutside: true,
    closeOnWindowBlur: true,
    throttleMs: 50,
    allowNavigateDisabled: true,
    focusItemWhenOpen: undefined,
    showGroupLabels: true,
    alignMenuItemsWithTrigger: false,
    animate: 'none',
    animateMs: 150,
    mobileLabels: {
        back: 'Go back to previous menu',
        close: 'Close menu',
    },
    // Overlay-Base specific config
    fluidAlignment: true,
    keepInViewport: false,
};

export type Menu = (MenuItem | MenuItemInfo | MenuItemSeparator | MenuGroup)[];

export type MenuItem = MenuItemSubmenu | MenuItemAction;

export type MenuItemSubmenu = MenuItemBase & {
    /**
     * @description
     * Establishes a submenu of items for the menu item.
     *
     * @note
     * You can add:
     *
     * ✔️ Action items
     *
     * ✔️ Info items
     *
     * ✔️ Submenu items
     *
     * ✔️ Group of action/selectable items
     *
     * ✔️ Separators
     */
    submenu: Menu;
} & RejectProperties<'shortcut' | 'closeOnSelect' | 'checked'>;

export type MenuItemAction = MenuItemBase &
    Partial<{
        /**
         * @description
         * Defines the keyboard shortcut associated to the item.
         *
         * 💡 You can establish the actual shortcut `'key'` with any combination (optional) `'ctrlCmd'`, `'alt'`, `'shift'` keys.
         *
         * @note
         * It just provides visual and screen reader support to help the user to know the keyboard shortcut,
         * **it does not** bind the actual keyboard event to action the item.
         *
         * @example
         * {
         *     label: 'Save',
         *     // It renders as 'Ctrl+S' (for Windows/Linux) or '⌘S' (for Mac)
         *     shortcut: { ctrlCmd: true, key: 's' },
         * }
         */
        shortcut: MenuItemShortcut;
        /**
         * @description
         * Determines whether the menu should automatically close after the user interacts with the item.
         *
         * @note
         * 💡 **Hierarchy:** If defined on a specific item, it will override any `closeOnSelect` configuration set at the Group level.
         *
         * @default true // for action items
         */
        closeOnSelect: boolean;
        /**
         * @description
         * Executes a custom method when the action item gets activated.
         *
         * @note
         * ⚠️ When `action` is defined, the menu **won't** emit any value.
         */
        action: (itemCtx: MenuItemContext, menuCtx: MenuContext) => void;
    }> &
    RejectProperties<'submenu' | 'checked'>;

export type MenuItemShortcut = {
    /**
     * @description
     * The primary alphanumeric key or specific key name.
     *
     * @note
     * See also the `keyLabel` property for localization and accessibility.
     *
     * @example
     * 'S', 'P', 'Enter', 'F5'
     */
    key: string;
} & Partial<{
    /**
     * @description
     * The full word or localized text to provide clearer announcement for screen reader users (e.g., 'Delete', 'Arrow Up').
     *
     * @note
     * Given the screen reader announces the given combination _as is_,
     * for some specific cases, you can use `keyLabel` to specify the full word to be announced.
     *
     * @example
     * // ❌ Will render as "Ctrl+Del" and Screen Reader will announce it as "Control+Del"
     * shortcut: { ctrlCmd: true, key: 'Del' }
     * // ✔️ Will render as "Ctrl+Del" and Screen Reader will announce it as "Control+Delete"
     * shortcut: { ctrlCmd: true, key: 'Del', keyLabel: 'Delete' }
     */
    keyLabel: string;
    /** @description Indicates if the 'Ctrl' (Windows/Linux) or 'Cmd / ⌘' (Mac) modifier is required. */
    ctrlCmd: boolean;
    /** @description Indicates if the 'Alt' (Windows) or 'Option / ⌥' (Mac) modifier is required. */
    alt: boolean;
    /** @description Indicates if the 'Shift / ⇧' modifier is required. */
    shift: boolean;
}>;

export type MenuItemSelectable = Omit<MenuItemAction, 'submenu' | 'checked' | 'closeOnSelect' | 'action'> &
    MenuItemSelectableBeforeChange &
    Partial<{
        /** @description The "checked" state for the radio/checkbox item. */
        checked: boolean;
        /**
         * @description
         * Determines whether the menu should automatically close after the user interacts with the item.
         *
         * @note
         * 💡 **Hierarchy:** If defined on a specific item, it will override any `closeOnSelect` configuration set at the Group level.
         *
         * @default false // for selectable items
         */
        closeOnSelect: boolean;
    }>;

export type MenuItemInfo = {
    /** @description The information you want to show. */
    info: string;
} & Pick<MenuItemBase, 'className' | 'icon' | 'value'>;

export type MenuItemSeparator = {
    /** @description Shows a separator. */
    separator: true;
} & RejectProperties<
    'label' | 'items' | 'type' | 'submenu' | 'value' | 'icon' | 'disabled' | 'className' | 'closeOnSelect' | 'info'
>;

export type MenuGroup =
    | MenuGroupSelectableStack
    | MenuGroupSelectableInline
    | MenuGroupSelectableGrid
    | MenuGroupActionStack
    | MenuGroupActionInline
    | MenuGroupActionGrid;

export type MenuGroupSelectableStack = MenuGroupBase &
    MenuGroupItemsStackLayout &
    MenuGroupSelectableType &
    MenuGroupSelectableBusyScope &
    MenuItemSelectableBeforeChange &
    MenuGroupSelectableItems &
    RejectProperties<'itemsJustify' | 'itemsLabelWrap' | 'itemsFlow' | 'itemsLabelPosition'>;

export type MenuGroupSelectableInline = Omit<MenuGroupBase, 'icon' | 'showLabel'> &
    MenuGroupInlineBase &
    MenuGroupItemsInlineLayout &
    MenuGroupSelectableType &
    MenuGroupSelectableBusyScope &
    MenuItemSelectableBeforeChange &
    MenuGroupSelectableItems;

export type MenuGroupSelectableGrid = Omit<MenuGroupBase, 'icon' | 'showLabel'> &
    MenuGroupGridBase &
    MenuGroupItemsGridLayout &
    MenuGroupSelectableType &
    MenuGroupSelectableBusyScope &
    MenuItemSelectableBeforeChange &
    MenuGroupSelectableItems;

export type MenuGroupActionStack = MenuGroupBase &
    MenuGroupItemsStackLayout &
    MenuGroupCommonType &
    MenuGroupActionItems &
    RejectProperties<'itemsJustify' | 'itemsLabelWrap' | 'itemsFlow' | 'itemsLabelPosition'>;

export type MenuGroupActionInline = Omit<MenuGroupBase, 'icon' | 'showLabel'> &
    MenuGroupInlineBase &
    MenuGroupItemsInlineLayout &
    MenuGroupCommonType &
    MenuGroupActionInlineItems;

export type MenuGroupActionGrid = Omit<MenuGroupBase, 'icon' | 'showLabel'> &
    MenuGroupGridBase &
    MenuGroupItemsGridLayout &
    MenuGroupCommonType &
    MenuGroupActionGridItems;

export type MenuItemSelected = {
    /** @description The item selected. */
    item: MenuItemAction | MenuItemSelectable;
    /** @description Group snapshot after the change (only for selectable groups). */
    group?: MenuGroupSelectables;
};

export type MenuContext = {
    /** @description Retrieves an "action" item by the `value` established when created. */
    getItemAction: (value: string) => MenuContextForItem<MenuItemAction> | undefined;
    /** @description Retrieves an "info" item by the `value` established when created. */
    getItemInfo: (value: string) => MenuContextForItem<MenuItemInfo> | undefined;
    /** @description Retrieves a "selectable" (checkbox or radio) item by the `value` established when created. */
    getItemSelectable: (value: string) => MenuContextForItem<MenuItemSelectable> | undefined;
    /** @description Retrieves a "submenu" item by the `value` established when created. */
    getItemSubmenu: (value: string) => MenuContextForItem<MenuItemSubmenu> | undefined;
    /** @description Announces the given message for screen reader users. */
    announce: (message: string) => void;
    /** @description Closes the entire menu. */
    closeMenu: () => void;
};

export type MenuItemContext = {
    /** @description The activated item. */
    item: Readonly<MenuItemAction | MenuItemSelectable>;
    /** @description Sets the item's label. */
    setLabel: (label: string) => void;
    /** @description Sets the item's icon. */
    setIcon: (icon: MenuItemIcon) => void;
    /**
     * @description
     * Sets the item in a "busy" state to indicate whether it's currently processing an action or not.
     *
     * - While _busy_, the item becomes non-interactive.
     * - This is particularly useful when handling asynchronous calls inside any of the custom functions:
     *   - `action` (for action items)
     *   - `beforeChange` (for selectable items)
     *
     * @note
     *
     * 💡 If your item has an icon defined, the menu will show your custom _loading_ icon when it's busy,
     * established via `iconDefaultLoader` in the main config.
     *
     * 💡 You can also set a `message` to provide context for screen reader users.
     *
     * @example
     * itemCtx.setBusy(true, 'Saving file'); // when process starts
     * // ... wait for backend ...
     * itemCtx.setBusy(false, 'File saved successfully'); // when process ends
     */
    setBusy: (isBusy: boolean, message?: string) => void;
    /** @description Enables or disables the item. */
    setDisabled: (isDisabled: boolean) => void;
};

export type MenuPosition = `${POSITION}` | `${POSITION}-${ALIGNMENT}`;

export type MenuOpenReason = 'click' | 'keyboard';

export type MenuCloseReason =
    | 'escape'
    | 'toggle'
    | 'item-selected-click'
    | 'item-selected-keyboard'
    | 'click-outside'
    | 'touch-outside'
    | 'wheel-outside'
    | 'programmatically'
    | 'keyboard'
    | 'mobile-back'
    | 'host-destroyed'
    | 'internal';

export type MenuCustomConfig = Prettify<
    {
        /** @description The feature's custom selector. */
        selector: string;
    } & Required<Pick<MenuMainConfig, 'className'>> &
        Partial<Omit<MenuMainConfig, 'className'>>
>;

export type MenuConfig = Partial<
    Omit<
        MenuMainConfig,
        'closeOnClickOutside' | 'closeOnTab' | 'focusItemWhenOpen' | 'alignmentOrder' | 'positionsAllowed'
    >
>;
