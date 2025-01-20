import { Injectable, Optional, SkipSelf } from '@angular/core';

import { ColorSchemeService } from './color-scheme.service';

import {
    ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED,
} from './color-scheme.errors';

import { ColorScheme, ColorSchemeConfig, ColorSchemeGlobalConfig, ColorSchemeItemNew } from './color-scheme.type';

@Injectable({ providedIn: 'root' })
export class ColorSchemeServiceRoot {
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    /**
     * @description
     * To block any possible repeated use of `A11yColorSchemeModule.rootConfig()`.
     */
    private rootConfigAlreadyProvided: boolean = false;

    private readonly customConfigsInitiated: string[] = [];

    constructor(
        private service: ColorSchemeService,
        @Optional() @SkipSelf() private parentService: ColorSchemeServiceRoot
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ColorSchemeServiceRoot'));
    }

    /**
     * @description
     * To init the root configuration.
     *
     * @param { ColorScheme | ColorSchemeGlobalConfig } userRootConfig - The given root configuration.
     */
    initRootConfig(userRootConfig: ColorScheme | ColorSchemeGlobalConfig): void {
        this.rootConfigAlreadyProvided = true;

        if (typeof userRootConfig === 'object') {
            const {
                useScheme,
                allowUserToChangeScheme,
                attributeSelectorMatch,
                appendStylesMap,
                newSchemes,
                defaults,
            } = userRootConfig;

            if (useScheme !== undefined) this.service.globalConfig.useScheme = useScheme;

            if (typeof allowUserToChangeScheme === 'boolean')
                this.service.globalConfig.allowUserToChangeScheme = allowUserToChangeScheme;

            if (attributeSelectorMatch !== undefined)
                this.service.globalConfig.attributeSelectorMatch = attributeSelectorMatch;

            if (appendStylesMap !== undefined)
                this.service.rootConfig.stylesMap = {
                    ...appendStylesMap,
                    ...this.service.rootConfig.stylesMap,
                };

            newSchemes?.forEach((newScheme: ColorSchemeItemNew) => this.service.newScheme(newScheme));

            if (defaults && Object.keys(defaults ?? {}).length) this.service.updateColorSchemeDefaults(defaults);
        } else {
            this.service.globalConfig.useScheme = userRootConfig;
        }

        this.service.initColorScheme();
    }

    /**
     * @description
     * To init the custom config for a given selector.
     *
     * @param { ColorSchemeConfig[] } userCustomConfigs - The given custom configurations.
     */
    initCustomConfigs(userCustomConfigs: ColorSchemeConfig[]): void {
        userCustomConfigs
            ?.filter(({ selector }: ColorSchemeConfig) => !this.customConfigsInitiated.includes(selector))
            .forEach((userConfig: ColorSchemeConfig) => {
                if (this.service.selectorNotAllowed(userConfig.selector)) {
                    throw new Error(ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED());
                }

                this.customConfigsInitiated.push(userConfig.selector);
                this.service.setConfig(userConfig);
            });
    }
}
