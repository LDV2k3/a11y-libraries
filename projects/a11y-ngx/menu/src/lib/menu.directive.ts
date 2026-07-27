import {
    Directive,
    Input,
    Output,
    AfterViewInit,
    OnDestroy,
    EventEmitter,
    ElementRef,
    TemplateRef,
    ChangeDetectorRef,
} from '@angular/core';
import { Subject, merge } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { MenuService } from './menu.service';
import { MenuDirectorService } from './menu.director.service';

import { ERROR_NO_BUTTON_HOST, ERROR_NO_DATA_PROVIDED } from './menu.errors';

import { MENU_SELECTOR, TABBABLE_ELEMENT_TABINDEX_SELECTOR } from './menu.type.private';
import type { MenuMainConfig } from './menu.type.private';
import type { Menu, MenuOpenReason, MenuCloseReason, MenuConfig, MenuContext, MenuItemSelected } from './menu.type';

@Directive({
    selector: '[a11yMenu]',
    exportAs: 'a11yMenu',
    host: {
        '[attr.aria-haspopup]': 'attrAriaHasPopup',
        '[attr.aria-expanded]': 'attrAriaExpanded',
        '(click)': 'onMenu($event)',
        '(keydown.enter)': 'onMenu($event)',
        '(keydown.space)': 'onMenu($event)',
    },
})
export class MenuDirective implements AfterViewInit, OnDestroy {
    @Input('a11yMenu') items: Menu = [];
    @Input('a11yMenuLabel') label: string | undefined = undefined;
    @Input('a11yMenuConfig') config: MenuConfig = {};
    @Input('a11yIconTemplate') iconTemplate: TemplateRef<unknown> | undefined;

    @Output() readonly itemSelected: EventEmitter<MenuItemSelected> = new EventEmitter<MenuItemSelected>();
    @Output() readonly menuOpened: EventEmitter<MenuOpenReason> = new EventEmitter<MenuOpenReason>();
    @Output() readonly menuClosed: EventEmitter<MenuCloseReason> = new EventEmitter<MenuCloseReason>();

    get nativeElement(): HTMLButtonElement {
        return this.hostElement.nativeElement;
    }

    get menuContext(): MenuContext | undefined {
        return this.attrAriaExpanded ? this.service.menuContext : undefined;
    }

    protected attrAriaHasPopup: string | null = null;
    protected attrAriaExpanded: boolean | null = null;

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(
        private hostElement: ElementRef<HTMLButtonElement>,
        private service: MenuService,
        private director: MenuDirectorService,
        private cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit(): void {
        const nativeElement: HTMLElement = this.nativeElement;
        const hostRole: string = (nativeElement.getAttribute('role') ?? '').toLowerCase();
        const hostType: string = (nativeElement.getAttribute('type') ?? '').toLowerCase();
        const isButton: boolean =
            (nativeElement.matches('button') && hostType !== 'submit') ||
            (hostRole === 'button' && nativeElement.matches(TABBABLE_ELEMENT_TABINDEX_SELECTOR));

        if (!isButton) {
            console.error(ERROR_NO_BUTTON_HOST(nativeElement));
            return;
        }

        this.attrAriaHasPopup = 'menu';
        this.attrAriaExpanded = false;

        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        // If this menu is open and host gets destroyed, destroy menu
        if (this.attrAriaExpanded) this.service.destroyMenu({ closeReason: 'host-destroyed' });

        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * @description
     * Handles events to open the menu (`click`, `enter` and `space` keys).
     */
    protected onMenu(event: PointerEvent | Event): void {
        const trigger: HTMLButtonElement = this.nativeElement;
        const isDisabled: boolean = trigger.disabled || trigger.getAttribute('aria-disabled')?.toLowerCase() === 'true';
        if (isDisabled) return;

        event.stopImmediatePropagation();
        event.preventDefault();

        if (!this.items.length) {
            console.warn(ERROR_NO_DATA_PROVIDED());
            return;
        }

        // If closed, then open
        if (!this.attrAriaExpanded) {
            const openReason: MenuOpenReason = event.type === 'click' ? 'click' : 'keyboard';
            this.openMenu(openReason);
        }
        // If opened, then close
        else this.service.destroyMenu({ closeReason: 'toggle' });
    }

    /**
     * @description
     * Opens the main menu.
     */
    private openMenu(openReason: MenuOpenReason): void {
        const instanceConfig: Partial<MenuMainConfig> = this.config;

        if (openReason === 'keyboard') {
            this.service.navigateFrom('kb');
            instanceConfig.focusItemWhenOpen = 'first';
        } else this.service.navigateFrom('pointer');

        // Creates the root menu
        this.director.createRootMenu(
            this.nativeElement,
            this.items,
            MENU_SELECTOR,
            instanceConfig,
            this.label?.trim(),
            this.iconTemplate
        );

        // Updates the "aria-expanded" value
        this.attrAriaExpanded = true;
        this.cdr.detectChanges();

        // Emits the open reason
        this.menuOpened.emit(openReason);

        // Subscribes to when an item gets selected to emit its value
        this.service.menuItemSelected$
            .pipe(takeUntil(merge(this.destroy$, this.service.rootMenuDestroyed$)))
            .subscribe((data: MenuItemSelected) => this.itemSelected.emit(data));

        // Subscribes to when the root menu gets destroyed
        this.service.rootMenuDestroyed$
            .pipe(takeUntil(this.destroy$), take(1))
            .subscribe((closeReason: MenuCloseReason) => {
                // ... updates the "aria-expanded" value
                this.attrAriaExpanded = false;
                // ... emits the close reason
                this.menuClosed.emit(closeReason);
                // ... sets focus to the trigger if item was selected or menu was closed by keyboard
                if (
                    closeReason.startsWith('item-selected') ||
                    ['escape', 'mobile-back', 'keyboard', 'programmatically'].includes(closeReason)
                )
                    this.nativeElement.focus({ preventScroll: true });

                this.cdr.detectChanges();
            });
    }
}
