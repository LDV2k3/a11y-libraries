import { Observable } from 'rxjs';

import type { OverlayBaseAlignment, OverlayBaseConfig } from '@a11y-ngx/overlay-base';
import type { KeyboardNavigationConfig } from '@a11y-ngx/keyboard-navigation';
import type { Icon, IconDefaultComponent } from '@a11y-ngx/icon';

import type {
    Menu,
    MenuConfig,
    MenuCloseReason,
    MenuPosition,
    MenuItem,
    MenuItemInfo,
    MenuItemAction,
    MenuItemSubmenu,
    MenuItemSelectable,
    MenuItemSeparator,
    MenuItemContext,
    MenuContext,
    MenuGroupSelectableStack,
    MenuGroupSelectableInline,
    MenuGroupSelectableGrid,
} from './menu.type';

export const MENU_SELECTOR: string = 'a11y-menu';

export const MENU_DELAY_MS: number = 400;

export const TABBABLE_ELEMENT_TABINDEX_SELECTOR: string = '[tabindex]:not([tabindex=""])';

export const MENU_SUBMENU_CONFIG: Omit<OverlayBaseConfig, 'position'> & Pick<MenuConfig, 'position'> = {
    position: 'right-start',
    positionsAllowed: 'opposite',
};

export const MENU_KEY_NAV_CONFIG: Partial<KeyboardNavigationConfig> = {
    type: 'menu',
    childrenProperty: 'submenu',
    allowRepeatedEventsFor: ['Enter'],
};

export const MENU_CONFIG_DEFAULTS: {
    groupShowLabel: boolean;
    groupType: 'common';
    groupBusyScope: 'item';
    groupLayout: MenuGroupLayout;
    groupItemsLayout: MenuGroupItemsLayout;
    groupItemsLabelPosition: MenuInlineLabelType;
    groupItemsLabelWrap: boolean;
    groupItemsJustify: 'start';
    groupItemsFlow: MenuGroupItemsFlow;
    groupGridColumns: number;
} = {
    groupShowLabel: true,
    groupType: 'common',
    groupBusyScope: 'item',
    groupLayout: 'stack',
    groupItemsLayout: 'stack',
    groupItemsLabelPosition: 'below',
    groupItemsJustify: 'start',
    groupItemsLabelWrap: true,
    groupItemsFlow: 'row',
    groupGridColumns: 5,
};

export const MENU_MOBILE_LABELS: MenuMobileLabels = {
    back: 'Go back to previous menu',
    close: 'Close menu',
};

export type MenuMainConfig = Omit<
    OverlayBaseConfig,
    | 'trigger'
    | 'fluidSize'
    | 'fluidAlignment'
    | 'position'
    | 'positionStrategy'
    | 'alignmentsAllowed'
    | 'alignmentOrder'
    | 'allowScrollListener'
    | 'offsetSize'
    | 'initialScale'
    | 'keepInViewport'
> &
    Partial<{
        /** @description Forces the given theme. @default undefined // System's */
        theme: 'light' | 'dark';
        /** @description The label for the root menu (helpful for screen reader users). */
        menuLabel: string;
        /**
         * @description
         * Defines the default entry to render your icons.
         *
         * Useful when you are using third-party components (like Material Icons), custom ones or images from your assets.
         *
         * @note
         * When using a component to render icons, declaring `icon: { component: MatIcon, content: '...' }`
         * on **every single item** becomes boilerplate-heavy 💥.
         *
         * This property allows you to set a global default.
         *
         * @example
         * ```typescript
         * // 1. As a component:
         * // 1.1 The main config
         * {
         *     iconDefaultStrategy: { component: MatIcon, mainEntry: 'content' },
         * }
         * // 1.2 The menu item's icon
         * {
         *     label: 'Save',
         *     icon: 'save',  // Used as content projection
         * }
         * // 1.3 Will result in
         * ```
         * ```html
         * <mat-icon ...>save</mat-icon>
         * ```
         *
         * ```typescript
         *
         * // 2. As an image:
         * // 2.1 The main config
         * {
         *     iconDefaultStrategy: 'image',
         * }
         * // 2.2 The menu item's icon
         * {
         *     label: 'Save',
         *     icon: '/assets/icons/save.png',  // Used as src
         * }
         * // 2.3 Will result in
         * ```
         * ```html
         * <img src="/assets/icons/save.png" alt="" />
         * ```
         */
        iconDefaultStrategy: IconDefaultComponent | 'image';
        /** @description Defines your default loading state icon. @note It will be applied when the item gets in _busy_ state. */
        iconDefaultLoader: MenuItemIcon;
        /** @description Text labels used for the "back" and "close" mobile layout buttons (useful for accessibility). */
        mobileLabels: MenuMobileLabels;
    }> & {
        /** @description The throttle to prevent rapid key repeat events (in milliseconds). @default 50 */
        throttleMs: number;
        /** @description To allow move through disabled items (not activate them). @default true */
        allowNavigateDisabled: boolean;
        /** @description To close the entire menu when pressing TAB key. @default true */
        closeOnTab: boolean;
        /** @description To close the entire menu when clicking outside. @default true */
        closeOnClickOutside: boolean;
        /** @description To close the entire menu when scrolling outside. @default true */
        closeOnScrollOutside: boolean;
        /** @description To close the entire menu when the browser window loses focus (aka, switching tabs, minimizing browser or interacting with another app). @default true */
        closeOnWindowBlur: boolean;
        /** @description To auto focus first or last item when menu is open through keyboard. @note Only applies for root menu instance (not submenus). @default undefined */
        focusItemWhenOpen: 'first' | 'last' | undefined;
        /** @description To make the label of the groups (stacked layouts) visible. @default true */
        showGroupLabels: boolean;
        /**
         * @description
         * The desired position and alignment to open the main menu.
         *
         * - Allowed Positions: `'top'`, `'bottom'`, `'left'` or `'right'`
         * - Allowed Alignments: `'start'`, `'end'` or `'center'`
         *
         * @note
         * All submenus are opening at left or right by default.
         *
         * @default 'bottom-start'
         */
        position: MenuPosition;
        /** @description Establishes the alignment order priority for when repositioning is needed. @default ['start', 'end', 'center'] */
        alignmentOrder: OverlayBaseAlignment[];
        /**
         * @description
         * The animation for when the menu opens and closes.
         *
         * 1. If a **string** is provided, it defines both, the 'entry' and 'exit' animations, with the same transition.
         * 2. If an **object** is provided, you can explicitly define different types for 'in' and 'out' transitions.
         *
         * @values
         * - 'top-bottom' 👉 slides from top to bottom
         * - 'bottom-top' 👉 slides from bottom to top
         * - 'left-right' 👉 slides from left to right
         * - 'right-left' 👉 slides from right to left
         * - 'scale-up' 👉 scales from _small_ (0.9 ratio) to normal size
         * - 'scale-down' 👉 scales from _big_ (1.1 ratio) to normal size
         * - 'none'
         *
         * @example
         * // When string provided:
         * animate: 'top-bottom' 👈 // as the entry and exit animations
         *
         * // When object provided:
         * animate: { in: 'top-bottom', out: 'scale-down' }
         *
         * @default 'none'
         */
        animate: MenuAnimate;
        /** @description The time for the animation (in milliseconds). @default 150 */
        animateMs: number;
        /** @description The space between the main trigger and the menu (in pixels). @default 2 */
        offsetMenu: number;
        /** @description The space between menu item and its submenu (in pixels). @default 4 */
        offsetSubmenu: number;
        /**
         * @description
         * Aligns the items (if `true`) or the menu's side (if `false`) with the trigger.
         *
         * @note
         * Only applies for root menu.
         *
         * @example
         * // When "true"              // When "false"
         *   [ trigger ]               [ trigger ]
         * -------------------         -------------------
         * | [ Menu Item 1 ] |         | [ Menu Item 1 ] |
         * | [ Menu Item 2 ] |         | [ Menu Item 2 ] |
         * | [ Menu Item 3 ] |         | [ Menu Item 3 ] |
         * -------------------         -------------------
         *
         * @default false
         */
        alignMenuItemsWithTrigger: boolean;
        /** @description To define custom class name/s for the menu. */
        className: string | string[] | undefined;
        /**
         * @description
         * The desired max width.
         *
         * @note
         * Please note that:
         * - Normal items could wrap.
         * - Items within inline groups could generate horizontal scroll.
         * - Items within grid groups could generate horizontal scroll (depending on the defined columns).
         *
         * @default 'auto'
         */
        maxWidth: string;
        /** @description The desired max height. @default 'auto' */
        maxHeight: string;
    };

export type MenuMobileLabels = Partial<{
    /** @description Text for the button that returns to the previous menu level. @default 'Go back to previous menu' */
    back: string;
    /** @description Text for the button that closes the menu completely. @default 'Close menu' */
    close: string;
}>;

export type MenuMatchingIndices = {
    /** @description The map from each KeyNav index to the equivalent menu item index. */
    menuIdx: Record<string, number>;
    /** @description The map from each menu item to its KeyNav index equivalent. */
    keyNavIdx: Record<string, number>;
};

export type MenuCreateConfig = {
    /** @description The set of items for the menu. */
    items: Menu;
} & Partial<{
    /** @description The current path of the menu. */
    path: number[];
    /** @description The label of the menu. */
    label: string | null;
    /** @description A custom config (instance level) for the menu. */
    config: MenuConfig;
}>;

export type MenuDestroyConfig = Partial<{
    /** @description Preserves open from the given level. */
    preserveFromLevel: number;
    /** @description Establishes the close reason. */
    closeReason: MenuCloseReason;
}>;

export type MenuNavigatedFrom = 'kb' | 'pointer';

export type MenuHas = {
    /** @description To know if the menu contains any icons. */
    icons: boolean;
    /** @description To know if the menu contains any shortcuts. */
    shortcuts: boolean;
};

export type MenuItemShortcutConfig = {
    /** @description The value for the `aria-keyshortcuts` attribute. */
    aria: string;
    /** @description The value to show within the item. */
    visual: string;
};

export type MenuComputedStyles = {
    borderWidth: string;
    paddingTop: string;
    paddingBottom: string;
    paddingLeft: string;
    paddingRight: string;
};

export type MenuGroupTypeCommon = 'common' | undefined;
export type MenuGroupTypeSelectable = 'radio' | 'checkbox';
export type MenuGroupJustifyItems = 'start' | 'end' | 'space-between';
export type MenuGroupItemsFlow = 'row' | 'column';

export type MenuGroupTypeComment = {
    /**
     * @description
     * Defines the functional behavior and interaction model of the items within the group.
     * - `'common'` (Standard Actions) - Regular menu items used for executing actions or opening submenus. It also accepts _separators_ and _info_ items.
     * - `'radio'` (Single Selection) - A mutually exclusive list of options where only one item can be selected at a time.
     * - `'checkbox'` (Multiple Selection) - A list of independent options where any number of items can be toggled on or off.
     *
     * @default 'common'
     */
    type?: string;
};

export type MenuGroupCommonType = MenuGroupTypeComment & {
    type?: MenuGroupTypeCommon;
};

export type MenuGroupSelectableType = MenuGroupTypeComment & {
    type: MenuGroupTypeSelectable;
};

export type MenuGroupActionItems = {
    /**
     * @description
     * An array of _action_ and/or _submenu_ items.
     *
     * These items are only allowed when the group is:
     * - of type `'common'`
     * - of items layout `'stack'`.
     *
     * @note
     * ✔️ You can also add items of type "separator" or "info".
     *
     * ❌ You **can't** add items of type "checkbox" or "radio".
     *
     * @example
     * ```
     * items: [
     *     { label: 'Print' },              // Action item
     *     {                                // Submenu item
     *         label: 'Share',
     *         submenu: [
     *             { label: 'Whatsapp' },   // Action item
     *             { label: 'LinkedIn' },   // Action item
     *             { label: 'Email' },      // Action item
     *         ],
     *     },
     * ],
     * ```
     */
    items: (MenuItem | MenuItemInfo | MenuItemSeparator)[];
};

export type MenuGroupActionInlineItems = {
    /**
     * @description
     * An array of _action_ items.
     *
     * These items are only allowed when the group is:
     * - of type `'common'`
     * - of items layout `'inline'`.
     *
     * @note
     * ✔️ You can also add items of type "separator" or "info".
     *
     * ❌ You **can't** add items of type "submenu", "checkbox" or "radio".
     *
     * @example
     * ```
     * items: [
     *     { label: 'Manage your account' }, // Action item
     *     { info: 'Last synced 2m ago' },   // Info item
     *     { separator: true },              // Separator item
     *     { label: 'Log out' },             // Action item
     * ],
     * ```
     */
    items: (MenuItemAction | MenuItemInfo | MenuItemSeparator)[];
};

export type MenuGroupActionGridItems = {
    /**
     * @description
     * An array of _action_ items.
     *
     * These items are only allowed when the group is:
     * - of type `'common'`
     * - of items layout `'grid'`.
     *
     * @note
     * In a grid:
     *
     * ❌ You **can't** add items of type "separator" or "info".
     *
     * ❌ You **can't** add items of type "submenu", "checkbox" or "radio".
     *
     * @example
     * ```
     * items: [
     *     { label: 'Lemon', icon: '🍋' },   // Action item
     *     { label: 'Grapes', icon: '🍇' },  // Action item
     *     { label: 'Peach', icon: '🍑' },   // Action item
     *     { label: 'Banana', icon: '🍌' },  // Action item
     * ],
     * ```
     */
    items: MenuItemAction[];
};

export type MenuGroupSelectableItems = {
    /**
     * @description
     * An array of _selectable_ items (checkbox or radio).
     *
     * These items are only allowed when the group is of type `'radio'` or `'checkbox'`.
     *
     * - Radio items are of single selection: A mutually exclusive list of options where only one item can be selected at a time.
     * - Checkbox items are of multiple selection: A list of independent options where any number of items can be toggled on or off.
     *
     * @note
     * ❌ You **can't** add items of type "separator" or "info".
     *
     * @example
     * ```
     * items: [
     *     { label: 'Name' },
     *     { label: 'Size', checked: true },
     *     { label: 'Date' },
     *     { label: 'Type' },
     * ],
     * ```
     */
    items: MenuItemSelectable[];
};

export type MenuGroupLayout = 'inline' | 'stack';
export type MenuInlineLabelType = 'below' | 'start' | 'end' | 'tooltip';
export type MenuGridLabelType =
    | MenuInlineLabelType
    | 'panel-below'
    | 'panel-above'
    | 'floating-below'
    | 'floating-above';

export type MenuAnimateType =
    | 'top-bottom'
    | 'bottom-top'
    | 'left-right'
    | 'right-left'
    | 'scale-up'
    | 'scale-down'
    | 'none';

export type MenuAnimateInOut = {
    /** @description The "in" animation for when the menu opens. */
    in: MenuAnimateType;
    /** @description The "out" animation for when the menu closes. */
    out: MenuAnimateType;
};

export type MenuAnimate = MenuAnimateType | MenuAnimateInOut;

export type MenuItemIcon = Icon;

export type MenuItemBase = {
    /** @description The text label of the menu item. */
    label: string;
} & Partial<{
    /**
     * @description
     * A unique identifier for the menu item.
     *
     * @note
     * Use it to:
     * - Better identify the item when emitted.
     * - Retrieve the item through the `menuContext` when available.
     */
    value: string;
    /** @description Defines custom class name/s for the menu item. */
    className: string | string[];
    /** @description Defines whether the menu item is disabled or not. */
    disabled: boolean;
    /**
     * @description
     * Establishes an icon for the menu item.
     *
     * It supports four input formats:
     * 1. `string`
     *    - 👉 Whether you have defined `a11yIconTemplate` within your main directive/component or `iconDefaultStrategy` in your config,
     *      you can use this to provide **only** the "data" to be inserted within your template/component/image.
     *    - 👉 Use this if your project includes a CSS-based icon library (like FontAwesome) or if you need to
     *      render a raw HTML snippet.
     * 2. `HTML` 👉 Use this to render a raw HTML snippet.
     * 3. `Image` 👉 Use this to render an image from your assets folder or an external URL.
     * 4. `Component` 👉 Use this to dynamically render an Angular Component.
     *    Perfect for libraries like Angular Material (or your own icon component).
     * 5. `TemplateRef<unknown>` 👉 Use this to pass an `<ng-template>` directly from your HTML view
     *    for complete structural control.
     *
     * @example
     * // For string with "a11yIconTemplate" or "iconDefaultStrategy" defined:
     * icon: 'fa-solid fa-info',
     * // For string with NO template or strategy defined:
     * icon: '<i class="fa-solid fa-info"></i>',
     * // For HTML:
     * icon: { html: '<i class="fa-solid fa-info"></i>' },
     * // For Image:
     * icon: { src: '/assets/icons/info.svg' },
     * // For Component:
     * icon: { component: MatIcon, content: 'info' },
     * // For TemplateRef<unknown>:
     * icon: this.myIconTemplateRef,
     */
    icon: MenuItemIcon;
}> &
    RejectProperties<'type' | 'items' | 'separator' | 'info' | 'showLabel'>;

export type MenuGroupBase = Partial<{
    /** @description The text label of the group. */
    label: string;
    /**
     * @description
     * Defines whether the group label is visible or not.
     *
     * 💡 **It will always be reachable for Screen Readers.**
     *
     * @note
     * - Applies only for stacked groups.
     * - You can change it at a global level using `showGroupLabels` within the config.
     *
     * @default true
     */
    showLabel: boolean;
    /** @description defines custom class name/s for the group. */
    className: string | string[];
    /**
     * @description
     * Determines whether the menu should automatically close after the user interacts with any item within the group.
     *
     * @note
     * 💡 **Hierarchy:** If defined on a specific item, it will override any `closeOnSelect` configuration set at the Group level.
     *
     * - For groups with _selectable_ items (checkbox or radio), the default value is `false`
     * - For groups with _common_ items (actions), the default value is `true`
     */
    closeOnSelect: boolean;
}> &
    RejectProperties<'submenu' | 'value' | 'disabled' | 'separator' | 'icon'>;

type MenuGroupLayoutComment = {
    /**
     * @description
     * Establishes how to show the group label in a group of `'inline'` or `'grid'` items.
     *
     * @values
     * - `'stack'` 👉 Vertical alignment (⚠️ **Note:** Group icons are hidden for these type of layouts):
     *   ```html
     *   |-----------------------------|
     *   | [label]                     |
     *   | [itm1] [itm2] [itm3] [itm4] |
     *   | [itm5] [itm6] [itm7]        |
     *   |-----------------------------|
     *   ```
     * - `'inline'` 👉 Horizontal alignment:
     *   ```html
     *   |-------------------------------------|
     *   |                [itm1] [itm2] [itm3] |
     *   | [icon] [label] [itm4] [itm5] [itm6] |
     *   |                [itm7]               |
     *   |-------------------------------------|
     *   ```
     *
     * @default 'stack'
     */
    layout: MenuGroupLayout;
};

type MenuGroupLayoutBase = MenuGroupLayoutComment &
    ({ layout: 'inline' } | ({ layout: 'stack' } & Pick<MenuGroupBase, 'showLabel'>));

export type MenuGroupInlineBase = Pick<MenuItemBase, 'icon'> &
    Partial<
        MenuGroupLayoutBase & {
            /**
             * @description
             * Establishes how to show the label for each item within an `'inline'` group.
             *
             * @values
             * - Within the item:
             *   - `'below'` 👉 Vertical alignment: icon (above) / label (below)
             *   - `'end'` 👉 Horizontal alignment: icon (left) / label (right)
             *   - `'start'` 👉 Horizontal alignment: label (left) / icon (right)
             * - Externally:
             *   - `'tooltip'` 👉 As a tooltip
             *
             * @default 'below'
             */
            itemsLabelPosition: MenuInlineLabelType;
            /** @description Defines whether the label text should wrap (`true`) or not (`false`). @default true */
            itemsLabelWrap: boolean;
            /**
             * @description
             * Establishes the content alignment of items:
             *
             * - `'start'` 👉 All items to the left side
             * - `'end'` 👉 All items to the right side
             * - `'space-between'` 👉 Same space between items
             *
             * @default 'start'
             */
            itemsJustify: MenuGroupJustifyItems;
        }
    >;

export type MenuGroupGridBase = Omit<MenuGroupInlineBase, 'itemsLabelPosition' | 'itemsJustify'> &
    Partial<
        MenuGroupLayoutBase & {
            /** @description Defines how many columns of items the group will have. @default 5 */
            columns: number;
            /**
             * @description
             * Establishes how to show the label for each item within a `'grid'` group.
             *
             * - Within the item:
             *   - `'below'` 👉 Vertical alignment: icon (above) / label (below)
             *   - `'start'` 👉 Horizontal alignment: label (left) / icon (right)
             *   - `'end'` 👉 Horizontal alignment: icon (left) / label (right)
             * - Externally:
             *   - `'tooltip'` 👉 As a tooltip for each item
             *   - `'panel-below'` 👉 As a fixed panel below all items
             *   - `'panel-above'` 👉 As a fixed panel above all items
             *   - `'floating-below'` 👉 As a centered tooltip below all items
             *   - `'floating-above'` 👉  As a centered tooltip above all items
             *
             * @default 'below'
             */
            itemsLabelPosition: MenuGridLabelType;
            /**
             * @description
             * Defines the direction in which the items flow inside the grid.
             *
             * **IMPORTANT:** This won't change the keyboard navigation direction (moving with arrows up & down).
             *
             * - `'row'`: Items are placed moving from left to right across the columns, then wrapping to the next row.
             *     ```
             *     [ Item 1 ] [ Item 2 ] [ Item 3 ]
             *     [ Item 4 ] [ Item 5 ]
             *     ```
             * - `'column'`: Items are placed moving from top to bottom down the rows, then moving to the next column.
             *     ```
             *     [ Item 1 ] [ Item 4 ]
             *     [ Item 2 ] [ Item 5 ]
             *     [ Item 3 ]
             *     ```
             *
             * @default 'row'
             */
            itemsFlow: MenuGroupItemsFlow;
        }
    >;

export type MenuGroupItemsLayout = 'stack' | 'inline' | 'grid';

export type MenuGroupItemsLayoutComment = {
    /**
     * @description
     * Defines how the menu items are arranged within the group.
     * - `'stack'` (Vertical List) - Items are stacked vertically, one per line.
     *   ```
     *   [ Item 1 ]
     *   [ Item 2 ]
     *   ```
     *
     * - `'inline'` (Single Row) - Items are placed side-by-side in a single horizontal row.
     * Triggers horizontal scroll if items exceed the menu width.
     *   ```
     *   [ Item 1 ] [ Item 2 ] [ Item 3 ] ...
     *   ```
     *
     * - `'grid'` (Multicolumn) - Arranged in a grid system. Items will wrap into
     * multiple rows based on the defined number of columns.
     *   - `itemsFlow: 'row'` (default) and `columns: 3`
     *     ```
     *     [ Item 1 ] [ Item 2 ] [ Item 3 ]
     *     [ Item 4 ] [ Item 5 ]
     *     ```
     *   - `itemsFlow: 'column'` and `columns: 2`
     *     ```
     *     [ Item 1 ] [ Item 4 ]
     *     [ Item 2 ] [ Item 5 ]
     *     [ Item 3 ]
     *     ```
     *
     * @default 'stack'
     */
    itemsLayout?: string;
};

export type MenuGroupItemsStackLayout = MenuGroupItemsLayoutComment & {
    itemsLayout?: 'stack';
};

export type MenuGroupItemsInlineLayout = MenuGroupItemsLayoutComment & {
    itemsLayout: 'inline';
};

export type MenuGroupItemsGridLayout = MenuGroupItemsLayoutComment & {
    itemsLayout: 'grid';
};

export type MenuItemUpdateOmitProperties =
    | 'value'
    | 'action'
    | 'submenu'
    | 'shortcut'
    | 'checked'
    | 'beforeChange'
    | 'type'
    | 'showLabel'
    | 'separator'
    | 'closeOnSelect'
    | 'items';

export type MenuItemTypes = 'action' | 'selectable' | 'info' | 'submenu';

export type MenuItemUpdate = {
    /** @description The `value` property that identifies each item. */
    value: string;
    /** @description The type of item. */
    type: MenuItemTypes;
    /** @description The data to update the item. */
    data: Omit<MenuItemSubmenu | MenuItemAction | MenuItemInfo | MenuItemSelectable, MenuItemUpdateOmitProperties>;
};

export type MenuItemSelectableBeforeChange = Partial<{
    /**
     * @description
     * A guard function that intercepts the state change of a selectable item _before_ it is applied.
     *
     * When using this method, you'll receive the full item with the "previous" state of the "checked" value within `itemCtx` and the "current" state in `newState`.
     *
     * > 🌟 After validating whatever you have to, return `true` to allow the state to change, or `false` to abort it.
     * >
     * > 🌟 Returning nothing (`void`) is interpreted as `true` by default.
     *
     * @note
     * ✔️ It perfectly supports asynchronous operations (Promises or Observables).
     *
     * 💪 While resolving, the item will automatically enter a non-interactive `busy` state.
     *
     * ⚠️ When `beforeChange` is defined, the menu **won't** emit any value.
     *
     * @param itemCtx - The context of the item being interacted with.
     * @param menuCtx - The global context of the menu instance.
     * @param newState - The intended new state (`true` for checked, `false` for unchecked).
     *
     * @example
     * // To validate things on a backend
     * beforeChange: async (itemCtx, menuCtx, newState) => {
     *     return await this.myService.validateSelection(itemCtx.item.value, newState); // Returns true/false
     * }
     * // To validate things locally on the component/directive
     * // If "allowChangeColors" is true, it will allow check/uncheck the item
     * beforeChange: (itemCtx, menuCtx, newState) => {
     *     return this.allowChangeColors;
     * }
     * // To update things locally, not needed to return anything,
     * // it will be interpreted as `true` by default
     * beforeChange: (itemCtx, menuCtx, newState) => {
     *     this.allowChangeColors = newState;
     * }
     */
    beforeChange: (
        itemCtx: MenuItemContext,
        menuCtx: MenuContext,
        newState: boolean
    ) => void | boolean | Promise<boolean> | Observable<boolean>;
}>;

export type MenuGroupSelectableBusyScope = Partial<{
    /**
     * @description
     * Defines the scope of the busy state when an item within the group executes an async action.
     * - `'item'`: Only the triggered item enters the busy state.
     * - `'group'`: All items in the group are disabled and enter the busy state.
     *
     * @Default
     * `'group'` for radio groups (**not negotiable**) and `'item'` for checkbox groups.
     */
    busyScope: 'item' | 'group';
}>;

export type MenuContextForItem<T> = {
    /** @description The item. */
    item: T;
    /**
     * @description
     * Updates any property within the item, except for:
     * - `value`
     * - `action`
     * - `beforeChange`
     * - `submenu`
     * - `type`
     * - `items`
     * - `separator`
     * - `showLabel`
     * - `shortcut`
     * - `closeOnSelect`
     * - `checked`
     */
    update: (data: Omit<Partial<T>, MenuItemUpdateOmitProperties>) => void;
};

export type MenuGroupSelectables = MenuGroupSelectableStack | MenuGroupSelectableInline | MenuGroupSelectableGrid;

export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;

/**
 * @description
 * Utility type to explicitly reject a set of properties.
 * It makes the specified keys optional but strictly typed as `never`,
 * effectively forbidding their use in the resulting type.
 */
export type RejectProperties<K extends PropertyKey> = {
    [P in K]?: never;
};
