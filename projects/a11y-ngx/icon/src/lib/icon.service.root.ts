import { Injectable } from '@angular/core';

import type { IconConfig } from './icon.type';

@Injectable({ providedIn: 'root' })
export class IconRootService {
    private rootConfigAlreadyProvided: boolean = false;

    readonly config: IconConfig = {};

    /**
     * @description
     * Blocks any possible repeated use of `A11yIconModule.rootConfig()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
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
