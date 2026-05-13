import { Injectable, Optional, SkipSelf } from '@angular/core';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './icon.errors';

import type { IconConfig } from './icon.type';

@Injectable({ providedIn: 'root' })
export class IconService {
    private rootConfigAlreadyProvided: boolean = false;

    readonly config: IconConfig = {};

    /**
     * @description
     * Blocks any possible repeated use of `A11yIconModule.rootConfig()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    constructor(@Optional() @SkipSelf() private parentService: IconService | null) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('IconService'));
    }

    /**
     * @description
     * To initialize the Icon global strategy.
     */
    initRootConfig(config: IconConfig): void {
        Object.assign(this.config, config);
        this.rootConfigAlreadyProvided = true;
    }
}
