import { Injectable } from '@angular/core';

import { MOBILE_DEFAULTS } from './mobile.type.private';
import type { MobileConfig } from './mobile.type';

@Injectable({ providedIn: 'root' })
export class MobileRootService {
    private rootConfigAlreadyProvided: boolean = false;

    /**
     * @description
     * Blocks any possible repeated use of `A11yMobileModule.rootConfig()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    readonly config: MobileConfig = { ...MOBILE_DEFAULTS };

    /**
     * @description
     * Initializes the Mobile root config.
     */
    initRootConfig(rootConfig: MobileConfig): void {
        this.rootConfigAlreadyProvided = true;

        this.cleanConfigUndefined(rootConfig);

        // Save the global config
        Object.assign(this.config, rootConfig);
    }

    /**
     * @description
     * Removes any undefined property from the given config object.
     */
    cleanConfigUndefined(config: MobileConfig): void {
        (Object.keys(config) as (keyof MobileConfig)[]).forEach((key) => {
            if (config[key] === undefined) delete config[key];
        });
    }
}
