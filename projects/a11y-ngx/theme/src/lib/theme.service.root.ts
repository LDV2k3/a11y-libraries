import { Injectable, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { THEME_STYLES } from './theme.styles';

import type { Theme } from './theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeRootService implements OnDestroy {
    private rootConfigAlreadyProvided: boolean = false;

    theme: Theme | undefined = undefined;

    /**
     * @description
     * Blocks any possible repeated use of `A11yThemeModule.rootConfig()` or `provideA11yTheme()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    constructor(@Inject(DOCUMENT) private document: Document | null) {
        this.appendStyles();
    }

    ngOnDestroy(): void {
        // Ignores the SSR guard in coverage reports
        /* istanbul ignore next */
        if (!this.document) return;

        this.document.getElementById('a11y-theme')?.remove();
    }

    /**
     * @description
     * Initializes the Theme.
     */
    initRootConfig(theme: Theme): void {
        this.rootConfigAlreadyProvided = true;
        this.theme = theme;
    }

    /**
     * @description
     * Adds a new `<style>` tag with all the basic (light & dark) styles for the @a11y-ngx ecosystem.
     */
    private appendStyles(): void {
        // Ignores the SSR guard in coverage reports
        /* istanbul ignore next */
        if (!this.document) return;

        const styleTag: HTMLStyleElement = this.document.createElement('style');

        styleTag.setAttribute('id', 'a11y-theme');
        styleTag.innerHTML = THEME_STYLES;

        this.document.head.appendChild(styleTag);
    }
}
