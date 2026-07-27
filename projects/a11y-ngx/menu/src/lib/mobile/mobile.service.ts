import { PLATFORM_ID, Injectable, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';

import { WINDOW } from './mobile.module.providers.private';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { MobileRootService } from './mobile.service.root';

import { ERROR_NO_MORE_STATES_TO_POP, ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './mobile.errors';

import type { A11yMobileHistoryState } from './mobile.type.private';

@Injectable({ providedIn: 'root' })
export class MobileService implements OnDestroy {
    /** @description Whether the viewport is within the desired mobile breakpoint or not. */
    get isMobile(): boolean {
        return this.isMobileBreakpoint;
    }

    private isPlatformBrowser: boolean;
    private bodyIsBlocked: boolean = false;
    private isMobileBreakpoint: boolean = false;
    private mediaQueryList: MediaQueryList | undefined = undefined;

    /** @description The active number that are currently blocking the body. */
    private activeBodyLocks: Set<string> = new Set<string>();

    /** @description Body's Y position. */
    private posTop: number = 0;
    /** @description Body's X position. */
    private posLeft: number = 0;

    /** @description To reset default scroll restoration behavior on mobile's history navigation. */
    private originalScrollRestoration!: ScrollRestoration;
    /** @description To handle adding/resetting the `inert` attribute to all root elements. */
    private originalRootElements: Element[] = [];
    /** @description The current number of _pushed_ states within the window's history. */
    private currentMobileStatesCount: number = 0;

    private get supportsScrollRestoration(): boolean {
        if (!this.isPlatformBrowser) return false;
        return 'scrollRestoration' in this.window.history;
    }

    /** @description To _announce_ when the user presses the "back" button in mobile. */
    readonly mobileHistoryBack$: Subject<void> = new Subject<void>();
    /** @description To _announce_ when the mobile breakpoint changed. @note `true` when is mobile, `false` when is desktop. */
    readonly mobileStateChanged$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private rootService: MobileRootService,
        @Inject(PLATFORM_ID) private platformId: string,
        @Inject(DOCUMENT) private document: Document,
        @Inject(WINDOW) private window: Window,
        @Optional() @SkipSelf() private parentService: MobileService | null
    ) {
        this.isPlatformBrowser = isPlatformBrowser(this.platformId);
        if (!this.isPlatformBrowser) return;

        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('MobileService'));

        // If by any chance "something" was open the moment the page refreshes,
        // we have to clean up all the residual pushed states
        this.cleanUpMobileStates();

        const { breakpoint } = this.rootService.config;
        this.mediaQueryList = this.window.matchMedia(`(max-width: ${breakpoint}px)`);
        this.isMobileBreakpoint = this.mediaQueryList.matches;

        this.mediaQueryList.addEventListener('change', this.onBreakpointChange);
    }

    ngOnDestroy(): void {
        this.destroyMobileState('');
        this.restoreScrollRestoration();

        // Ignores the SSR guard in coverage reports
        /* istanbul ignore next */
        if (!this.mediaQueryList) return;
        this.mediaQueryList.removeEventListener('change', this.onBreakpointChange);
    }

    /**
     * @description
     * Initializes the state by:
     * - Marking all _root_ elements as `inert` (except the ones indicated within `skipFromBlockingSelector` property).
     * - Blocks the `<body>` element.
     * - Starts listening for `popstate` to announce any "go back" from window's history.
     *
     * @param libSelector - A unique selector to identify the currently _open_ layer.
     * @param skipFromBlockingSelector - A selector to ignore any element(s) from adding the `inert` attribute.
     */
    initMobileState(libSelector: string, skipFromBlockingSelector?: string): void {
        if (!this.isMobile || !this.isPlatformBrowser) return;

        libSelector = libSelector.trim();
        if (!libSelector.length) return;

        if (!this.bodyIsBlocked) {
            let allElemsButInertsSelector: string = ':scope > *#IGNORE#:not([inert])';
            const ignoreSelectorWith: string = skipFromBlockingSelector?.length
                ? `:not(${skipFromBlockingSelector})`
                : '';
            allElemsButInertsSelector = allElemsButInertsSelector.replace('#IGNORE#', ignoreSelectorWith);

            this.originalRootElements = Array.from(this.document.body.querySelectorAll(allElemsButInertsSelector));
            this.originalRootElements.forEach((el) => el.setAttribute('inert', ''));
        }

        this.blockBody(libSelector);

        this.bodyIsBlocked = true;

        this.window.addEventListener('popstate', this.popMobileState);
    }

    /**
     * @description
     * Destroys the state by:
     * - Removing the `inert` attribute from all _root_ elements.
     * - Unblocking the `<body>` element.
     * - Removing the `popstate` listener.
     * - Cleans up any residual pushed states from the window's history.
     *
     * @param libSelector - The same unique selector provided to the `initMobileState()` method.
     */
    destroyMobileState(libSelector: string): void {
        if (!this.isPlatformBrowser || !this.bodyIsBlocked) return;

        this.unblockBody(libSelector.trim());

        if (this.activeBodyLocks.size > 0 || !this.originalRootElements.length) return;

        this.originalRootElements.forEach((el) => el.removeAttribute('inert'));
        this.originalRootElements = [];

        this.bodyIsBlocked = false;

        this.window.removeEventListener('popstate', this.popMobileState);

        this.cleanUpMobileStates();
    }

    /**
     * @description
     * Pushes a new window's history state.
     */
    pushMobileState(): void {
        if (!this.isMobile) return;

        this.currentMobileStatesCount++;
        this.window.history.pushState({ a11yMobileStatesCount: this.currentMobileStatesCount }, '');
    }

    /**
     * @description
     * Pops last window's history state.
     */
    popMobileState = ((): void => {
        if (!this.isMobile) return;

        if (this.currentMobileStatesCount === 0) {
            console.warn(ERROR_NO_MORE_STATES_TO_POP());
            return;
        }

        this.currentMobileStatesCount--;
        this.mobileHistoryBack$.next();
    }).bind(this);

    /**
     * @description
     * Blocks the `<body>` element by:
     * - Adding a class name that starts with "a11y-body-blocked" that provides specific CSS rules to _block_ the overflow and body's current position.
     * - Saves the body's current position.
     * - Saves any possible custom value from "scrollRestoration" window's history to prevent scroll going back to top.
     */
    private blockBody(libSelector: string): void {
        if (!this.isPlatformBrowser) return;

        const window: Window = this.window;
        const body: HTMLElement = this.document.body;

        /* istanbul ignore next */
        this.posTop = window.visualViewport?.pageTop ?? window.scrollY;
        /* istanbul ignore next */
        this.posLeft = window.visualViewport?.pageLeft ?? window.scrollX;

        const className: string = `a11y-body-blocked-${libSelector}`;
        body.classList.add(className);
        this.activeBodyLocks.add(className);

        body.style.setProperty('--a11y-body-blocked-y', `-${this.posTop}px`);
        body.style.setProperty('--a11y-body-blocked-x', `-${this.posLeft}px`);

        // When using history.back()/go(), page tends to scroll back to the top,
        // we avoid that using `scrollRestoration='manual'` when supported
        if (this.supportsScrollRestoration) {
            this.originalScrollRestoration = window.history.scrollRestoration;
            window.history.scrollRestoration = 'manual';
        }
    }

    /**
     * @description
     * Unblocks the `<body>` element by:
     * - Removing the inserted class name that starts with "a11y-body-blocked".
     * - Scrolls back to the original position.
     * - Restores the window's history "scrollRestoration" value.
     */
    private unblockBody(libSelector: string): void {
        if (!this.isPlatformBrowser) return;

        const html: HTMLElement = this.document.documentElement;
        const body: HTMLElement = this.document.body;

        if (libSelector.length) {
            const className: string = `a11y-body-blocked-${libSelector}`;
            body.classList.remove(className);
            this.activeBodyLocks.delete(className);
        } else {
            this.activeBodyLocks.forEach((className) => body.classList.remove(className));
            this.activeBodyLocks.clear();
        }

        if (this.activeBodyLocks.size > 0) return;

        body.style.removeProperty('--a11y-body-blocked-y');
        body.style.removeProperty('--a11y-body-blocked-x');
        html.style.setProperty('scroll-behavior', 'auto', 'important');

        // Force the reflow
        void body.offsetHeight;
        void html.offsetHeight;

        setTimeout(() => {
            html.scrollTo({ top: this.posTop, left: this.posLeft, behavior: 'instant' as ScrollBehavior });

            this.posTop = 0;
            this.posLeft = 0;

            // We restore the original `scrollRestoration` value
            this.restoreScrollRestoration();

            setTimeout(() => html.style.removeProperty('scroll-behavior'), 5);
        }, 0);
    }

    /**
     * @description
     * Restores the original value for the window's history `scrollRestoration`.
     */
    private restoreScrollRestoration(): void {
        if (!this.supportsScrollRestoration) return;

        this.window.history.scrollRestoration = this.originalScrollRestoration ?? 'auto';
    }

    /**
     * @description
     * Cleans up ghost states (if user closed via another method but the OS back button).
     */
    private cleanUpMobileStates(): void {
        if (!this.isPlatformBrowser) return;

        this.currentMobileStatesCount = 0;

        const { a11yMobileStatesCount = 0 } = (this.window.history.state as A11yMobileHistoryState) ?? {};

        // If there's NO count value, don't do anything
        if (!a11yMobileStatesCount) return;

        // Go back exactly the amount of "ghost" states left behind
        this.window.history.go(-a11yMobileStatesCount);
    }

    /**
     * @description
     * Handles the breakpoint change.
     */
    private onBreakpointChange = (({ matches: isMobile }: MediaQueryListEvent): void => {
        this.mobileStateChanged$.next(isMobile);
        this.isMobileBreakpoint = isMobile;
    }).bind(this);
}
