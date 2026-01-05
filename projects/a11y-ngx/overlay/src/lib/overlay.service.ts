import { Injectable, Optional, SkipSelf } from '@angular/core';

import { ColorSchemeService } from '@a11y-ngx/color-scheme';
import { DOMHelperService } from '@a11y-ngx/dom-helper';

import { OVERLAY_COLOR_SCHEME_PROPERTY } from './overlay.color-scheme';

import {
    ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED,
    ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING,
} from './overlay.errors';

import { OverlayConfig, OVERLAY_DEFAULTS, OverlayRootConfig, OverlayCustomConfig } from './overlay.type';
import { OverlayProcessedConfig, OVERLAY_SELECTOR, OverlayCustomNoTriggerConfig } from './overlay.type.private';

const OVERLAY_CONFIG_ROOT_SELECTOR: string = ':root';

@Injectable({ providedIn: 'root' })
export class OverlayService {
    private readonly configs: { [selector: string]: OverlayRootConfig } = {
        [OVERLAY_CONFIG_ROOT_SELECTOR]: { ...OVERLAY_DEFAULTS },
    };

    /**
     * @description
     * To avoid initiate same config multiple times.
     */
    private readonly customConfigsInitiated: string[] = [];

    private rootConfigAlreadyProvided: boolean = false;

    /**
     * @description
     * The Global root config.
     */
    private get rootConfig(): OverlayRootConfig {
        return this.configs[OVERLAY_CONFIG_ROOT_SELECTOR];
    }
    private set rootConfig(config: OverlayRootConfig) {
        this.configs[OVERLAY_CONFIG_ROOT_SELECTOR] = { ...this.rootConfig, ...config };
    }

    /**
     * @description
     * The Global root config.
     */
    get globalConfig(): OverlayRootConfig {
        return this.rootConfig;
    }

    /**
     * @description
     * To block any possible repeated use of `A11yOverlayModule.rootConfig()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    constructor(
        private colorSchemeService: ColorSchemeService,
        private DOMHelper: DOMHelperService,
        @Optional() @SkipSelf() private parentService: OverlayService
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE());
    }

    /**
     * @description
     * To init the root configuration.
     *
     * @param { OverlayRootConfig } rootConfig - The given root configuration.
     */
    initRootConfig(rootConfig: OverlayRootConfig): void {
        this.rootConfigAlreadyProvided = true;

        if (!rootConfig) return;

        this.rootConfig = rootConfig;

        const rootConfigOverlay: OverlayRootConfig = { ...rootConfig };
        this.configs[OVERLAY_SELECTOR] = {};
        this.updateConfig(OVERLAY_SELECTOR, rootConfigOverlay);

        // If we found the "colorSchemes" object, we move its content to the "schemes" object instead,
        // so the Color Scheme Service can find the schemes/properties appropriately
        if (rootConfigOverlay.colorSchemes)
            rootConfigOverlay.colorSchemes = { schemes: rootConfigOverlay.colorSchemes };

        this.colorSchemeService.updateConfig(OVERLAY_SELECTOR, rootConfigOverlay, OVERLAY_COLOR_SCHEME_PROPERTY);
    }

    /**
     * @description
     * To init the custom configurations.
     *
     * @param { OverlayCustomConfig[] } userCustomConfigs - The given custom configurations.
     */
    initCustomConfigs(userCustomConfigs: OverlayCustomConfig[]): void {
        userCustomConfigs?.forEach((userConfig) => {
            const selector: string = userConfig.selector?.trim() ?? '';

            if (this.selectorNotAllowed(selector)) {
                throw new Error(ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED());
            }

            if (!selector.length) {
                console.warn(ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY());
                return;
            } else if (this.customConfigsInitiated.includes(selector)) {
                console.warn(ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED(selector));
                return;
            }

            this.customConfigsInitiated.push(selector);
            this.configs[selector] = userConfig;
        });
    }

    /**
     * @description
     * To block some configs if selector is 'root' or ':root'.
     *
     * @param { string } selector - The given selector.
     * @returns { boolean }
     */
    private selectorNotAllowed(selector: string): boolean {
        return ['root', OVERLAY_CONFIG_ROOT_SELECTOR].includes(selector.trim().toLowerCase());
    }

    /**
     * @description
     * Gets the custom configuration.
     *
     * @param { string } selector - The given selector.
     * @returns { OverlayRootConfig } The module level custom configuration.
     */
    private getCustomConfig(selector?: string): OverlayRootConfig {
        return this.configs[selector ?? OVERLAY_CONFIG_ROOT_SELECTOR] ?? {};
    }

    /**
     * @description
     * Sets the custom configuration.
     *
     * @param { string } selector - The given selector.
     * @param { OverlayRootConfig } config - The configuration.
     */
    private setCustomConfig(selector: string, config: OverlayRootConfig): void {
        this.configs[selector] = { ...this.getCustomConfig(selector), ...config };
    }

    /**
     * @description
     * Since Overlay only considers an offset distance, this must be the sum between
     * Offset & Arrow sizes so the Overlay can calculate the position properly.
     *
     * @param { OverlayProcessedConfig } config - The given processed config (custom/module levels).
     * @param { string } selector - The given selector (optional) to get the defaults from the module.
     * @returns { number } The sum of Offset & Arrow sizes.
     */
    getProcessedOffset(config: OverlayProcessedConfig, selector?: string): number {
        const defaults: OverlayRootConfig = this.getCustomConfig(selector);
        const offsetSize =
            this.DOMHelper.getNumericValue(
                config.custom?.offsetSize ?? config.module?.offsetSize ?? defaults.offsetSize
            ) ?? 0;
        const arrowSize =
            this.DOMHelper.getNumericValue(
                config.custom?.arrowSize ?? config.module?.arrowSize ?? defaults.arrowSize
            ) ?? 0;
        return offsetSize + arrowSize;
    }

    /**
     * @description
     * To combine both, module's and custom's, class names.
     *
     * @param { OverlayProcessedConfig } config - The given processed config (custom/module levels).
     * @returns { string[] } The class names.
     */
    getProcessedClassNames(config: OverlayProcessedConfig): string[] {
        const classNameModule: string[] = this.getClassNames(config.module?.className ?? []) as string[];
        const classNameCustom: string[] = this.getClassNames(config.custom?.className ?? []) as string[];
        return classNameModule.concat(classNameCustom);
    }

    /**
     * @description
     * Checks the `config` and/or `selector` and returns both, the custom instance config and module config.
     *
     * @param { OverlayConfig | string } config - The given configuration object or selector.
     * @returns { OverlayProcessedConfig } The processed configurations (for `module` & `custom` levels).
     */
    getProcessedConfig(config: OverlayCustomNoTriggerConfig | string): Required<OverlayProcessedConfig> {
        let module: OverlayRootConfig = {};
        let custom: OverlayCustomConfig = {};

        if (config) {
            const isConfigString: boolean = typeof config === 'string';
            const moduleSelector: string | undefined = isConfigString
                ? (config as string).trim()
                : (config as OverlayCustomConfig).selector?.trim();

            if (moduleSelector) module = this.getCustomConfig(moduleSelector);
            custom = !isConfigString ? (config as OverlayConfig) : { selector: moduleSelector };
        }

        return { module, custom };
    }

    /**
     * @description
     * Process and returns the class names as an array of strings.
     *
     * @param { string | string[] } classNames - The given class names.
     * @returns { string[] | undefined }
     */
    getClassNames(classNames: string | string[] | undefined): string[] | undefined {
        if (typeof classNames === 'string') {
            classNames = classNames
                .replace(/ +/g, ' ')
                .split(' ')
                .map((className) => className.trim());
        }

        return classNames;
    }

    /**
     * @description
     * Gets the combined configurations for Global & Module level.
     *
     * @param { string } selector - The given selector.
     * @returns { OverlayRootConfig }
     */
    getConfig(selector: string): OverlayRootConfig {
        return { ...this.rootConfig, ...this.getCustomConfig(selector) };
    }

    /**
     * Updates the Module level config.
     *
     * @param { string } selector - The given selector to update.
     * @param { OverlayRootConfig } config - The given configuration to update.
     */
    updateConfig(selector: string, config: OverlayRootConfig): void {
        selector = selector.trim();

        if (this.selectorNotAllowed(selector) || !config || !selector.length) return;

        if (!this.isSelectorInConfig(selector)) {
            console.warn(ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING(selector));
            return;
        }

        this.setCustomConfig(selector, config);
    }

    /**
     * @description
     * To check if a selector is already set within the configurations.
     *
     * @param { string } selector - The given selector
     * @returns { boolean }
     */
    isSelectorInConfig(selector: string): boolean {
        return selector in this.configs;
    }
}
