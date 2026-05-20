import type { KeyboardNavigationKeysType } from './keyboard-navigation.type.private';

export type KeyboardNavigationType =
    | 'custom'
    | 'dropdown'
    | 'menu'
    | 'menubar'
    | 'radio'
    | 'tree'
    | 'tabs'
    | 'toolbar'
    | 'slider';

export type KeyboardNavigationKey =
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Home'
    | 'End'
    | 'Escape'
    | 'Space'
    | 'Enter'
    | 'PageUp'
    | 'PageDown';

export type KeyboardNavigationAction =
    | 'previous'
    | 'next'
    | 'close'
    | 'open'
    | 'first'
    | 'last'
    | 'select'
    | 'deselect'
    | 'pageUp'
    | 'pageDown';

export type KeyboardNavigationEvent<T = unknown> = {
    /**
     * @description The key pressed.
     *
     * Keys:
     * - 'ArrowUp'
     * - 'ArrowDown'
     * - 'ArrowLeft'
     * - 'ArrowRight'
     * - 'Home'
     * - 'End'
     * - 'Escape'
     * - 'Space'
     * - 'Enter'
     * - 'PageUp'
     * - 'PageDown'
     */
    key: KeyboardNavigationKey;
    /**
     * @description The action taken.
     *
     * Actions:
     * - 'previous'
     * - 'next'
     * - 'close'
     * - 'open'
     * - 'first'
     * - 'last'
     * - 'select'
     * - 'deselect'
     * - 'pageUp'
     * - 'pageDown'
     */
    action: KeyboardNavigationAction;
    /** @description The previous item. */
    itemFrom: T | undefined;
    /** @description The current item. */
    itemTo: T | undefined;
    /** @description The previous index. */
    indexFrom: number;
    /** @description The current index. */
    indexTo: number;
    /** @description The previous path. */
    pathFrom: number[];
    /** @description The current path. */
    pathTo: number[];
};

export type KeyboardNavigationConfig = {
    /** @description The type of navigation (menu, dropdown, tree, default, etc.). @default 'menu' */
    type: KeyboardNavigationType;
    /** @description The throttle to prevent rapid repeated events. @default 100 */
    throttleMs: number;
    /** @description Provides the amount of items to page up or down. @default 10 */
    pageSize: number;
    /** @description Allows navigate through disabled items. @default false */
    allowNavigateDisabled: boolean;
    /** @description Allows auto select first child item when open a sublist of items. @default false */
    allowSelectFirstChild: boolean;
    /** @description Allows repeated events for the given keys. @default [] */
    allowRepeatedEventsFor: KeyboardNavigationKey[];
    /** @description The property that defines if the item is disabled (if item object is provided). @default 'disabled' */
    disabledProperty: string;
    /** @description The property that defines if the item contains children subitems (if item object is provided). @default 'children' */
    childrenProperty: string;
    /** @description Provides a custom navigation strategy (if `type="custom"`). */
    customStrategy: KeyboardNavigationStrategy | undefined;
    /**
     * @description Defines the orientation of the navigation, if the strategy contains the `keysHorizontal` and `keysVertical` objects.
     *
     * Usually a `'horizontal'` orientation allows left/right keys to navigate, while `'vertical'` allows up/down.
     *
     * @default 'horizontal'
     */
    orientation: 'horizontal' | 'vertical';
};

export type KeyboardNavigationStrategy = {
    /** @description Allows looping when first/last items are reached. */
    loop: boolean;
    /**
     * @description To map the navigation keys with their actions, using `event.code` from `KeyboardEvent`.
     *
     * Allowed _keys_:
     * - 'ArrowUp'
     * - 'ArrowDown'
     * - 'ArrowLeft'
     * - 'ArrowRight'
     * - 'Home'
     * - 'End'
     * - 'Escape'
     * - 'Space'
     * - 'Enter'
     * - 'PageUp'
     * - 'PageDown'
     *
     * Allowed _actions_:
     * - 'previous'
     * - 'next'
     * - 'close'
     * - 'open'
     * - 'first'
     * - 'last'
     * - 'select'
     * - 'deselect'
     * - 'pageUp'
     * - 'pageDown'
     *
     * @example
     * keys: {
     *     Home: 'first',
     *     End: 'last',
     *     Space: 'open',
     *     Escape: 'close',
     * },
     */
    keys: KeyboardNavigationKeysType;
} & Partial<{
    /** @description To map the keys with their actions for an horizontal navigation. @note Check the `keys` property for more details. */
    keysHorizontal: KeyboardNavigationKeysType;
    /** @description To map the keys with their actions for a vertical navigation. @note Check the `keys` property for more details. */
    keysVertical: KeyboardNavigationKeysType;
}>;

export type KeyboardNavigationCurrent = Partial<{
    /** @description The current state index. */
    index: number;
    /** @description The current state path. */
    path: number[];
}>;
