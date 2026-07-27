import { Injectable } from '@angular/core';

import {
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED,
    ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING,
} from './menu.errors';

import { MENU_SELECTOR } from './menu.type.private';
import { MENU_CONFIG_DEFAULT } from './menu.type';
import type { MenuConfig, MenuCustomConfig } from './menu.type';

@Injectable({ providedIn: 'root' })
export class MenuRootService {
    private rootConfigAlreadyProvided: boolean = false;

    /**
     * @description
     * Blocks any possible repeated use of `A11yMenuModule.rootConfig()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    /**
     * @description
     * The global menu config.
     */
    get globalConfig(): MenuConfig {
        return this.configs[MENU_SELECTOR];
    }

    private readonly configs: { [selector: string]: MenuConfig } = {
        [MENU_SELECTOR]: { ...MENU_CONFIG_DEFAULT },
    };

    /**
     * @description
     * Avoids initiate same config multiple times.
     */
    private readonly customConfigsInitiated: string[] = [];

    /**
     * @description
     * Initializes the Menu root config.
     */
    initRootConfig(rootConfig: MenuConfig): void {
        this.rootConfigAlreadyProvided = true;

        this.cleanConfigUndefined(rootConfig);

        // Save the global config
        Object.assign(this.configs[MENU_SELECTOR], rootConfig);
    }

    /**
     * @description
     * Initializes the custom (feature level) configurations.
     */
    initCustomConfigs(userCustomConfigs: MenuCustomConfig[]): void {
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
            this.configs[selector] = {};

            this.updateConfig(selector, userConfig);
        });
    }

    /**
     * @description
     * Updates the custom (feature level) configuration from the given selector.
     */
    updateConfig(selector: string, config: MenuConfig): void {
        if (this.selectorNotAllowed(selector) || !config || !selector.trim().length) return;

        const isSelectorInConfig: boolean = selector in this.configs;
        if (!isSelectorInConfig) {
            console.warn(ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING(selector));
            return;
        }

        this.cleanConfigUndefined(config);

        const currentConfig: MenuConfig = this.getFeatureConfig(selector);

        const { className } = config;
        if (className) {
            const currentClassNames: string[] = this.classNameToArray(currentConfig.className);
            const newClassNames: string[] = this.classNameToArray(className);
            config.className = currentClassNames.concat(newClassNames);
        }

        Object.assign(this.configs[selector], config);
    }

    /**
     * @description
     * Gets the custom (feature level) configuration from the given selector.
     */
    getFeatureConfig(selector: string): MenuConfig {
        return this.configs[selector] ?? {};
    }

    /**
     * @description
     * Parses the class names into an array of strings.
     */
    classNameToArray(classNames: string | string[] | undefined): string[] {
        if (!classNames) return [];
        if (!Array.isArray(classNames)) classNames = classNames.split(/\s+/).filter(Boolean);
        return classNames;
    }

    /**
     * @description
     * Removes any undefined property from the given config object.
     */
    cleanConfigUndefined<T extends Record<string, unknown> = MenuConfig>(config: T): T {
        (Object.keys(config) as (keyof T)[]).forEach((key) => {
            const value: T[keyof T] = config[key];
            if (value === undefined) delete config[key];
            else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                this.cleanConfigUndefined(value as Record<string, unknown>);
            }
        });
        return config;
    }

    /**
     * @description
     * To block some configs if selector is 'a11y-menu-container' or 'a11y-menu'.
     */
    private selectorNotAllowed(selector: string): boolean {
        return ['a11y-menu-container', MENU_SELECTOR].includes(selector.trim().toLowerCase());
    }
}
