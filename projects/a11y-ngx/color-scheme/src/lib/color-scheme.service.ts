import { Injectable, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { WINDOW, LOCAL_STORAGE } from './color-scheme.module.providers.private';

import {
    ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE,
    ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND,
    ERROR_EDIT_CONFIG_NOT_FOUND,
    ERROR_NEW_SCHEME_KEY_NOT_ALLOWED,
} from './color-scheme.errors';

import {
    COLOR_SCHEME_DEFAULTS,
    COLOR_SCHEME_GENERICS_DEFAULTS,
    ColorScheme,
    ColorSchemeCSSMap,
    ColorSchemeConfig,
    ColorSchemeGlobalConfig,
    ColorSchemeProperties,
    ColorSchemeChange,
    ColorSchemeItem,
    ColorSchemeItemNew,
    ColorSchemes,
    ColorSchemesObject,
} from './color-scheme.type';
import {
    SCHEME,
    COLOR_SCHEME_TAG_ID,
    COLOR_SCHEME_BASE_MAP,
    COLOR_SCHEME_STYLE_CLASS,
    COLOR_SCHEME_SELECTOR_MATCH,
    COLOR_SCHEME_ITEMS_DEFAULTS,
    COLOR_SCHEME_GLOBAL_CONFIG_DEFAULT,
    ColorSchemeCSS,
    ColorSchemeCSSType,
    ColorSchemeCSSProperty,
    ColorSchemeConfigs,
    ColorSchemeDefaultConfig,
    ColorSchemeSchemeDefaults,
    ColorSchemeDefaults,
} from './color-scheme.type.private';

const CONFIG_ROOT_SELECTOR: string = ':root';

@Injectable({ providedIn: 'root' })
export class ColorSchemeService implements OnDestroy {
    private readonly localStorageKey: string = 'a11y.colorScheme';
    private readonly matchMediaDark: string = '(prefers-color-scheme: dark)';

    private readonly allColorSchemes: ColorSchemeItem[] = [];
    private readonly allConfigs: ColorSchemeConfigs = {
        [CONFIG_ROOT_SELECTOR]: {
            selector: CONFIG_ROOT_SELECTOR,
            styles: {
                generics: { ...COLOR_SCHEME_GENERICS_DEFAULTS },
                schemes: this.deepCopyObj(COLOR_SCHEME_DEFAULTS),
            },
            cssTagID: COLOR_SCHEME_TAG_ID,
            stylesMap: { ...COLOR_SCHEME_BASE_MAP },
        },
    };

    /**
     * @description
     * The global configuration, updated when `A11yColorSchemeModule.rootConfig()` is used.
     */
    readonly globalConfig: Required<ColorSchemeGlobalConfig> = this.deepCopyObj(COLOR_SCHEME_GLOBAL_CONFIG_DEFAULT);

    private readonly globalStylesMap: { [scheme: string]: ColorSchemeCSSMap } = {};

    /**
     * @description
     * The Scheme selected within the system.
     */
    private systemValue!: ColorScheme;
    /**
     * @description
     * The chosen Scheme.
     */
    private chosenValue!: ColorScheme;
    /**
     * @description
     * The previous Scheme, if changed.
     */
    private previousValue!: ColorScheme;
    /**
     * @description
     * To avoid initiate the values twice (once for `forRoot()` and another from the constructor).
     */
    private schemesAlreadyInitiated: boolean = false;

    /**
     * @description
     * Whether the change of the Scheme was made by the `system` or the `user`.
     */
    private changedBy: 'system' | 'user' = 'user';

    /**
     * @description
     * To listen when the Scheme has changed.
     */
    colorSchemeChanged: BehaviorSubject<ColorSchemeChange> = new BehaviorSubject<ColorSchemeChange>({
        colorSchemePrevious: SCHEME.AUTO,
        colorSchemeCurrent: SCHEME.AUTO,
        changedBy: 'system',
    });

    /**
     * @description
     * Whether the current system's scheme is set to `dark`.
     */
    get isSystemThemeDark(): boolean {
        if (!this.window) return false;
        return this.window.matchMedia && this.window.matchMedia(this.matchMediaDark).matches;
    }

    /**
     * @description
     * All the available Color Schemes.
     */
    get colorSchemes(): ColorSchemeItem[] {
        return this.allColorSchemes;
    }

    /**
     * @description
     * To get/set the user's chosen Scheme.
     */
    get userChosen(): ColorScheme {
        return this.chosenValue ?? SCHEME.AUTO;
    }

    set userChosen(colorScheme: ColorScheme) {
        if (this.chosenValue !== colorScheme) {
            if (this.chosenValue === SCHEME.AUTO) {
                this.stopSystemColorSchemeListener();
            } else if (colorScheme === SCHEME.AUTO) {
                this.checkSystemColorScheme();
                this.initSystemColorSchemeListener();
            }
        }

        this.previousValue = this.colorScheme;

        this.chosenValue = colorScheme;
        this.colorScheme = colorScheme;
        this.saveColorScheme = colorScheme;
    }

    /**
     * @description
     * To know if the user is allowed to change the Schemes or not.
     */
    get allowUserToChangeScheme(): boolean {
        return this.globalConfig.allowUserToChangeScheme;
    }

    /**
     * @description
     * The root configuration.
     */
    get rootConfig(): ColorSchemeConfig {
        return this.allConfigs[CONFIG_ROOT_SELECTOR] as ColorSchemeConfig;
    }

    /**
     * @description
     * To get/set the Scheme.
     */
    private get colorScheme(): ColorScheme {
        return this.chosenValue === SCHEME.AUTO ? this.systemValue : this.chosenValue;
    }

    private set colorScheme(colorScheme: ColorScheme) {
        const changedBy = this.changedBy;
        const colorSchemePrevious: ColorScheme = this.previousValue;
        const colorSchemeCurrent: ColorScheme = this.colorScheme;

        if (colorSchemePrevious !== colorSchemeCurrent) {
            this.colorSchemeChanged.next({ colorSchemePrevious, colorSchemeCurrent, changedBy });
            this.updatePageColorScheme();
        }
    }

    /**
     * @description
     * To save the Scheme in the local storage.
     */
    private set saveColorScheme(colorScheme: ColorScheme) {
        this.localStorage?.setItem(this.localStorageKey, colorScheme);
    }

    constructor(
        @Inject(DOCUMENT) private document: Document,
        @Inject(WINDOW) private window: Window | undefined,
        @Inject(LOCAL_STORAGE) private localStorage: Storage | undefined,
        @Optional() @SkipSelf() private parentService: ColorSchemeService
    ) {
        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ColorSchemeService'));

        this.initColorSchemeDefaults();

        setTimeout(() => !this.schemesAlreadyInitiated && this.initColorScheme(), 5);
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
     * Get the current Color Scheme for a given selector.
     *
     * @param { string } selector - The given selector.
     * @returns { ColorSchemeProperties } An object of the properties & values of the current scheme.
     */
    getCurrentScheme(selector: string): ColorSchemeProperties | undefined {
        const { styles, forceScheme } = this.getConfig(selector);
        let returnScheme: ColorSchemeProperties | undefined;

        if (styles) {
            const genericsExist: boolean = 'generics' in styles;
            const schemesExist: boolean = 'schemes' in styles;

            if (genericsExist || schemesExist) {
                if (genericsExist) returnScheme = styles.generics as ColorSchemeProperties;
                if (schemesExist) {
                    const { schemes } = styles as { schemes: ColorSchemes };
                    let scheme: ColorSchemeProperties | undefined;

                    if (forceScheme) scheme = schemes[forceScheme] as ColorSchemeProperties;
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

        // Copy the entire config.
        const newConfig: ColorSchemeConfig = this.deepCopyObj(config);

        const { stylesMap } = newConfig;
        const { generics } = newConfig.styles as ColorSchemesObject;

        // Delete any property where its value is not a CSS variable.
        Object.keys(stylesMap).forEach((mapProperty: string) => {
            const { property } = this.getCSSProperty(stylesMap[mapProperty]);
            if (!property.startsWith('--')) delete stylesMap[mapProperty];
        });

        // Add to the map all the generics that were added as a CSS variable.
        if (generics)
            Object.keys(generics)
                .filter((property: string) => property.trim().startsWith('--') && generics[property] !== undefined)
                .forEach((property: string) => (stylesMap[property.trim()] = property.trim()));

        // TODO: needs refactor!!!
        // TODO: needs refactor!!!
        // To avoid create the CSS only for that forced scheme
        delete newConfig.forceScheme;
        // TODO: needs refactor!!!
        // TODO: needs refactor!!!

        this.allConfigs[newConfig.selector] = newConfig as ColorSchemeDefaultConfig;
        this.createCSS(newConfig.selector);
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

        if (!Object.keys(currentConfig).length) {
            console.warn(ERROR_EDIT_CONFIG_NOT_FOUND(selector));
            return;
        }

        const { generics: currentConfigGenerics = {}, schemes: currentConfigSchemes } =
            currentConfig.styles as ColorSchemesObject;
        const { forceScheme } = currentConfig;

        /**
         * @description
         * Updates the selector's config with the new values.
         */
        const updateConfigProperty = (
            properties: ColorSchemeProperties,
            property: string,
            applyToScheme?: ColorScheme
        ) => {
            const propertyValue: ColorSchemeCSSType = properties[property];

            if (property in currentConfigGenerics) {
                // If the property is within the 'generic' object in the current config.
                currentConfigGenerics[property] = propertyValue;
                updateCSS = true;
            } else if (currentConfigSchemes) {
                // If there's a 'schemes' object within the current config.
                if (forceScheme) {
                    // If there's a scheme forced to be used.
                    const forcedScheme: ColorSchemeProperties | undefined = currentConfigSchemes[forceScheme];

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

                            if (!scheme) return;

                            if (applyToScheme || colorScheme === this.colorScheme) {
                                // If there's a specific scheme to apply the value or, by default, apply it to current scheme.
                                scheme[property] = propertyValue;
                            } else {
                                // If there's no specific scheme to apply, it will remove the property from the other schemes.
                                delete scheme[property];
                            }
                            updateCSS = true;
                        });
                }
            } else {
                // There are no schemes, the styles object is just a loose group of properties.
                (currentConfig.styles as ColorSchemeProperties)[property] = propertyValue;
                updateCSS = true;
            }
        };

        /**
         * @description
         * If config contains 'generics' or 'schemes'.
         */
        const containsGenericsOrSchemes = (config: ColorSchemesObject) => 'generics' in config || 'schemes' in config;

        /**
         * @description
         * If config is of type `ColorSchemesObject`, which contains 'generics' and/or 'schemes'.
         */
        const checkGenericsAndSchemesProperties = (config: ColorSchemesObject) => {
            const { generics, schemes } = config;

            if (generics && Object.keys(generics).length) {
                this.findMatchingProperties(selector, generics).forEach((property: string) =>
                    updateConfigProperty(generics, property)
                );
            }

            if (schemes && Object.keys(schemes).length) {
                // Pre-filters the schemes based on a possible forced value, or all by default.
                const schemesToUpdate: ColorScheme[] = Object.keys(schemes).filter(
                    (colorScheme: ColorScheme) => !forceScheme || colorScheme === forceScheme
                );

                // Shows an error if a forced scheme was chosen to be used but it doesn't exist within the given config.
                if (forceScheme && !this.isDarkLight(forceScheme) && !schemesToUpdate.length) {
                    console.error(ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND(forceScheme, selector));
                }

                // Updates the schemes.
                schemesToUpdate.forEach((colorScheme: ColorScheme) => {
                    const schemeProperties = schemes[colorScheme] as ColorSchemeProperties;
                    // Creates the Custom Scheme, if it does not exist in the current config.
                    if (currentConfigSchemes && !(colorScheme in currentConfigSchemes)) {
                        const newSchemeProperties: ColorSchemeProperties = forceScheme
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

        /**
         * @description
         * If config is of type `ColorSchemeProperties`, a simple object of properties.
         */
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

        // Check if any loose properties regarding Color Scheme are present
        // within the given config to apply it as a generic and process it as such.
        this.findMatchingProperties(selector, config)
            // Filter the current non-generic properties.
            .filter((property) => !(property in currentConfigGenerics))
            // Add the property and its value to the generics.
            .forEach((property) => (currentConfigGenerics[property] = config[property]));

        if (updateCSS) this.createCSS(selector);
    }

    /**
     * @description
     * To remove a given configuration by its selector.
     *
     * @param { string } selector - The given selector.
     */
    removeConfig(selector: string): void {
        if (this.selectorNotAllowed(selector)) return;
        delete this.allConfigs[selector];
    }

    /**
     * @description
     * Process and returns a string with all the custom configuration to be
     * used in the inline `style` property on your element.
     *
     * @param { string } selector - The given element selector.
     * @param { ColorSchemeProperties } customConfig - The given custom configuration.
     * @param { ColorScheme } fromScheme - The given Color Scheme, if needed.
     * @returns { CSSStyleDeclaration } A string with all the CSS properties.
     */
    getCustomStyles(
        selector: string,
        customConfig: ColorSchemeProperties,
        fromScheme?: ColorScheme
    ): CSSStyleDeclaration {
        const returnStyles: Record<string, string> = {};

        if (Object.keys(customConfig ?? {}).length) {
            const { styles, stylesMap, forceScheme } = this.getConfig(selector);

            this.findMatchingProperties(selector, stylesMap).forEach((property: string) => {
                const configProperty: ColorSchemeCSSType = customConfig[property];

                const getCurrentProperty = (): ColorSchemeCSSType | undefined => {
                    const { generics, schemes } = styles as ColorSchemesObject;

                    if (generics && property in generics) {
                        return generics[property];
                    } else if (schemes) {
                        const scheme: ColorSchemeProperties | undefined =
                            schemes[fromScheme ?? forceScheme ?? this.colorScheme] ?? schemes.light;
                        return scheme?.[property];
                    } else {
                        return (styles as ColorSchemeProperties)[property];
                    }
                };

                const currentProperty: ColorSchemeCSSType | undefined = getCurrentProperty();

                if (
                    ((typeof configProperty === 'number' && !isNaN(configProperty)) || configProperty) &&
                    configProperty !== currentProperty
                ) {
                    const item: ColorSchemeCSSProperty = this.getCSSProperty(stylesMap[property]);

                    const propertyValue: ColorSchemeCSSType = configProperty ?? currentProperty;
                    returnStyles[item.property] = `${propertyValue}${item.suffix ?? ''}`;
                }
            });
        }

        return returnStyles as unknown as CSSStyleDeclaration;
    }

    /**
     * @description
     * To init the Color Scheme values.
     */
    initColorScheme(): void {
        this.schemesAlreadyInitiated = true;

        const availableSchemes: string[] = this.allColorSchemes.map(({ value }) => value);
        const { useScheme } = this.globalConfig;

        this.createCSS(CONFIG_ROOT_SELECTOR);
        this.checkSystemColorScheme();

        if (useScheme !== SCHEME.AUTO && availableSchemes.includes(useScheme)) {
            this.userChosen = useScheme;
            return;
        }

        const storageValue: string | null = this.localStorage?.getItem(this.localStorageKey) || null;
        const useStorageValue: boolean = storageValue !== null && availableSchemes.includes(storageValue);

        this.userChosen = useStorageValue ? (storageValue as ColorScheme) : SCHEME.AUTO;
    }

    /**
     * @description
     * To block some configs if selector is 'root' or ':root'.
     *
     * @param { string } selector - The given selector.
     * @returns { boolean }
     */
    selectorNotAllowed(selector: string): boolean {
        return ['root', CONFIG_ROOT_SELECTOR].includes(selector.trim().toLowerCase());
    }

    /**
     * @description
     * To get a specific Color Scheme Item.
     *
     * @param { ColorScheme } scheme - The given code-name of the Color Scheme.
     * @returns { ColorSchemeItem | undefined } The Color Scheme Item or `undefined` otherwise.
     */
    getScheme(scheme: ColorScheme): ColorSchemeItem | undefined {
        return this.colorSchemes.find(({ value }) => value === scheme);
    }

    /**
     * @description
     * To init a new Color Scheme.
     *
     * @param { ColorSchemeItemNew } newScheme - The new Color Scheme.
     */
    newScheme(newScheme: ColorSchemeItemNew): void {
        const { value: newSchemeKey, scheme, useMissingPropsFrom } = newScheme;

        if (newSchemeKey.trim().toLowerCase() === 'auto') {
            console.error(ERROR_NEW_SCHEME_KEY_NOT_ALLOWED());
            return;
        }

        // Inserts the new scheme into the penultimate position (last position is for 'auto').
        this.allColorSchemes.splice(this.allColorSchemes.length - 1, 0, newScheme);

        // Default variable suffix set to 'light' scheme.
        let propertyVarSuffix: ColorScheme = SCHEME.LIGHT;

        // If the scheme has a "useMissingPropsFrom" configured, checks if that
        // scheme exists and uses it as the new variable suffix.
        if (useMissingPropsFrom && this.allColorSchemes.some(({ value }) => value === useMissingPropsFrom)) {
            propertyVarSuffix = useMissingPropsFrom;
        }

        const newSchemeValues: ColorSchemeProperties = {};
        const {
            stylesMap,
            styles: { generics = {} },
        } = this.rootConfig;

        for (const key in stylesMap) {
            // If the map key is within the scheme, use its value.
            const keyInScheme: ColorSchemeCSSType | undefined = scheme[key];
            if (keyInScheme) {
                newSchemeValues[key] = keyInScheme;
                continue;
            }

            // If the map key is within the generics, don't add its value.
            const keyInGenerics: boolean = key in (generics as ColorSchemeProperties);
            if (keyInGenerics) continue;

            // Creates the default variable for the property.
            const item: ColorSchemeCSSProperty = this.getCSSProperty(stylesMap[key]);
            newSchemeValues[key] = `var(${item.property}-${propertyVarSuffix})`;
        }

        // Saves the scheme with the new properties.
        (this.rootConfig.styles.schemes as ColorSchemes)[newSchemeKey] = newSchemeValues;

        // Updates the scheme styles map.
        this.updateColorSchemeMap(newSchemeKey);
    }

    /**
     * @description
     * To remove a given Color Scheme.
     *
     * @param { ColorScheme } scheme - The given Color Scheme.
     */
    removeScheme(scheme: ColorScheme): void {
        const schemeIdx: number = this.allColorSchemes.findIndex(({ value }) => value === scheme);
        if (schemeIdx === -1 || this.isDarkLight(scheme)) return;

        this.allColorSchemes.splice(schemeIdx, 1);

        const theSchemes: ColorSchemes = (this.rootConfig.styles.schemes ?? {}) as ColorSchemes;

        if (scheme in theSchemes) {
            delete theSchemes[scheme];
            this.removeCSS(scheme);
        }
    }

    /**
     * @description
     * To update the available default Schemes.
     *
     * @param { ColorSchemeDefaults } defaults - The default values to update.
     */
    updateColorSchemeDefaults(defaults: ColorSchemeDefaults): void {
        Object.keys(defaults).forEach((schemeName: string) => {
            // Process the generic properties, if any.
            if (schemeName === 'generics') {
                const { generics } = defaults;
                if (!generics) return;

                const newGenerics: ColorSchemeProperties = {};

                // Looks for plain variables within the generics and
                // adds them into the root styles map.
                Object.keys(generics)
                    .filter((property: string) => generics[property.trim()] !== undefined)
                    .forEach((property: string) => {
                        const propName: string = property.trim();

                        // If it's a variable, add it to the styles map.
                        if (propName.startsWith('--')) {
                            this.rootConfig.stylesMap[propName] = propName;
                        }

                        // Saves the value to the new generics.
                        newGenerics[propName] = generics[property];
                    });

                // Appends the new generics to the root config.
                this.rootConfig.styles.generics = {
                    ...(this.rootConfig.styles.generics as ColorSchemeProperties),
                    ...newGenerics,
                };

                return;
            }

            // Process the Color Schemes (light, dark & auto).
            const itemScheme: ColorSchemeItem | undefined = this.getScheme(schemeName);
            if (!itemScheme) return;

            const properties = this.deepCopyObj(
                defaults[schemeName as keyof ColorSchemeDefaults]
            ) as ColorSchemeSchemeDefaults;
            const name: string | undefined = properties?.name?.trim();

            if (name) {
                itemScheme.name = name;
                delete properties.name;
            }

            // Updates the item's scheme with the new properties.
            itemScheme.scheme = { ...itemScheme.scheme, ...(properties as ColorSchemeProperties) };

            const schemeCurrentConfig: ColorSchemes = this.rootConfig.styles.schemes as ColorSchemes;
            if (!schemeCurrentConfig?.[schemeName]) return;

            // Updates the scheme with the new properties.
            schemeCurrentConfig[schemeName] = { ...schemeCurrentConfig[schemeName], ...properties };

            // Updates the scheme styles map.
            this.updateColorSchemeMap(schemeName);
        });
    }

    /**
     * @description
     * To check if a selector is already set within the configurations.
     *
     * @param { string } selector - The given selector.
     * @returns { boolean }
     */
    isSelectorInConfig(selector: string): boolean {
        return selector in this.allConfigs;
    }

    /**
     * @description
     * To get the current (or given) Color Scheme attribute
     * selector to implement locally on any of your elements.
     *
     * @param { ColorScheme } forceScheme - The needed Color Scheme.
     * @returns An object with the `attribute` and the `value`.
     *
     * So you'll get, for instance
     * ```typescript
     * { attribute: 'color-scheme', value: 'light' }
     * ```
     * Then you can implement it as `[color-scheme="light"]` in your element.
     */
    getAttributeSelector(forceScheme?: ColorScheme): { attribute: string; value: string } {
        const attribute: string = this.globalConfig.attributeSelectorMatch;
        const value: string = forceScheme ?? this.colorScheme;
        return { attribute, value };
    }

    /**
     * @description
     * To clean undefined values within the given object.
     */
    private cleanUndefined(obj: Record<string, unknown>): void {
        Object.keys(obj).forEach((key) => {
            if (obj[key] === undefined) delete obj[key];
            else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]))
                this.cleanUndefined(obj[key] as Record<string, unknown>);
        });
    }

    /**
     * @description
     * Whether the given Scheme is 'dark' or 'light'
     *
     * @param { ColorScheme } scheme - The given Scheme.
     * @returns { boolean }
     */
    private isDarkLight(scheme: ColorScheme): boolean {
        return [SCHEME.LIGHT, SCHEME.DARK].includes(scheme as SCHEME);
    }

    /**
     * @description
     * To set the Color Scheme in the `<html>` tag.
     */
    private updatePageColorScheme(): void {
        this.document?.documentElement.removeAttribute(COLOR_SCHEME_SELECTOR_MATCH);
        this.document?.documentElement.setAttribute(this.globalConfig.attributeSelectorMatch, this.colorScheme);
    }

    /**
     * @description
     * Creates/Updates the `<style>` tag with the updated CSS properties.
     *
     * @param { string } selector - The given selector.
     */
    private createCSS(selector: string): void {
        if (!this.document) return;

        const theCSS: ColorSchemeCSS = this.processCSS(selector);

        Object.keys(theCSS).forEach((id: string) => {
            const styleID: string = `style#${id}`;
            const currentStyle: HTMLStyleElement = this.document.head.querySelector(styleID) as HTMLStyleElement;

            // Updates the CSS.
            if (currentStyle) {
                currentStyle.innerHTML = theCSS[id];
                return;
            }

            // Creates the CSS.
            const newStyle: HTMLStyleElement = this.document.createElement('style');
            newStyle.setAttribute('id', id);
            newStyle.classList.add(COLOR_SCHEME_STYLE_CLASS);
            newStyle.innerHTML = theCSS[id];

            this.document.head.appendChild(newStyle);
        });
    }

    /**
     * @description
     * Removes the `<style>` tag of the given scheme from the document.
     *
     * @param { ColorScheme } scheme - The given scheme.
     */
    private removeCSS(scheme: ColorScheme): void {
        if (!this.document) return;

        const styleID: string = `style#${COLOR_SCHEME_TAG_ID}-${scheme}`;
        const style: HTMLStyleElement = this.document.head.querySelector(styleID) as HTMLStyleElement;
        if (style) style.remove();
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
     * @returns { ColorSchemeCSS } An object with the CSS ID as the property and the styles as its value.
     */
    private processCSS(selector: string): ColorSchemeCSS {
        const { styles, stylesMap, cssTagID, forceScheme } = this.getConfig(selector);
        const { generics } = styles as ColorSchemesObject;
        const { attributeSelectorMatch } = this.globalConfig;
        const stylesID: string = cssTagID ?? this.getStyleIDFromSelector(selector);

        const getProperties = (scheme?: ColorScheme): string[] => {
            let properties: ColorSchemeProperties;
            let propertiesLoop: string[];
            let map: ColorSchemeCSSMap;

            if (scheme) {
                properties = this.getSchemeProperties(selector, scheme);
                propertiesLoop = Object.keys(properties);
                map = this.getStylesMap(selector, scheme, stylesMap);
            } else {
                properties = generics ?? {};
                propertiesLoop = Object.keys(stylesMap);
                map = stylesMap;
            }

            return (
                propertiesLoop
                    // Filters by non-undefined property value.
                    .filter((property: string) => property in properties && properties[property] !== undefined)
                    // Maps the properties and their values.
                    .map((property: string) => {
                        const item: ColorSchemeCSSProperty = this.getCSSProperty(map[property]);
                        const value: ColorSchemeCSSType = properties[property];

                        const suffix: string = !String(value).startsWith('var(') ? item.suffix ?? '' : '';
                        return `${item.property}:${value}${suffix};`;
                    })
                    // Filters by non-undefined properties.
                    .filter((property: string | undefined) => property) as string[]
            );
        };

        const getGenerics = (): string[] => getProperties();
        const getScheme = (scheme: ColorScheme): string[] => getProperties(scheme);

        let { schemes } = styles as ColorSchemesObject;

        // Process for ':root' selector.
        if (selector === CONFIG_ROOT_SELECTOR) {
            const allTheStyles: ColorSchemeCSS = {};

            if (generics) {
                const processGenerics: string = getGenerics().join('');
                if (processGenerics.length) allTheStyles[stylesID] = `${selector}{${processGenerics}}`;
            }

            if (schemes)
                Object.keys(schemes).forEach((scheme: string) => {
                    const theScheme: string[] = getScheme(scheme);

                    allTheStyles[`${stylesID}-${scheme}`] =
                        `${selector}{${theScheme.join('')}}` +
                        // The Scheme specific.
                        `[${attributeSelectorMatch}="${scheme}"]{` +
                        `color-scheme:${this.isDarkLight(scheme) ? scheme : 'normal'};` +
                        `${theScheme
                            .map((style) => {
                                const variable: string = style.split(':')[0];
                                const variableMain: string = variable.replace(`-${scheme}`, '');
                                const variableDefault: string = !this.isDarkLight(scheme)
                                    ? `,var(${variable.replace(`-${scheme}`, '-light')})`
                                    : '';
                                return `${variableMain}:var(${variable}${variableDefault});`;
                            })
                            .join('')}}`;
                });

            return allTheStyles;
        }

        // Process the rest of the selectors.
        let returnStyles: string = `${selector}{${generics ? getGenerics().join('') : ''}}`;

        if (forceScheme) {
            if (!schemes) schemes = { light: {} };

            if (forceScheme !== SCHEME.LIGHT)
                schemes[forceScheme] = { ...schemes.light, ...(schemes[forceScheme] ?? {}) };

            const schemeData: string[] = getScheme(forceScheme as ColorScheme);

            // Search for duplicate generics when also existing in the forced scheme, and remove them.
            schemeData.forEach((css: string) => {
                const variable: string = css.substring(0, css.indexOf(':') + 1);
                if (returnStyles.indexOf(variable) !== -1) {
                    returnStyles = returnStyles.replace(new RegExp(`${variable}[^;]+;`), '');
                }
            });

            returnStyles = returnStyles.replace('}', schemeData.join('') + '}');
        } else if (schemes) {
            Object.keys(schemes).forEach((scheme: ColorScheme) => {
                const schemeData: string[] = getScheme(scheme as ColorScheme);
                if (!schemeData.length) return;

                const stylesSelector: string =
                    (scheme === SCHEME.LIGHT ? `${selector},` : '') +
                    `[${attributeSelectorMatch}="${scheme}"] ${selector}:not([${attributeSelectorMatch}]),` +
                    `${selector}[${attributeSelectorMatch}="${scheme}"]`;
                const stylesScheme: string = `color-scheme:${this.isDarkLight(scheme) ? scheme : 'normal'};`;
                const stylesCustom: string = `${stylesSelector}{${stylesScheme}${schemeData.join('')}}`;

                returnStyles += stylesCustom;
            });
        }

        return { [stylesID]: returnStyles };
    }

    /**
     * @description
     * Gets the current Styles Map based on the given selector (since ':root' map is saved in another place).
     *
     * @param { string } selector - The given selector.
     * @param { ColorScheme } scheme - The given Color Scheme.
     * @param { ColorSchemeCSSMap } defaultMap - The default given map (if selector !== ':root').
     * @returns { ColorSchemeCSSMap } The map of properties.
     */
    private getStylesMap(selector: string, scheme: ColorScheme, defaultMap: ColorSchemeCSSMap): ColorSchemeCSSMap {
        return selector !== CONFIG_ROOT_SELECTOR ? defaultMap : this.globalStylesMap[scheme];
    }

    /**
     * @description
     * Get the properties for a given selector & Color Scheme.
     *
     * @param { string } selector - The given selector.
     * @param { ColorScheme } colorScheme - The given color scheme.
     * @returns { ColorSchemeProperties } An object of properties & values.
     */
    private getSchemeProperties(selector: string, colorScheme: ColorScheme): ColorSchemeProperties {
        const { styles, stylesMap, forceScheme } = this.getConfig(selector);
        const map: ColorSchemeCSSMap = this.getStylesMap(selector, colorScheme, stylesMap);
        const properties: ColorSchemeProperties = {};

        if ('schemes' in styles) {
            const theSchemes: ColorSchemes = (styles.schemes ??
                this.colorSchemes.reduce(
                    (schemes: ColorSchemes, item: ColorSchemeItem) => Object.assign(schemes, item.scheme),
                    {} as ColorSchemes
                )) as ColorSchemes;

            Object.keys(map).forEach((property: string) => {
                let propertyValue: ColorSchemeCSSType | undefined;

                if (!forceScheme) {
                    propertyValue = theSchemes[colorScheme]?.[property];
                } else {
                    const forcedScheme: ColorSchemeProperties = theSchemes[forceScheme] ?? theSchemes.light;
                    propertyValue = forcedScheme?.[property];
                }

                if (propertyValue) properties[property] = propertyValue;
            });
        } else {
            Object.keys(map).forEach(
                (property: string) => (properties[property] = (styles as ColorSchemeProperties)[property])
            );
        }

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
        selector = selector
            .replace(/[^a-zA-Z]/g, '-') // Replaces non alphabet characters with hyphen.
            .replace(/-{2,}/g, '-') // Replaces double hyphen with single.
            .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '') // Removes non alphabet characters from beginning and end.
            .toLocaleLowerCase();

        return `${selector}-styles`;
    }

    /**
     * @description
     * Find the matching properties between the given properties and the selector's config.
     *
     * @param { string } selector - The given selector.
     * @param { Record<string, unknown> } properties - The given properties.
     * @returns { string[] }
     */
    private findMatchingProperties(selector: string, properties: Record<string, unknown>): string[] {
        return Object.keys(properties ?? {}).filter((property: string) =>
            Object.keys(this.getConfig(selector).stylesMap ?? {}).includes(property)
        );
    }

    /**
     * @description
     * To init the available default Schemes.
     */
    private initColorSchemeDefaults(): void {
        this.allColorSchemes.length = 0;

        COLOR_SCHEME_ITEMS_DEFAULTS.forEach((colorScheme: ColorSchemeItem) => {
            const { value: schemeName } = colorScheme;
            const schemeAuto: boolean = schemeName === SCHEME.AUTO;
            const scheme: ColorSchemeProperties = (!schemeAuto
                ? (this.deepCopyObj(COLOR_SCHEME_DEFAULTS[schemeName]) as ColorSchemeProperties)
                : {}) as unknown as ColorSchemeProperties;

            this.updateColorSchemeMap(schemeName);

            this.allColorSchemes.push({ ...colorScheme, scheme });

            if (schemeAuto) return;

            (this.rootConfig.styles.schemes as ColorSchemes)[schemeName] = scheme;
        });
    }

    /**
     * @description
     * Updates the Color Scheme styles map with the proper suffix on each property.
     *
     * @param { string } scheme - The Scheme code-name.
     */
    private updateColorSchemeMap(scheme: ColorScheme): void {
        this.globalStylesMap[scheme] = {};

        const { stylesMap } = this.rootConfig;

        for (const propertyKey in stylesMap) {
            const item: ColorSchemeCSSProperty = this.getCSSProperty(stylesMap[propertyKey]);
            const property: string = `${item.property}-${scheme}`;

            this.globalStylesMap[scheme][propertyKey] = { ...item, property };
        }
    }

    /**
     * @description
     * For a deep copy object.
     *
     * @param { T } obj - The object to copy.
     * @returns A new instane of the object.
     */
    private deepCopyObj<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj)) as T;
    }

    /**
     * @description
     * To check the current system's Scheme.
     */
    private checkSystemColorScheme(): void {
        this.systemValue = this.isSystemThemeDark ? SCHEME.DARK : SCHEME.LIGHT;
    }

    /**
     * @description
     * To start the listener for when system's Scheme changes.
     */
    private initSystemColorSchemeListener(): void {
        this.window?.matchMedia(this.matchMediaDark)?.addEventListener('change', this.onColorSchemeChange);
    }

    /**
     * @description
     * To stop the listener for when system's Scheme changes.
     */
    private stopSystemColorSchemeListener(): void {
        this.window?.matchMedia(this.matchMediaDark)?.removeEventListener('change', this.onColorSchemeChange);
    }

    /**
     * @description
     * The system's Scheme change callback.
     */
    private onColorSchemeChange = ((event: MediaQueryListEvent) => {
        if (this.chosenValue !== SCHEME.AUTO) return;

        this.systemValue = event.matches ? SCHEME.DARK : SCHEME.LIGHT;
        this.changedBy = 'system';
        this.colorScheme = this.systemValue;
        this.changedBy = 'user';
    }).bind(this);
}
