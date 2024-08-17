import { Injectable, Optional, SkipSelf } from '@angular/core';

import { ColorSchemeService, formatConsoleMsg } from './color-scheme.service';

import {
    ColorScheme,
    ColorSchemeCSSMap,
    ColorSchemeConfig,
    ColorSchemeGlobalConfig,
    ColorSchemeItem,
} from './color-scheme.type';
import { COLOR_SCHEME_BASE_MAP, ColorSchemeDefaultNames } from './color-scheme.type.private';

@Injectable({ providedIn: 'root' })
export class ColorSchemeServiceRoot {
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    /** @description To block any possible repeated use of `A11yColorSchemeModule.rootConfig()` */
    private rootConfigAlreadyProvided: boolean = false;

    private readonly customConfigsInitiated: string[] = [];

    constructor(
        private service: ColorSchemeService,
        @Optional() @SkipSelf() private parentService: ColorSchemeServiceRoot
    ) {
        if (this.parentService)
            throw Error(
                formatConsoleMsg(`
                    A11y Color Scheme:
                    ColorSchemeServiceRoot is a singleton and has been provided more than once.
                    Please remove the service from any 'providers' array you may have added it to.
                `)
            );
    }

    /**
     * @description
     * To init the root configuration.
     *
     * @param { ColorScheme | ColorSchemeGlobalConfig } userRootConfig - The given root configuration.
     */
    initRootConfig(userRootConfig: ColorScheme | ColorSchemeGlobalConfig): void {
        this.rootConfigAlreadyProvided = true;
        let useScheme: ColorScheme | undefined;

        if (typeof userRootConfig === 'object') {
            if ('useScheme' in userRootConfig) {
                this.service.globalConfig.useScheme = userRootConfig.useScheme as string;
                useScheme = userRootConfig.useScheme;
            }
            if ('defaultNames' in userRootConfig) {
                const defaultNames = userRootConfig.defaultNames as ColorSchemeDefaultNames;
                this.service.globalConfig.defaultNames = defaultNames;

                Object.keys(defaultNames).forEach((defaultName: string) => {
                    const name: string | undefined = defaultNames[defaultName as keyof ColorSchemeDefaultNames]?.trim();
                    const item: ColorSchemeItem | undefined = this.service.colorSchemes.find(
                        (scheme) => scheme.value === defaultName
                    );
                    if (name?.length && item) item.name = name;
                });
            }
            if ('allowUserToChangeScheme' in userRootConfig)
                this.service.globalConfig.allowUserToChangeScheme = userRootConfig.allowUserToChangeScheme as boolean;
            if ('newSchemes' in userRootConfig)
                this.service.globalConfig.newSchemes = userRootConfig.newSchemes as ColorSchemeItem[];
            if ('appendStylesMap' in userRootConfig)
                this.service.globalConfig.appendStylesMap = userRootConfig.appendStylesMap as ColorSchemeCSSMap;
            if ('attributeSelectorMatch' in userRootConfig)
                this.service.globalConfig.attributeSelectorMatch = userRootConfig.attributeSelectorMatch as string;

            userRootConfig.newSchemes?.forEach((newScheme: ColorSchemeItem) => this.service.newScheme(newScheme));

            this.service.rootConfig.stylesMap = { ...userRootConfig.appendStylesMap, ...COLOR_SCHEME_BASE_MAP };
        } else {
            this.service.globalConfig.useScheme = userRootConfig;
            useScheme = userRootConfig;
        }

        this.service.initColorScheme(useScheme);
    }

    /**
     * @description
     * To init the custom config for a given selector.
     *
     * @param { ColorSchemeConfig[] } userCustomConfigs - The given custom configurations.
     */
    initCustomConfigs(userCustomConfigs: ColorSchemeConfig[]): void {
        userCustomConfigs
            ?.filter((userConfig: ColorSchemeConfig) => !this.customConfigsInitiated.includes(userConfig.selector))
            .forEach((userConfig: ColorSchemeConfig) => {
                if (this.service.selectorNotAllowed(userConfig.selector)) {
                    throw new Error(
                        formatConsoleMsg(`
                            A11y Color Scheme:
                            You can not use 'root' or ':root' as a selector.
                            Please choose another name for it.
                        `)
                    );
                }

                this.customConfigsInitiated.push(userConfig.selector);
                this.service.setConfig(userConfig);
            });
    }
}
