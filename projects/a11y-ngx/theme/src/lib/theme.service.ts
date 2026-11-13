import { Injectable, inject } from '@angular/core';

import { ThemeRootService } from './theme.service.root';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './theme.errors';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    /** @description The current theme. */
    get theme(): 'light' | 'dark' | undefined {
        return this.rootService.theme;
    }

    /** @description Sets the desired theme. */
    set theme(newTheme: 'light' | 'dark' | 'auto' | undefined) {
        const theme: 'light' | 'dark' | null = !newTheme || newTheme === 'auto' ? null : newTheme;
        this.rootService.saveTheme(theme);
    }

    private readonly rootService: ThemeRootService = inject(ThemeRootService);
    private readonly parentService: ThemeService | null = inject(ThemeService, { optional: true, skipSelf: true });

    constructor() {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ThemeService'));
    }
}
