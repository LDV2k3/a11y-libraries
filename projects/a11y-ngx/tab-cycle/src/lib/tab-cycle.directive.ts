import { Directive, Input, ElementRef, HostListener } from '@angular/core';

import { DOMHelperService, KEY } from '@a11y-ngx/dom-helper';

import { TabCycleFirstFocus } from './tab-cycle.type';

// Renderer2 is needed to add/remove attributes when the directive
// is programmatically assigned to an element, instead of @HostBinding().

@Directive({
    selector: '[a11yTabCycle]',
    exportAs: 'a11yTabCycle',
})
export class TabCycleDirective {
    @Input() set a11yTabCycle(enabled: string | boolean) {
        this.tabCycleEnabled = typeof enabled === 'string' || enabled === true;
        this.setModalAttr();
        this.setTabIndexAttr();
    }

    @Input()
    get tabindex(): string | number {
        return this.originalTabIndex ?? this.customTabIndex ?? '-1';
    }
    set tabindex(tabindex: string | number) {
        this.originalTabIndex = String(this.DOMHelper.getNumericValue(tabindex) ?? '-1');
        this.setTabIndexAttr();
    }

    /**
     * @description
     * Manages the key down to check if the user pressed the `tab` or `shift+tab` combination keys.
     *
     * @param { KeyboardEvent } event - The keyboard event.
     */
    @HostListener('keydown', ['$event'])
    manageKeyDown(event: KeyboardEvent): void {
        if (!this.tabCycleEnabled) return;

        const tabKey: boolean = event.code === KEY.TAB;
        const shiftKey: boolean = event.shiftKey;

        if (tabKey) {
            const tabbableElements: HTMLElement[] = this.tabbableElements;

            // If there are tabbable elements within the host...
            if (tabbableElements.length) {
                const firstTabbableElement = tabbableElements[0];
                const lastTabbableElement = tabbableElements[tabbableElements.length - 1];

                event.stopPropagation();

                // The cycle:
                if (event.target === lastTabbableElement && !shiftKey) {
                    // If TAB and the target is the last tabbable element
                    // then set focus on the first tabbable element.
                    event.preventDefault();
                    firstTabbableElement.focus();
                } else if ((event.target === this.nativeElement || event.target === firstTabbableElement) && shiftKey) {
                    // If SHIFT+TAB and the target is the host or first tabbable element
                    // then set focus on the last tabbable element.
                    event.preventDefault();
                    lastTabbableElement.focus();
                }

                // Keep the current tab order.
                return;
            }

            // ... or set focus on the host by default.
            event.stopPropagation();
            event.preventDefault();
            this.nativeElement.focus();
        }
    }

    private tabCycleEnabled!: boolean;
    private originalTabIndex: string | null = null;
    private customTabIndex: string | null = null;

    /**
     * @description
     * All tabbable and visible elements within the host.
     */
    get tabbableElements(): HTMLElement[] {
        return this.DOMHelper.tabbableElements(this.nativeElement);
    }

    /**
     * @description
     * The host element.
     */
    get nativeElement(): HTMLElement {
        return this.hostElement?.nativeElement;
    }

    /**
     * @description
     * If the Tab-Cycle is enabled or not.
     */
    get isEnabled(): boolean {
        return this.tabCycleEnabled;
    }

    constructor(private hostElement: ElementRef, private DOMHelper: DOMHelperService) {}

    focus(where?: TabCycleFirstFocus): void {
        if (where) {
            const tabbableElements: HTMLElement[] = this.tabbableElements;

            if (tabbableElements.length) {
                const focusIndex: number = where === 'first' ? 0 : tabbableElements.length - 1;
                tabbableElements[focusIndex].focus();
                return;
            }
        }

        this.nativeElement.focus();
    }

    /**
     * @description
     * Checks for `tabindex` attribute in case the directive was applied programmatically.
     */
    private checkForTabIndex(): void {
        if (!this.originalTabIndex && !this.customTabIndex) {
            const currentTabIndex: number | null = this.DOMHelper.getAttributeNumericValue(
                this.nativeElement,
                'tabindex'
            );

            if (currentTabIndex !== null) this.originalTabIndex = String(currentTabIndex);
        }
    }

    /**
     * @description
     * Updates the `tabindex` attribute if none was provided for the host element.
     */
    private setTabIndexAttr(): void {
        this.checkForTabIndex();

        if (this.originalTabIndex) return;

        if (this.tabCycleEnabled) {
            this.customTabIndex = '-1';
            this.DOMHelper.r2.setAttribute(this.nativeElement, 'tabindex', this.customTabIndex);
        } else {
            this.customTabIndex = null;
            this.DOMHelper.r2.removeAttribute(this.nativeElement, 'tabindex');
        }
    }

    /**
     * @description
     * Updates the `role` and `aria-modal` attributes in the host element.
     */
    private setModalAttr(): void {
        if (this.tabCycleEnabled) {
            this.DOMHelper.r2.setAttribute(this.nativeElement, 'role', 'dialog');
            this.DOMHelper.r2.setAttribute(this.nativeElement, 'aria-modal', 'true');
        } else {
            this.DOMHelper.r2.removeAttribute(this.nativeElement, 'role');
            this.DOMHelper.r2.removeAttribute(this.nativeElement, 'aria-modal');
        }
    }
}
