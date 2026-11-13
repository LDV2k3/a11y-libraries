import { PLATFORM_ID, Injectable, inject, OnDestroy } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { THEME_STYLES } from './theme.styles';

@Injectable({ providedIn: 'root' })
export class ThemeRootService implements OnDestroy {
    private rootConfigAlreadyProvided: boolean = false;

    private globalTheme: 'light' | 'dark' | undefined = undefined;

    get theme(): 'light' | 'dark' | undefined {
        return this.globalTheme;
    }

    /**
     * @description
     * Blocks any possible repeated use of `A11yThemeModule.rootConfig()` or `provideA11yTheme()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    private readonly document: Document = inject(DOCUMENT);
    private readonly platformId = inject(PLATFORM_ID);

    constructor() {
        this.appendStyles();

        if (!isPlatformBrowser(this.platformId)) return;
        this.saveTheme();
    }

    ngOnDestroy(): void {
        this.document.getElementById('a11y-theme')?.remove();
    }

    /**
     * @description
     * Initializes the Theme.
     */
    initRootConfig(theme: 'light' | 'dark' | null): void {
        this.rootConfigAlreadyProvided = true;
        this.saveTheme(theme);
    }

    /**
     * @description
     * Establishes the Theme (given => storage => auto).
     */
    saveTheme(newTheme?: 'light' | 'dark' | null): void {
        const theme =
            newTheme === null
                ? 'auto'
                : ((newTheme ?? localStorage.getItem('a11yTheme') ?? 'auto') as 'light' | 'dark' | 'auto');

        if (theme !== 'auto') {
            this.globalTheme = theme;
            try {
                localStorage.setItem('a11yTheme', theme);
            } catch {
                /* blocked storage (private mode, policies, etc) */
            }
        } else {
            this.globalTheme = undefined;
            try {
                localStorage.removeItem('a11yTheme');
            } catch {
                /* blocked storage (private mode, policies, etc) */
            }
        }
    }

    /**
     * @description
     * Adds a new `<style>` tag with all the basic (light & dark) styles for the @a11y-ngx ecosystem.
     */
    private appendStyles(): void {
        if (this.document.getElementById('a11y-theme')) return;

        const styleTag: HTMLStyleElement = this.document.createElement('style');

        styleTag.setAttribute('id', 'a11y-theme');
        styleTag.innerHTML = THEME_STYLES;

        this.document.head.appendChild(styleTag);
    }
}
