import { Injectable, Optional, SkipSelf } from '@angular/core';

import { ThemeRootService } from './theme.service.root';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './theme.errors';

import type { Theme } from './theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    get theme(): Theme | undefined {
        return this.rootService.theme;
    }

    constructor(
        private rootService: ThemeRootService,
        @Optional() @SkipSelf() private parentService: ThemeService | null
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ThemeService'));
    }
}
