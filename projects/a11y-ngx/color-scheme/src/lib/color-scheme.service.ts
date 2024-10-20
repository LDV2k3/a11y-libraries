import { Injectable, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE, ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND } from './color-scheme.errors';

import {
    ColorScheme,
    ColorSchemeCSSMap,
    ColorSchemeConfig,
    ColorSchemeGlobalConfig,
    ColorSchemeProperties,
    ColorSchemeChange,
    ColorSchemeItem,
    ColorSchemes,
    ColorSchemesObject,
    COLOR_SCHEME_GENERICS_DEFAULTS,
    COLOR_SCHEME_DEFAULTS,
} from './color-scheme.type';
import {
    ColorSchemeCSSType,
    ColorSchemeCSSProperty,
    ColorSchemeConfigs,
    ColorSchemeDefaultConfig,
    COLOR_SCHEME_TAG_ID,
    COLOR_SCHEME_BASE_MAP,
    COLOR_SCHEME_GLOBAL_CONFIG_DEFAULT,
    COLOR_SCHEME_STYLE_CLASS,
    COLOR_SCHEME_GENERICS,
    COLOR_SCHEME_ITEMS_DEFAULTS,
} from './color-scheme.type.private';

export const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

const CONFIG_ROOT_SELECTOR: string = ':root';

@Injectable({ providedIn: 'root' })
export class ColorSchemeService implements OnDestroy {
    private readonly localStorageKey: string = 'a11y.colorScheme';
    private readonly matchMediaDark: string = '(prefers-color-scheme: dark)';

    private readonly allColorSchemes: ColorSchemeItem[] = [];
    private readonly allConfigs: ColorSchemeConfigs = {
        [CONFIG_ROOT_SELECTOR]: {
            selector: CONFIG_ROOT_SELECTOR,
            styles: { generics: COLOR_SCHEME_GENERICS_DEFAULTS, schemes: COLOR_SCHEME_DEFAULTS },
            cssTagID: COLOR_SCHEME_TAG_ID,
            stylesMap: COLOR_SCHEME_BASE_MAP,
        },
    };

    /** @description The global configuration, updated when `A11yColorSchemeModule.rootConfig()` is used. */
    readonly globalConfig: Required<ColorSchemeGlobalConfig> = COLOR_SCHEME_GLOBAL_CONFIG_DEFAULT;

    /** @description The default Scheme to be used. */
    private defaultValue: ColorScheme = 'auto';
    /** @description The Scheme selected within the system. */
    private systemValue!: ColorScheme;
    /** @description The chosen Scheme. */
    private chosenValue!: ColorScheme;
    /** @description The previous Scheme, if changed. */
    private previousValue!: ColorScheme;

    /** @description Whether the change of the Scheme was made by the `system` or the `user`. */
    private changedBy: 'system' | 'user' = 'user';

    /** @description To listen when the Scheme has changed. */
    colorSchemeChanged: BehaviorSubject<ColorSchemeChange> = new BehaviorSubject<ColorSchemeChange>({
        colorSchemePrevious: this.defaultValue,
        colorSchemeCurrent: this.defaultValue,
        changedBy: 'system',
    });

    /** @description Whether the current system's scheme is set to `dark`. */
    get isSystemThemeDark(): boolean {
        return window.matchMedia && window.matchMedia(this.matchMediaDark).matches;
    }

    /** @description All the available Color Schemes. */
    get colorSchemes(): ColorSchemeItem[] {
        return this.allColorSchemes;
    }

    /** @description To get/set the user's chosen Scheme. */
    get userChosen(): ColorScheme {
        return this.chosenValue ?? 'auto';
    }

    set userChosen(colorScheme: ColorScheme) {
        if (this.chosenValue !== colorScheme) {
            if (this.chosenValue === 'auto') {
                this.stopSystemColorSchemeListener();
            } else if (colorScheme === 'auto') {
                this.checkSystemColorScheme();
                this.initSystemColorSchemeListener();
            }
        }

        this.previousValue = this.colorScheme;

        this.chosenValue = colorScheme;
        this.colorScheme = colorScheme;
        this.saveColorScheme = colorScheme;
    }

    /** @description To know if the user is allowed to change the Schemes or not. */
    get allowUserToChangeScheme(): boolean {
        return this.globalConfig.allowUserToChangeScheme ?? false;
    }

    /** @description The root configuration. */
    get rootConfig(): ColorSchemeConfig {
        return this.allConfigs[CONFIG_ROOT_SELECTOR] as ColorSchemeConfig;
    }

    /** @description To get/set the Scheme. */
    private get colorScheme(): ColorScheme {
        return this.chosenValue === 'auto' ? this.systemValue : this.chosenValue;
    }

    private set colorScheme(colorScheme: ColorScheme) {
        const changedBy = this.changedBy;
        const colorSchemePrevious: ColorScheme = this.previousValue;
        const colorSchemeCurrent: ColorScheme = colorScheme;
        this.colorSchemeChanged.next({ colorSchemePrevious, colorSchemeCurrent, changedBy });
        this.updatePageColorScheme();
    }

    /** @description To save the Scheme in the local storage. */
    private set saveColorScheme(colorScheme: ColorScheme) {
        localStorage.setItem(this.localStorageKey, colorScheme);
    }

    constructor(
        @Inject(DOCUMENT) private document: Document,
        @Optional() @SkipSelf() private parentService: ColorSchemeService
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ColorSchemeService'));

        this.initColorSchemeDefaults();
        this.initColorScheme();
    }

    ngOnDestroy(): void {
        this.stopSystemColorSchemeListener();
        const styleElements = Array.from(
            this.document.head.getElementsByClassName(COLOR_SCHEME_STYLE_CLASS)
        ) as HTMLStyleElement[];
        styleElements.forEach((styleElement: HTMLStyleElement) => styleElement.remove());
    }

    /**
     * @description
     * To know whether the given selector can use Bootstrap styles or not.
     *
     * @param { string } selector - The given selector.
     * @returns { boolean }
     */
    useBootstrapStyles(selector: string): boolean {
        const config: ColorSchemeConfig = this.getConfig(selector);
        return !this.selectorNotAllowed(selector) && !config.forceScheme && !!config.useBootstrapStyles;
    }

    /**
     * @description
     * Get the current Color Scheme for a given selector.
     *
     * @param { string } selector - The given selector.
     * @returns { ColorSchemeProperties } An object of the properties & values of the current scheme.
     */
    getCurrentScheme(selector: string): ColorSchemeProperties | undefined {
        const config: ColorSchemeConfig = this.getConfig(selector);
        const styles: ColorSchemeProperties | ColorSchemesObject = config.styles;
        let returnScheme: ColorSchemeProperties | undefined;

        if (styles) {
            if ('generics' in styles || 'schemes' in styles) {
                if ('generics' in styles) returnScheme = styles.generics as ColorSchemeProperties;
                if ('schemes' in styles) {
                    const schemes = styles.schemes as ColorSchemes;
                    let scheme: ColorSchemeProperties | undefined;

                    if (config.forceScheme) scheme = schemes[config.forceScheme] as ColorSchemeProperties;
                    if (!scheme) scheme = schemes[this.colorScheme] as ColorSchemeProperties;

                    returnScheme = { ...returnScheme, ...scheme };
                }
            } else {
                returnScheme = styles as ColorSchemeProperties;
            }
        }

        return returnScheme;
    }

    /**
     * @description
     * Get the config from a given selector.
     * If the selector does not match with any of the saved ones, it will return an empty object.
     *
     * @param { string } selector - The given selector.
     * @returns { ColorSchemeConfig } The config.
     */
    getConfig(selector: string): ColorSchemeConfig {
        return (this.allConfigs[selector] ?? {}) as ColorSchemeDefaultConfig;
    }

    /**
     * @description
     * Saves the config and creates the CSS `<style>` tag.
     *
     * @param { ColorSchemeConfig } config - The given config.
     */
    setConfig(config: ColorSchemeConfig): void {
        if (this.selectorNotAllowed(config.selector)) return;

        this.allConfigs[config.selector] = config as ColorSchemeDefaultConfig;
        this.createCSS(config.selector);
    }

    /**
     * @description
     * To update the config with new values. It will also update the `<style>` tag.
     *
     * @param { string } selector - The given selector.
     * @param { any | ColorSchemeProperties | ColorSchemesObject } config - The given config object.
     * @param { string } colorSchemesProperty - The name of the property to search the schemes within the config object.
     */
    updateConfig(
        selector: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: any | ColorSchemeProperties | ColorSchemesObject,
        colorSchemesProperty?: string
    ): void {
        if (!config || this.selectorNotAllowed(selector)) return;

        const currentConfig: ColorSchemeConfig | undefined = this.getConfig(selector);
        let updateCSS: boolean = false;

        if (currentConfig) {
            if ('useBootstrapStyles' in config) currentConfig.useBootstrapStyles = config.useBootstrapStyles;
            if ('forceScheme' in config) {
                currentConfig.forceScheme = config.forceScheme;
                updateCSS = true;
            }

            const styles: ColorSchemesObject = currentConfig.styles as ColorSchemesObject;
            const currentConfigGenerics: ColorSchemeProperties | undefined = styles?.generics;
            const currentConfigSchemes: ColorSchemes | undefined = styles?.schemes;
            const forceColorScheme: ColorScheme | undefined = currentConfig.forceScheme;

            /** Updates the selector's config with the new values. */
            const updateConfigProperty = (
                properties: ColorSchemeProperties,
                property: string,
                applyToScheme?: ColorScheme
            ) => {
                const propertyValue: ColorSchemeCSSType = properties[property];

                if (currentConfigGenerics && property in currentConfigGenerics) {
                    // If there's a 'generic' object within the current config and the property is also within that object.
                    currentConfigGenerics[property] = propertyValue;
                    updateCSS = true;
                } else if (currentConfigSchemes) {
                    // If there's a 'schemes' object within the current config.
                    if (forceColorScheme) {
                        // If there's a scheme forced to be used.
                        const forcedScheme: ColorSchemeProperties | undefined = currentConfigSchemes[forceColorScheme];

                        if (forcedScheme) {
                            forcedScheme[property] = propertyValue;
                            updateCSS = true;
                        }
                    } else {
                        // If not forced scheme, it will search for each scheme and update the property within
                        // a given scheme only (`applyToScheme`), or the current scheme by default and remove it from the rest.
                        Object.keys(currentConfigSchemes)
                            .filter((colorScheme: ColorScheme) => !applyToScheme || applyToScheme === colorScheme)
                            .forEach((colorScheme: ColorScheme) => {
                                const scheme: ColorSchemeProperties | undefined = currentConfigSchemes[colorScheme];
                                if (scheme) {
                                    if (applyToScheme || colorScheme === this.colorScheme) {
                                        // If there's a specific scheme to apply the value or, by default, apply it to current scheme.
                                        scheme[property] = propertyValue;
                                    } else {
                                        // If there's no specific scheme to apply, it will remove the property from the other schemes.
                                        delete scheme[property];
                                    }
                                    updateCSS = true;
                                }
                            });
                    }
                } else {
                    // There are no schemes, the styles object is just a loose group of properties.
                    (currentConfig.styles as ColorSchemeProperties)[property] = propertyValue;
                    updateCSS = true;
                }
            };
            /** If config contains 'generics' or 'schemes'. */
            const containsGenericsOrSchemes = (config: ColorSchemesObject) =>
                'generics' in config || 'schemes' in config;
            /** If config is of type `ColorSchemesObject`, which contains 'generics' and/or 'schemes'. */
            const checkGenericsAndSchemesProperties = (config: ColorSchemesObject) => {
                if ('generics' in config) {
                    const genericsProperties: ColorSchemeProperties = config.generics as ColorSchemeProperties;
                    this.findMatchingProperties(selector, genericsProperties).forEach((property: string) =>
                        updateConfigProperty(genericsProperties, property)
                    );
                }

                if ('schemes' in config) {
                    const schemes: ColorSchemes = config.schemes as ColorSchemes;

                    // Pre-filters the schemes based on a possible forced value, or all by default.
                    const schemesToUpdate: ColorScheme[] = Object.keys(schemes).filter(
                        (colorScheme: ColorScheme) => !forceColorScheme || colorScheme === forceColorScheme
                    );

                    // Shows an error if a forced scheme was chosen to be used but it doesn't exist within the given config.
                    if (forceColorScheme && !['light', 'dark'].includes(forceColorScheme) && !schemesToUpdate.length) {
                        console.error(ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND(forceColorScheme, selector));
                    }

                    // Updates the schemes.
                    schemesToUpdate.forEach((colorScheme: ColorScheme) => {
                        const schemeProperties = schemes[colorScheme] as ColorSchemeProperties;
                        // Creates the Custom Scheme, if it does not exist in the current config.
                        if (currentConfigSchemes && !(colorScheme in currentConfigSchemes)) {
                            const newSchemeProperties: ColorSchemeProperties = forceColorScheme
                                ? { ...currentConfigSchemes.light }
                                : {};
                            currentConfigSchemes[colorScheme] = newSchemeProperties;
                        }
                        this.findMatchingProperties(selector, schemeProperties).forEach((property: string) =>
                            updateConfigProperty(schemeProperties, property, colorScheme)
                        );
                    });
                }
            };
            /** If config is of type `ColorSchemeProperties`, a simple object of properties. */
            const checkCommonProperties = (config: ColorSchemeProperties) => {
                this.findMatchingProperties(selector, config).forEach((property: string) =>
                    updateConfigProperty(config, property)
                );
            };

            if (containsGenericsOrSchemes(config)) {
                checkGenericsAndSchemesProperties(config);
            } else {
                checkCommonProperties(config);

                if (colorSchemesProperty && colorSchemesProperty in config) {
                    if (containsGenericsOrSchemes(config[colorSchemesProperty])) {
                        checkGenericsAndSchemesProperties(config[colorSchemesProperty]);
                    } else {
                        checkCommonProperties(config[colorSchemesProperty]);
                    }
                }
            }

            if (updateCSS) this.updateCSS(selector);
        }
    }

    /**
     * @description
     * Process and returns a string with all the custom configuration to be
     * used in the `style` property within the main element.
     *
     * @param { string } selector - The given element selector.
     * @param { ColorSchemeProperties } customConfig - The given configuration.
     * @returns { CSSStyleDeclaration } A string with all the CSS properties.
     */
    getCustomStyles(selector: string, customConfig: ColorSchemeProperties): CSSStyleDeclaration {
        const styles: Record<string, string> = {};

        if (Object.keys(customConfig ?? {}).length) {
            const currentConfig: ColorSchemeConfig = this.getConfig(selector);
            const properties: ColorSchemeCSSMap = currentConfig.stylesMap;
            const useBootstrapCustom: boolean = customConfig.useBootstrapStyles as unknown as boolean;
            const useBootstrapGlobal: boolean = this.useBootstrapStyles(selector);
            const useBootstrap: boolean = useBootstrapCustom ?? useBootstrapGlobal;

            this.findMatchingProperties(selector, properties).forEach((property: string) => {
                const configProperty: ColorSchemeCSSType = customConfig[property];

                const getCurrentProperty = (): ColorSchemeCSSType | undefined => {
                    const styles: ColorSchemesObject = currentConfig.styles as ColorSchemesObject;
                    const genericObject: ColorSchemeProperties | undefined = styles?.generics;
                    const schemeObject: ColorSchemes | undefined = styles?.schemes;

                    if ('generics' in currentConfig.styles && genericObject && property in genericObject) {
                        return genericObject[property];
                    } else if ('schemes' in currentConfig.styles && schemeObject) {
                        const scheme: ColorSchemeProperties | undefined =
                            schemeObject[currentConfig.forceScheme ?? this.colorScheme] ?? schemeObject['light'];
                        return scheme?.[property];
                    } else {
                        return (currentConfig.styles as ColorSchemeProperties)[property];
                    }
                };

                const currentProperty: ColorSchemeCSSType | undefined = getCurrentProperty();

                if (
                    (useBootstrapGlobal && !useBootstrapCustom) ||
                    (((typeof configProperty === 'number' && !isNaN(configProperty)) || configProperty) &&
                        configProperty !== currentProperty)
                ) {
                    const item: ColorSchemeCSSProperty = this.getCSSProperty(properties[property]);

                    if (!useBootstrap || (useBootstrap && !item.ignoreIfUsingBS)) {
                        const propertyValue: ColorSchemeCSSType = configProperty ?? currentProperty;
                        styles[item.property] = `${propertyValue}${item.suffix ?? ''}`;
                    }
                }
            });
        }

        return styles as unknown as CSSStyleDeclaration;
    }

    /** @description To init the Color Scheme default values. */
    initColorScheme(useScheme: ColorScheme | undefined = undefined): void {
        if (useScheme) this.defaultValue = useScheme;

        this.setColorSchemeRootCSS();

        if (this.defaultValue === 'auto' || this.allowUserToChangeScheme) {
            this.checkSystemColorScheme();
            const storageValue: string | null = localStorage.getItem(this.localStorageKey);

            if (!storageValue) {
                this.userChosen = this.defaultValue;
                this.saveColorScheme = this.defaultValue;
            } else {
                this.userChosen = storageValue as ColorScheme;
                this.defaultValue = this.userChosen;
            }
        } else {
            this.userChosen = this.defaultValue;
        }
    }

    /**
     * @description
     * To block some configs if selector is 'root' or ':root'.
     *
     * @param { string } selector - The given selector.
     * @returns { boolean }
     */
    selectorNotAllowed(selector: string): boolean {
        return ['root', CONFIG_ROOT_SELECTOR].includes(selector);
    }

    /**
     * @description
     * To init a new Color Scheme.
     *
     * @param { ColorSchemeItem } newScheme - The new Color Scheme.
     */
    newScheme(newScheme: ColorSchemeItem): void {
        this.allColorSchemes.splice(this.allColorSchemes.length - 1, 0, newScheme);

        const newSchemeValues: ColorSchemeProperties = {};

        for (const key in COLOR_SCHEME_GENERICS) {
            const keyValue: ColorSchemeCSSType = newScheme.scheme[key];
            if (keyValue) newSchemeValues[key] = keyValue;
        }

        (this.rootConfig.styles.schemes as ColorSchemes)[newScheme.value as ColorScheme] = newSchemeValues;
    }

    /**
     * @description
     * To check if a selector is already set within the configurations.
     *
     * @param { string } selector - The given selector
     * @returns { boolean }
     */
    isSelectorInConfig(selector: string): boolean {
        return selector in this.allConfigs;
    }

    /**
     * @description
     * To set the Color Scheme in the `<html>` tag.
     */
    private updatePageColorScheme(): void {
        this.document.documentElement.setAttribute(this.globalConfig.attributeSelectorMatch, this.colorScheme);
    }

    /**
     * @description
     * Creates a `<style>` tag with the given CSS properties.
     *
     * @param { string } selector - The root/custom selector.
     */
    private createCSS(selector: string): void {
        const processedCSS: [string, string] = this.processCSS(selector);
        const style: HTMLStyleElement = this.document.createElement('style');
        style.setAttribute('id', processedCSS[0]);
        style.classList.add(COLOR_SCHEME_STYLE_CLASS);
        style.innerHTML = processedCSS[1];

        this.document.head.appendChild(style);
    }

    /**
     * @description
     * Updates the `<style>` tag with the updated CSS properties.
     *
     * @param { string } selector - The given selector.
     */
    private updateCSS(selector: string): void {
        const processedCSS: [string, string] = this.processCSS(selector);
        const style: HTMLStyleElement = this.document.getElementById(processedCSS[0]) as HTMLStyleElement;

        if (style) style.innerHTML = processedCSS[1];
    }

    /**
     * @description
     * Get the object with the property in case a string was given.
     *
     * @param { string | ColorSchemeCSSProperty } propertyValue - The property.
     * @returns { ColorSchemeCSSProperty } An object with the property.
     */
    private getCSSProperty(propertyValue: string | ColorSchemeCSSProperty): ColorSchemeCSSProperty {
        if (typeof propertyValue === 'string') return { property: propertyValue };
        return propertyValue;
    }

    /**
     * @description
     * Process the CSS properties to be set inside the `<style>` tag.
     *
     * @param { string } selector - The given selector.
     * @returns { [ string, string ] } An array of two strings, one for the tag's ID (`[0]`) and another for the CSS properties (`[1]`).
     */
    private processCSS(selector: string): [string, string] {
        const config: ColorSchemeConfig = this.getConfig(selector);

        const styles: ColorSchemeProperties | ColorSchemesObject = config.styles;
        const stylesMap: ColorSchemeCSSMap = config.stylesMap;
        const stylesID: string = config?.cssTagID ?? this.getStyleIDFromSelector(selector);
        const useBootstrap: boolean = this.useBootstrapStyles(selector);
        const schemes: { light: string[]; dark: string[]; [scheme: string]: string[] } = { light: [], dark: [] };

        const getScheme = (scheme: ColorScheme, includeGenerics: boolean = true): string[] => {
            const properties = this.getProperties(selector, scheme, includeGenerics);

            return (
                Object.keys(properties)
                    // Filters by the properties that exist within `properties`.
                    .filter((property: string) => properties[property])
                    // Maps the properties and their values.
                    .map((property: string) => getCSSProperty(property, properties[property]))
                    // Filters by non-undefined properties.
                    .filter((property: string | undefined) => property) as string[]
            );
        };
        const getCSSProperty = (property: string, value: ColorSchemeCSSType): string | undefined => {
            const item: ColorSchemeCSSProperty = this.getCSSProperty(stylesMap[property]);

            if (!useBootstrap || (useBootstrap && !item.ignoreIfUsingBS)) {
                return `${item.property}: ${value}${item.suffix ?? ''};`;
            }
        };

        const schemeObject: ColorSchemes | undefined = (styles as ColorSchemesObject)?.schemes;

        schemes.light = getScheme('light');

        let returnStyles: string = `${config.selector} { ${schemes.light.join('')} }`;

        if (!config.forceScheme && schemeObject) {
            Object.keys(schemeObject as ColorSchemes)
                .filter((scheme: ColorScheme) => scheme !== 'light')
                .forEach((scheme: ColorScheme) => {
                    schemes[scheme] = getScheme(scheme as ColorScheme, false);
                    const schemeDifferences = schemes[scheme]?.filter(
                        (property: string) =>
                            schemes.light.find((lightProperty: string) => lightProperty === property) !== property
                    );

                    if (schemeDifferences.length) {
                        const stylesAttributeSelector: string = this.globalConfig.attributeSelectorMatch;
                        const stylesSelector: string =
                            selector === CONFIG_ROOT_SELECTOR
                                ? `${config.selector}[${stylesAttributeSelector}="${scheme}"]`
                                : `[${stylesAttributeSelector}="${scheme}"] ${config.selector}`;
                        const styleScheme: string = scheme === 'dark' ? scheme : 'normal';
                        const stylesCustom: string = `${stylesSelector} { color-scheme: ${styleScheme}; ${schemeDifferences.join(
                            ''
                        )} }`;

                        returnStyles += stylesCustom;
                    }
                });
        }

        return [stylesID, returnStyles];
    }

    /**
     * @description
     * Get the properties for a given selector & Color Scheme.
     *
     * @param { string } selector - The given selector.
     * @param { ColorScheme } colorScheme - The given color scheme.
     * @param { boolean } includeGenerics - Whether it should include the generics or not.
     * @returns { ColorSchemeProperties } An object of properties & values.
     */
    private getProperties(
        selector: string,
        colorScheme: ColorScheme,
        includeGenerics: boolean = true
    ): ColorSchemeProperties {
        const config: ColorSchemeConfig = this.getConfig(selector);
        const styles: ColorSchemeProperties | ColorSchemesObject = config.styles;
        const stylesMap: ColorSchemeCSSMap = config.stylesMap;
        const properties: ColorSchemeProperties = {};

        Object.keys(stylesMap).forEach((property: string) => {
            const schemeObject = styles as ColorSchemesObject;

            if ('schemes' in schemeObject) {
                if (includeGenerics && schemeObject.generics && property in schemeObject.generics) {
                    properties[property] = schemeObject.generics[property];
                } else {
                    const schemes: ColorSchemes =
                        schemeObject.schemes ??
                        this.colorSchemes.reduce(
                            (schemes: ColorSchemes, item: ColorSchemeItem) => Object.assign(schemes, item.scheme),
                            {} as ColorSchemes
                        );
                    const forceScheme: ColorScheme = config.forceScheme as ColorScheme;
                    let propertyValue: ColorSchemeCSSType | undefined;

                    if (!forceScheme) {
                        propertyValue = schemes[colorScheme]?.[property];
                    } else {
                        const forcedScheme: ColorSchemeProperties = schemes[forceScheme] ?? schemes['light'];
                        propertyValue = forcedScheme?.[property];
                    }

                    if (propertyValue) properties[property] = propertyValue;
                }
            } else {
                properties[property] = (styles as ColorSchemeProperties)[property];
            }
        });

        return properties;
    }

    /**
     * @description
     * Creates a unique ID from the given selector.
     *
     * @param { string } selector - The given selector.
     * @returns { string } The new ID
     */
    private getStyleIDFromSelector(selector: string): string {
        selector
            .replace(/[^a-zA-Z]/g, '-') // Replaces non alphabet characters with hyphen.
            .replace(/-{2,}/g, '-') // Replaces double hyphen with single.
            .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, ''); // Removes non alphabet characters from beginning and end.

        return `${selector}-styles`;
    }

    /** @description Find the matching properties between the given updated config and the selector's config. */
    private findMatchingProperties(selector: string, properties: Record<string, unknown>): string[] {
        return Object.keys(properties ?? {}).filter((property: string) =>
            Object.keys(this.getConfig(selector).stylesMap ?? {}).includes(property)
        );
    }

    /** @description To create/update the root CSS. */
    private setColorSchemeRootCSS(): void {
        const colorSchemeDefault = this.document.getElementById(
            this.getConfig(CONFIG_ROOT_SELECTOR).cssTagID as string
        );

        if (!colorSchemeDefault) {
            this.createCSS(CONFIG_ROOT_SELECTOR);
        } else {
            this.updateCSS(CONFIG_ROOT_SELECTOR);
        }
    }

    /** @description To init the available default Schemes. */
    private initColorSchemeDefaults(): void {
        COLOR_SCHEME_ITEMS_DEFAULTS.forEach((colorScheme: ColorSchemeItem) => {
            const scheme: ColorSchemeProperties = (colorScheme.value !== 'auto'
                ? COLOR_SCHEME_DEFAULTS[colorScheme.value]
                : {}) as unknown as ColorSchemeProperties;

            this.allColorSchemes.push({ ...colorScheme, scheme });
        });
    }

    /** @description To check the current system's Scheme. */
    private checkSystemColorScheme(): void {
        this.systemValue = this.isSystemThemeDark ? 'dark' : 'light';
    }

    /** @description To start the listener for when system's Scheme changes. */
    private initSystemColorSchemeListener(): void {
        window.matchMedia(this.matchMediaDark)?.addEventListener('change', this.onColorSchemeChange);
    }

    /** @description To stop the listener for when system's Scheme changes. */
    private stopSystemColorSchemeListener(): void {
        window.matchMedia(this.matchMediaDark)?.removeEventListener('change', this.onColorSchemeChange);
    }

    /** @description The system's Scheme change callback. */
    private onColorSchemeChange = ((event: MediaQueryListEvent) => {
        if (this.chosenValue !== 'auto') return;

        this.systemValue = event.matches ? 'dark' : 'light';
        this.changedBy = 'system';
        this.colorScheme = this.systemValue;
        this.changedBy = 'user';
    }).bind(this);
}
