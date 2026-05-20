import { Directive, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { KeyboardNavigationService } from './keyboard-navigation.service';

import type {
    KeyboardNavigationEvent,
    KeyboardNavigationConfig,
    KeyboardNavigationCurrent,
    KeyboardNavigationType,
} from './keyboard-navigation.type';

@Directive({
    selector: '[a11yKeyNav]',
    exportAs: 'a11yKeyNav',
    providers: [KeyboardNavigationService],
    host: {
        '(keydown)': 'onKeyDown($event)',
    },
})
export class KeyboardNavigationDirective<T = unknown> implements OnInit {
    /** @description The items to be navigated. */
    @Input('a11yKeyNav')
    get items(): T[] {
        return this.service.getItems<T>();
    }
    set items(items: T[]) {
        this.service.setItems(items);
    }

    /** @description The type of navigation (menu, dropdown, tree, default, etc.). */
    @Input('a11yKeyNavType') set type(type: KeyboardNavigationType) {
        this.service.setConfig({ type });
    }

    /** @description The configuration. */
    @Input('a11yKeyNavConfig')
    get config(): Partial<KeyboardNavigationConfig> {
        return this.service.getConfig();
    }
    set config(config: Partial<KeyboardNavigationConfig>) {
        this.service.setConfig(config);
    }

    /** @description The current navigation. */
    @Input('a11yKeyNavCurrent')
    get current(): KeyboardNavigationCurrent {
        return this.service.getCurrent();
    }
    set current(current: number | KeyboardNavigationCurrent) {
        this.service.setCurrent(current);
    }

    /** @description The navigated state. */
    @Output() readonly navigate: EventEmitter<KeyboardNavigationEvent<T>> = new EventEmitter<
        KeyboardNavigationEvent<T>
    >();

    constructor(private service: KeyboardNavigationService) {}

    ngOnInit(): void {
        this.service.init();
    }

    /**
     * @description
     * Handles keydown events.
     */
    protected onKeyDown(event: KeyboardEvent): void {
        const navigateTo: KeyboardNavigationEvent<T> | null = this.service.manageKeyDown(event);
        if (!navigateTo) return;

        event.preventDefault();
        this.navigate.emit(navigateTo);
    }

    /**
     * @description
     * Resets the last navigation state.
     */
    resetLastNavigationState(): void {
        this.service.resetLastNavigationState();
    }
}
