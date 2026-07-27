import {
    MenuGroup,
    MenuGroupSelectableStack,
    MenuGroupSelectableInline,
    MenuGroupSelectableGrid,
    MenuGroupActionStack,
    MenuGroupActionInline,
    MenuGroupActionGrid,
    MenuItem,
    MenuItemAction,
    MenuItemSubmenu,
    MenuItemSelectable,
    MenuItemInfo,
    MenuItemSeparator,
} from '@a11y-ngx/menu';

/**
 * @description
 * Creates a group of items.
 *
 * You can choose the group `type`:
 *
 * - `'common'` _(default)_: Regular menu items used for executing actions or opening submenus.
 * - `'radio'`: A mutually exclusive list of options where only one item can be selected at a time.
 * - `'checkbox'`: A list of independent options where any number of items can be toggled on or off.
 *
 * You can choose the group `layout`:
 *
 * - `'stack'` _(default)_: Vertical - Group label above, list of items below.
 * - `'inline'`: Single Row - Horizontal - Group icon, label and items are placed side-by-side.
 *
 *
 * You can choose the `itemsLayout`:
 *
 * - `'stack'` _(default)_: Vertical List - Items are stacked vertically, one per line.
 * - `'inline'`: Single Row - Items are placed side-by-side in a single row.
 * - `'grid'`: Multicolumn - Arranged in a grid system. Items will wrap into multiple rows based on the defined number of columns.
 *
 * @note
 * Even though a label is not required, consider adding a meaningful name to the group using the `'label'` property,
 * to provide both visual aid and support for people who rely on assistive technologies.
 *
 * @example
 * const myMenu = [
 *     menuBuilder.group({ items: [...] }), // default type "common" and item's layout "stack"
 *     menuBuilder.group({ type: 'checkbox', itemsLayout: 'inline', items: [...] }),
 *     menuBuilder.group({ type: 'radio', itemsLayout: 'grid', columns: 2, items: [...] }),
 * ];
 */
function group(group: MenuGroupActionStack): MenuGroupActionStack;
function group(group: MenuGroupActionInline): MenuGroupActionInline;
function group(group: MenuGroupActionGrid): MenuGroupActionGrid;
function group(group: MenuGroupSelectableStack): MenuGroupSelectableStack;
function group(group: MenuGroupSelectableInline): MenuGroupSelectableInline;
function group(group: MenuGroupSelectableGrid): MenuGroupSelectableGrid;
function group(group: MenuGroup): MenuGroup {
    return group;
}

/**
 * @description
 * Creates a standard menu item.
 *
 * This item can function either as:
 * - An actionable item (triggering a callback or emitting the item itself), or as
 * - A trigger for a nested submenu.
 *
 * @note
 * If you are within a selectable group (radio or checkbox), use `menuBuilder.itemCheck()` instead,
 * it lets you set the `checked` property.
 *
 * @example
 * myMenu = [
 *     menuBuilder.item({ label: 'Reply' }),      // Action item
 *     menuBuilder.item({ label: 'Reply All' }),  // Action item
 *     menuBuilder.item({ label: 'Forward' }),    // Action item
 *     menuBuilder.item({                         // Submenu item
 *         label: 'Move to',
 *         submenu: [                             // Items for the submenu
 *             menuBuilder.item({ label: 'Shopping' }),
 *             menuBuilder.item({ label: 'Work' }),
 *             menuBuilder.item({ label: 'Social Network' }),
 *         ],
 *     }),
 * ];
 */
function item(item: MenuItemAction): MenuItemAction;
function item(item: MenuItemSubmenu): MenuItemSubmenu;
function item<T extends MenuItem>(item: T): T {
    return item;
}

/**
 * @description
 * Creates a selectable menu item.
 *
 * This item can function either as a:
 * - Single selection type (for `'radio'` groups), or
 * - Multi selection type (for `'checkbox'` groups).
 *
 * @example
 * myMenu = [
 *     menuBuilder.group({                // Group of checkboxes
 *         type: 'checkbox',
 *         label: 'Tag as',
 *         items: [                       // Selectable items
 *             menuBuilder.itemCheck({ label: 'Notifications', checked: true }),
 *             menuBuilder.itemCheck({ label: 'Forums' }),
 *         ],
 *     }),
 * ];
 */
function itemCheck(item: MenuItemSelectable): MenuItemSelectable;
function itemCheck<T extends MenuItemSelectable>(item: T): T {
    return item;
}

/**
 * @description
 * Creates a non-interactive informational item.
 *
 * @example
 * myMenu = [
 *     ...,
 *     menuBuilder.info({ info: 'Last synced 2m ago' }),
 *     ...,
 * ];
 */
function info<T extends MenuItemInfo>(info: T): T {
    return info;
}

/**
 * @description
 * Creates a separator to provide visual _grouping_ context.
 *
 * @note
 * 💡 When you create groups, separators are automatically added before and after the group.
 *
 * - ✔️ You can use them when:
 *   - They are among loose items (not grouped).
 *   - They are within a group of type `'common'` and item's layout is either `'stack'` or `'inline'`.
 *
 * - ❌ You **can't** use them within a group of type `'checkbox'` or `'radio'`.
 *
 * ℹ️ By default, separators are horizontal; on the `'inline'` item's layout they become vertical.
 *
 * @example
 * myMenu = [
 *     menuBuilder.item({ label: 'Profile' }),
 *     menuBuilder.item({ label: 'Manage your account' }),
 *     menuBuilder.separator(),
 *     menuBuilder.item({ label: 'Log out' }),
 * ];
 */
function separator(): MenuItemSeparator {
    return { separator: true };
}

export const menuBuilder = { item, itemCheck, info, separator, group };
