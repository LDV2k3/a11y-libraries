import { Injectable } from '@angular/core';

import { ERROR_ITEMS_NOT_PROVIDED, ERROR_KEYS_NOT_PROVIDED } from './keyboard-navigation.errors';

import { NAVIGATION_DEFAULT, NAVIGATION_STRATEGIES } from './keyboard-navigation.type.private';
import type { KeyboardNavigationKeysType } from './keyboard-navigation.type.private';
import type {
    KeyboardNavigationConfig,
    KeyboardNavigationCurrent,
    KeyboardNavigationAction,
    KeyboardNavigationKey,
    KeyboardNavigationEvent,
    KeyboardNavigationStrategy,
} from './keyboard-navigation.type';

@Injectable()
export class KeyboardNavigationService {
    private items: unknown[] = [];
    private config: KeyboardNavigationConfig = { ...NAVIGATION_DEFAULT };
    private strategy!: KeyboardNavigationStrategy;
    /** @description Items at the current navigation level. */
    private currentItems: unknown[] = [];
    /** @description Current index within `currentItems`. */
    private currentIndex: number = -1;
    /** @description Path to current navigation level in nested structures. */
    private currentPath: number[] = [];
    /** @description Timestamp of last navigation to implement throttling. */
    private lastNavTime: number = 0;
    /** @description Last emitted navigation event to prevent duplicate emissions. */
    private lastNavigate: KeyboardNavigationEvent | null = null;

    private keys: KeyboardNavigationKeysType = {};
    private orientationKey: 'keysHorizontal' | 'keysVertical' = 'keysHorizontal';

    /**
     * @description
     * Processes keyboard keydown event and calculates navigation target.
     * Handles throttling to prevent rapid repeated events.
     */
    manageKeyDown<T = unknown>(event: KeyboardEvent): KeyboardNavigationEvent<T> | null {
        const { repeat, code } = event;
        const { throttleMs } = this.config;

        // Throttle rapid key repeat events
        if (throttleMs > 0) {
            if (repeat) {
                const now: number = Date.now();
                if (now - this.lastNavTime < throttleMs) return null;
                this.lastNavTime = now;
            } else {
                this.lastNavTime = Date.now();
            }
        }

        const navigateTo: KeyboardNavigationEvent<T> | null = this.executeKey<T>(code as KeyboardNavigationKey);
        if (!navigateTo) return null;

        event.preventDefault();
        return navigateTo;
    }

    /**
     * @description
     * A manual way to execute a key (`ArrowDown`, `Home`, etc.).
     *
     * - Returns `KeyboardNavigationEvent` if the key/action are valid, or `null` otherwise.
     * - Prevents duplicate events from being emitted.
     */
    executeKey<T = unknown>(key: KeyboardNavigationKey): KeyboardNavigationEvent<T> | null {
        if (!this.currentItems.length) {
            console.warn(ERROR_ITEMS_NOT_PROVIDED());
            return null;
        }

        const action: KeyboardNavigationAction | undefined = this.keys[key];
        if (!action) return null;

        const indexFrom: number = this.currentIndex;
        const itemFrom: T | undefined = this.currentItems[indexFrom] as T | undefined;
        let indexTo: number = this.currentIndex;

        const pathFrom: number[] = [...this.currentPath];

        if (action === 'previous') indexTo = this.indexPrevious;
        else if (action === 'next') indexTo = this.indexNext;
        else if (action === 'first') indexTo = this.indexFirst;
        else if (action === 'last') indexTo = this.indexLast;
        else if (action === 'pageUp') indexTo = this.indexPageUp;
        else if (action === 'pageDown') indexTo = this.indexPageDown;
        else if (action === 'close' && this.currentPath.length) {
            indexTo = this.currentPath.pop() as number;
            this.updateCurrentItems();
        } else if (action === 'open') {
            const openedFirstIdx: number | null = this.itemOpen;
            if (openedFirstIdx !== null) {
                // If auto-selecting first child is required from config, use the returned index
                // otherwise, set indexTo to -1 to indicate "opened but not selected"
                if (this.config.allowSelectFirstChild) indexTo = openedFirstIdx;
                else indexTo = -1;
            }
        }

        this.currentIndex = indexTo;
        const itemTo: T | undefined = this.currentItems[indexTo] as T | undefined;
        const pathTo: number[] = [...this.currentPath];

        const navigateTo: KeyboardNavigationEvent<T> = {
            key,
            action,
            itemFrom,
            itemTo,
            indexFrom,
            indexTo,
            pathFrom,
            pathTo,
        };

        // Prevent duplicate navigation events when same key is held down
        if (this.isSameEvent(navigateTo)) return null;

        this.lastNavigate = navigateTo;
        return navigateTo;
    }

    /**
     * @description
     * Compares the last saved navigation with the given one.
     */
    private isSameEvent(navigateTo: KeyboardNavigationEvent): boolean {
        // "indexFrom" is not part of the equation, to avoid a false positive => -1 vs 0
        return (
            this.lastNavigate !== null &&
            !this.config.allowRepeatedEventsFor.includes(navigateTo.key) &&
            this.lastNavigate.key === navigateTo.key &&
            this.lastNavigate.action === navigateTo.action &&
            this.lastNavigate.indexTo === navigateTo.indexTo &&
            this.lastNavigate.pathFrom.length === navigateTo.pathFrom.length &&
            this.lastNavigate.pathFrom.every((v, i) => v === navigateTo.pathFrom[i]) &&
            this.lastNavigate.pathTo.length === navigateTo.pathTo.length &&
            this.lastNavigate.pathTo.every((v, i) => v === navigateTo.pathTo[i])
        );
    }

    /**
     * @description
     * Resolves a nested path of indices, stopping at the first invalid index.
     *
     * Returns either the items found at the deepest valid level, or the valid path itself.
     */
    private traversePath(path: number[], get: 'items' | 'path'): unknown[] | number[] {
        const validatedPath: number[] = [];
        let items: unknown[] = this.items;

        for (const idx of path) {
            if (idx < 0 || idx >= items.length) break;

            const current: Record<string, unknown> = items[idx] as Record<string, unknown>;
            const children: unknown = current[this.keyChildren];

            if (!Array.isArray(children) || !children.length) break;

            validatedPath.push(idx);

            items = children;
        }

        return get === 'items' ? items : validatedPath;
    }

    /**
     * @description
     * Validates and normalize a path against the actual item structure.
     *
     * Removes invalid indices and stops at the first invalid level.
     *
     * @param { number[] } path - Path to validate
     * @returns Validated path (may be shorter than input)
     */
    private validatePath(path: number[]): number[] {
        const currentPath: number[] = this.traversePath(path, 'path') as number[];
        if (this.lastNavigate) this.lastNavigate.pathTo = currentPath;
        return currentPath;
    }

    /**
     * @description
     * Get index of previous available item.
     */
    private get indexPrevious(): number {
        const from: number = this.currentIndex === -1 ? this.currentItems.length - 1 : this.currentIndex - 1;
        return this.findAvailableIndex(from, -1);
    }

    /**
     * @description
     * Get index of next available item.
     */
    private get indexNext(): number {
        const from: number = this.currentIndex === -1 ? 0 : this.currentIndex + 1;
        return this.findAvailableIndex(from, 1);
    }

    /**
     * @description
     * Get index of first available item.
     */
    private get indexFirst(): number {
        return this.findAvailableIndex(0, 1);
    }

    /**
     * @description
     * Get index of last available item.
     */
    private get indexLast(): number {
        return this.findAvailableIndex(this.currentItems.length - 1, -1);
    }

    /**
     * @description
     * Get index of the first available item in previous page.
     */
    private get indexPageUp(): number {
        const from: number = Math.max(0, this.currentIndex - this.config.pageSize);
        return this.findAvailableIndex(from, 1);
    }

    /**
     * @description
     * Get index of the first available item in next page.
     */
    private get indexPageDown(): number {
        const from: number = Math.min(this.currentItems.length - 1, this.currentIndex + this.config.pageSize);
        return this.findAvailableIndex(from, -1);
    }

    /**
     * @description
     * Property name used to identify disabled items
     */
    private get keyDisabled(): string {
        return this.config.disabledProperty || 'disabled';
    }

    /**
     * @description
     * Property name used to identify children in nested structures
     */
    private get keyChildren(): string {
        return this.config.childrenProperty || 'children';
    }

    /**
     * @description
     * Check if current item has children and navigate into them.
     *
     * Returns:
     * - The first available index in children (if allowed to auto-select it)
     * - `-1` if not allowed to auto-select first children
     * - `null` if no children available
     */
    private get itemOpen(): number | null {
        const currentItem: unknown | undefined = this.currentItems[this.currentIndex];
        if (!currentItem || typeof currentItem !== 'object') return null;

        const children: unknown = (currentItem as Record<string, unknown>)[this.keyChildren];
        if (!Array.isArray(children) || !children.length) return null;

        // At this point the current item has children

        // Push the current index to the path to indicate the new open level and to restore it when closing
        this.currentPath.push(this.currentIndex);
        // We update the current list of items with the new children
        this.updateCurrentItems();

        // If all children are disabled and we don't allow navigation through disabled items,
        // return -1 to indicate "subitems opened but no item selected"
        if (this.allDisabled(children) && !this.config.allowNavigateDisabled) return -1;

        // We return the first available index
        return this.indexFirst;
    }

    /**
     * @description
     * Initializes the strategy and items.
     */
    init(): void {
        if (!this.strategy) this.initStrategy();
        this.updateCurrentItems();
    }

    /**
     * @description
     * Resets the last navigation state.
     */
    resetLastNavigationState(): void {
        this.lastNavigate = null;
    }

    /**
     * @description
     * Gets the items to be navigated.
     */
    getItems<T = unknown>(): T[] {
        return this.items as T[];
    }

    /**
     * @description
     * Sets the items to be navigated.
     */
    setItems(items: unknown[]): void {
        this.items = items;
        this.updateCurrentItems();
    }

    /**
     * @description
     * Gets the configuration.
     */
    getConfig(): KeyboardNavigationConfig {
        return this.config;
    }

    /**
     * @description
     * Sets the configuration.
     */
    setConfig(config: Partial<KeyboardNavigationConfig>): void {
        (Object.keys(config) as (keyof KeyboardNavigationConfig)[]).forEach((key) => {
            if (config[key] === undefined) delete config[key];
        });

        Object.assign(this.config, config);

        this.setOrientation();

        const { type, customStrategy } = config;
        if (type) {
            if (type === 'custom' && customStrategy) this.initStrategy(customStrategy);
            else this.initStrategy();
        }
    }

    /**
     * @description
     * Gets the current index & path.
     */
    getCurrent(): KeyboardNavigationCurrent {
        return {
            index: this.currentIndex,
            path: this.currentPath,
        };
    }

    /**
     * @description
     * Sets the current index and/or path.
     */
    setCurrent(current: number | KeyboardNavigationCurrent): void {
        if (typeof current === 'number') {
            this.currentIndex = current;
            this.verifyCurrentIndex();
            return;
        }

        const { index, path } = current ?? {};

        if (index !== undefined) this.currentIndex = index;
        if (path !== undefined) {
            this.currentPath = this.validatePath(path);
            this.updateCurrentItems();
        }

        this.verifyCurrentIndex();
    }

    /**
     * @description
     * Initializes the keyboard strategy.
     */
    private initStrategy(customStrategy?: KeyboardNavigationStrategy): void {
        this.strategy = customStrategy ?? NAVIGATION_STRATEGIES[this.config.type];
        this.setKeys();
    }

    /**
     * @description
     * Sets the orientation and then the keys.
     */
    private setOrientation(): void {
        const { orientation } = this.config;

        this.orientationKey = !orientation || orientation === 'horizontal' ? 'keysHorizontal' : 'keysVertical';
        this.setKeys();
    }

    /**
     * @description
     * Sets the keys for navigation from the strategy.
     *
     * If the strategy is "custom" and there were no keys defined, it will warn the user.
     */
    private setKeys(): void {
        if (!this.strategy) return;

        this.keys = {
            ...(this.strategy.keys ?? {}),
            ...(this.strategy[this.orientationKey] ?? {}),
        };

        if (this.config.type === 'custom' && !Object.keys(this.keys).length) console.warn(ERROR_KEYS_NOT_PROVIDED());
    }

    /**
     * @description
     * Verifies that the current index exists, or sets it to `-1` otherwise.
     */
    private verifyCurrentIndex(): void {
        // If index is not within range, reset to -1
        if (this.currentIndex < -1 || this.currentIndex > this.currentItems.length - 1) this.currentIndex = -1;
        // Update the last navigation state
        if (this.lastNavigate) this.lastNavigate.indexTo = this.currentIndex;
    }

    /**
     * @description
     * Updates current items based on current path.
     */
    private updateCurrentItems(): void {
        this.currentItems = this.traversePath(this.currentPath, 'items') as unknown[];
    }

    /**
     * @description
     * Verifies that the given item is disabled.
     */
    private isDisabled(item: unknown): boolean {
        return typeof item === 'object' ? (item as Record<string, unknown>)[this.keyDisabled] === true : false;
    }

    /**
     * @description
     * Verifies that the given items (default `currentItems`) are all disabled.
     */
    private allDisabled(items: unknown[] = this.currentItems): boolean {
        return items.every((item) => this.isDisabled(item));
    }

    /**
     * @description
     * Finds the next available item starting from 'from' index in direction of 'step'.
     *
     * @param { number } from - Starting index
     * @param { number } step - Direction: 1 for forward, -1 for backward
     * @returns Index of next available item, or current index if none found
     */
    private findAvailableIndex(from: number, step: number): number {
        const resolveIndex = (idx: number): number => (idx === -1 ? this.currentIndex : idx);

        const { allowNavigateDisabled } = this.config;
        const totalItems: number = this.currentItems.length;
        if (!totalItems || (this.allDisabled() && !allowNavigateDisabled)) return resolveIndex(-1);

        let idx: number = from;
        let checked: number = 0;
        do {
            // Handle wrapping at boundaries if loop is enabled
            if (idx < 0 || idx >= totalItems) {
                if (!this.strategy.loop) break;
                // Normalize index using modulo to handle negative indices correctly
                idx = ((idx % totalItems) + totalItems) % totalItems;
            }

            // Return index if disabled navigation is allowed or item is not disabled
            if (allowNavigateDisabled || !this.isDisabled(this.currentItems[idx])) return resolveIndex(idx);

            idx += step;
            checked++;
        } while (checked < totalItems); // Prevent infinite loop

        return resolveIndex(-1);
    }
}
