import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ColorSchemeService } from './color-scheme.service';

import { ERROR_EDIT_CONFIG_NOT_FOUND, ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND } from './color-scheme.errors';

import {
    COLOR_SCHEME_DEFAULTS,
    COLOR_SCHEME_GENERICS_DEFAULTS,
    ColorSchemes,
    ColorSchemeItemNew,
    ColorSchemeProperties,
    ColorSchemeCSSMap,
    ColorSchemeConfig,
} from './color-scheme.type';
import {
    COLOR_SCHEME_SELECTOR_MATCH,
    COLOR_SCHEME_TAG_ID,
    ColorSchemeCSSProperty,
    ColorSchemeSchemeDefaults,
} from './color-scheme.type.private';

const MOCK_SCHEME_RED: ColorSchemeItemNew = {
    value: 'test-red',
    name: 'Test Red',
    scheme: {
        a11yBackgroundColor: 'red',
        a11yBorderColor: 'blue',
        a11yTextColor: 'yellow',
        a11yShadow: '0 0 10px purple',
    },
};
const MOCK_SCHEME_BLUE: ColorSchemeItemNew = {
    value: 'test-blue',
    name: 'Test Blue',
    useMissingPropsFrom: 'dark',
    scheme: {
        a11yBackgroundColor: 'orange',
        a11yBorderColor: 'pink',
        a11yTextColor: 'olive',
    },
};
const MOCK_SCHEME_GREEN: ColorSchemeItemNew = {
    value: 'test-green',
    name: 'Test Green',
    useMissingPropsFrom: 'test-blue',
    scheme: {
        a11yBackgroundColor: 'purple',
        a11yBorderColor: 'lime',
        a11yTextColor: 'brown',
    },
};
const MOCK_SCHEME_ORANGE: ColorSchemeItemNew = {
    value: 'test-orange',
    name: 'Test Orange',
    useMissingPropsFrom: 'non-existing-key',
    scheme: {
        a11yBackgroundColor: 'blueviolet',
        a11yBorderColor: 'cadetblue',
        a11yTextColor: 'teal',
    },
};

describe('Color Scheme Service', () => {
    let service: ColorSchemeService;

    const rootSelector: string = ':root';
    const localStorageKey: string = 'a11y.colorScheme';
    const isSystemSchemeDark: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentScheme: string = isSystemSchemeDark ? 'dark' : 'light';

    beforeEach(() => localStorage.removeItem(localStorageKey));

    describe('The Basics', () => {
        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should create the localStorage key', () => {
            expect(localStorage.getItem(localStorageKey)).not.toBe(null);
        });

        describe('Check the "userChosen" getter/setter', () => {
            it('should correctly update the "userChosen" property when its value is changed', () => {
                service['chosenValue'] = undefined;
                expect(service.userChosen).toEqual('auto');

                service.userChosen = 'dark';
                expect(service.userChosen).toEqual('dark');
            });

            it('should not call any of the listener methods when the new value is the same as the one saved', fakeAsync(() => {
                const spyOnStopSystemColorScheme = spyOn(service, <never>'stopSystemColorSchemeListener');
                const spyOnCheckSystemColorScheme = spyOn(service, <never>'checkSystemColorScheme');
                const spyOnInitystemColorScheme = spyOn(service, <never>'initSystemColorSchemeListener');

                service.userChosen = 'auto';
                expect(spyOnStopSystemColorScheme).not.toHaveBeenCalled();
                expect(spyOnCheckSystemColorScheme).not.toHaveBeenCalled();
                expect(spyOnInitystemColorScheme).not.toHaveBeenCalled();
            }));

            it('should call the listener methods accordingly', fakeAsync(() => {
                const spyOnStopSystemColorScheme = spyOn(service, <never>'stopSystemColorSchemeListener');
                const spyOnCheckSystemColorScheme = spyOn(service, <never>'checkSystemColorScheme');
                const spyOnInitystemColorScheme = spyOn(service, <never>'initSystemColorSchemeListener');

                expect(spyOnStopSystemColorScheme).not.toHaveBeenCalled();
                expect(spyOnCheckSystemColorScheme).not.toHaveBeenCalled();
                expect(spyOnInitystemColorScheme).not.toHaveBeenCalled();

                service.userChosen = 'dark';
                expect(spyOnStopSystemColorScheme).toHaveBeenCalledTimes(1);

                service.userChosen = 'auto';
                expect(spyOnCheckSystemColorScheme).toHaveBeenCalledTimes(1);
                expect(spyOnInitystemColorScheme).toHaveBeenCalledTimes(1);
            }));
        });

        it('should have the right values set for the default schemes', fakeAsync(() => {
            const spyOnColorSchemeChanged = spyOn(service.colorSchemeChanged, 'next');
            const spyOnUpdateColorSchemeAttr = spyOn(service, <never>'updatePageColorScheme');

            service.userChosen = 'auto';
            expect(spyOnColorSchemeChanged).not.toHaveBeenCalled();
            expect(spyOnUpdateColorSchemeAttr).not.toHaveBeenCalled();

            service.userChosen = 'green';
            expect(spyOnColorSchemeChanged).toHaveBeenCalledWith({
                colorSchemePrevious: currentScheme,
                colorSchemeCurrent: 'green',
                changedBy: 'user',
            });
            expect(spyOnUpdateColorSchemeAttr).toHaveBeenCalledTimes(1);

            service.userChosen = 'purple';
            expect(spyOnColorSchemeChanged).toHaveBeenCalledWith({
                colorSchemePrevious: 'green',
                colorSchemeCurrent: 'purple',
                changedBy: 'user',
            });
            expect(spyOnUpdateColorSchemeAttr).toHaveBeenCalledTimes(2);

            service.userChosen = 'auto';
            expect(spyOnColorSchemeChanged).toHaveBeenCalledWith({
                colorSchemePrevious: 'purple',
                colorSchemeCurrent: currentScheme,
                changedBy: 'user',
            });
            expect(spyOnUpdateColorSchemeAttr).toHaveBeenCalledTimes(3);
        }));

        it('should have the right values set for the default schemes', () => {
            const { colorSchemes } = service;

            expect(colorSchemes.length).toEqual(3);
            expect(colorSchemes[0].value).toEqual('light');
            expect(colorSchemes[1].value).toEqual('dark');
            expect(colorSchemes[2].value).toEqual('auto');
        });

        it('should have "allowUserToChangeScheme" set on "true" by default', () => {
            expect(service.allowUserToChangeScheme).toBe(true);
        });

        it('should validate the selector correctly when using "selectorNotAllowed()" method', () => {
            expect(service.selectorNotAllowed('root')).toBe(true);
            expect(service.selectorNotAllowed(rootSelector)).toBe(true);
            expect(service.selectorNotAllowed('test-selector')).toBe(false);
        });
    });

    describe('New Schemes', () => {
        let schemes: ColorSchemes;
        let generics: ColorSchemeProperties;
        let stylesMap: ColorSchemeCSSMap;

        const checkNewSchemes: ColorSchemeItemNew[] = [
            MOCK_SCHEME_RED,
            MOCK_SCHEME_BLUE,
            MOCK_SCHEME_GREEN, // 'green' depends on 'blue' to be added first
            MOCK_SCHEME_ORANGE,
        ];
        const checkKeysNew: string[] = checkNewSchemes.map(({ value }) => value);
        const checkKeys: string[] = ['light', 'dark'].concat(checkKeysNew);
        const checkValues: ColorSchemeProperties[] = [COLOR_SCHEME_DEFAULTS.light, COLOR_SCHEME_DEFAULTS.dark].concat(
            checkNewSchemes.map(({ scheme }) => scheme)
        );
        const checkMissingFrom: string[] = [undefined, undefined].concat(
            checkNewSchemes.map(({ useMissingPropsFrom }) =>
                checkKeys.includes(useMissingPropsFrom) ? useMissingPropsFrom : 'light'
            )
        );

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);

            checkNewSchemes.forEach((scheme: ColorSchemeItemNew) => service.newScheme(scheme));

            service['createCSS'](rootSelector); // To force update the <style> tag.

            schemes = service.rootConfig.styles.schemes as ColorSchemes;
            generics = service.rootConfig.styles.generics as ColorSchemeProperties;
            stylesMap = service.rootConfig.stylesMap;
        }));

        afterEach(() => checkKeysNew.forEach((scheme: string) => service.removeScheme(scheme)));

        const getProcessedProperty = (scheme: string, idx: number, property: string): string => {
            let finalValue: string;

            if (['light', 'dark'].includes(scheme) || property in checkValues[idx]) {
                finalValue = checkValues[idx][property] as string;
            } else if (!(property in generics)) {
                // Value not set, using the var() as default.
                const baseMapKey: string = stylesMap[property] as string;
                finalValue = `var(${baseMapKey}-${checkMissingFrom[idx]})`;
            }

            return finalValue;
        };

        it('should have the proper values set for the default schemes', () => {
            const { colorSchemes } = service;

            expect(colorSchemes.length).toEqual(checkKeys.length + 1); // +1 = 'auto'

            checkKeys.forEach((scheme: string, idx: number) => expect(colorSchemes[idx].value).toEqual(scheme));

            expect(colorSchemes[checkKeys.length].value).toEqual('auto');
        });

        describe('Check the rendered styles', () => {
            it('should have same amount of schemes and rendered styles', () => {
                const checkStyleElements = Array.from(document.head.querySelectorAll(`[id^="${COLOR_SCHEME_TAG_ID}"]`));
                expect(checkStyleElements.length).toEqual(checkKeys.length + 1); // +1 = generics
            });

            it(`should have the property and value correctly set within the rendered styles for the generics`, () => {
                const defaultGenerics: string = '--a11y-shadow:5px 5px 10px -5px;';
                const defaultGenericsMs: string = '--test-ms:200ms;';
                const defaultGenericsPx: string = '--test-px:100px;';
                const defaultGenericsHeight: string = '--test-height:10px;';
                const defaultGenericsColor: string = 'color:white;';
                const defaultGenericsBgColor: string = 'background-color:red;';

                const getGenericStyles = (): HTMLStyleElement =>
                    document.getElementById(COLOR_SCHEME_TAG_ID) as HTMLStyleElement;

                expect(getGenericStyles().innerText.includes(defaultGenerics)).toBe(true);

                // Checks that non valid properties (non variables & not within the map) are not applied.
                service.updateColorSchemeDefaults({ generics: { color: 'white', 'background-color': 'red' } });
                service['createCSS'](rootSelector);

                expect(getGenericStyles().innerText.includes(defaultGenerics)).toBe(true);
                expect(getGenericStyles().innerText.includes(defaultGenericsColor)).toBe(false);
                expect(getGenericStyles().innerText.includes(defaultGenericsBgColor)).toBe(false);

                // Checks that '--test-ms' is correctly applied (but not '--test-px' yet).
                service.updateColorSchemeDefaults({ generics: { '--test-ms': '200ms' } });
                service['createCSS'](rootSelector);

                expect(getGenericStyles().innerText.includes(defaultGenerics)).toBe(true);
                expect(getGenericStyles().innerText.includes(defaultGenericsMs)).toBe(true);
                expect(getGenericStyles().innerText.includes(defaultGenericsPx)).toBe(false);
                expect(getGenericStyles().innerText.includes(defaultGenericsColor)).toBe(false);
                expect(getGenericStyles().innerText.includes(defaultGenericsBgColor)).toBe(false);

                // Checks that '--test-px' is correctly applied (and '--test-ms' is still applied).
                service.updateColorSchemeDefaults({ generics: { '--test-px': '100px' } });
                service['createCSS'](rootSelector);

                expect(getGenericStyles().innerText.includes(defaultGenerics)).toBe(true);
                expect(getGenericStyles().innerText.includes(defaultGenericsMs)).toBe(true);
                expect(getGenericStyles().innerText.includes(defaultGenericsPx)).toBe(true);
                expect(getGenericStyles().innerText.includes(defaultGenericsColor)).toBe(false);
                expect(getGenericStyles().innerText.includes(defaultGenericsBgColor)).toBe(false);

                // Checks that 'testHeight' is not applied since it doesn't exist within the map.
                const testHeightProp: string = 'testHeight';
                service.updateColorSchemeDefaults({ generics: { [testHeightProp]: '10px' } });

                service['createCSS'](rootSelector);
                expect(getGenericStyles().innerText.includes(defaultGenericsHeight)).toBe(false);

                // Checks that 'testHeight' is now applied (once we added to the map).
                service.rootConfig.stylesMap[testHeightProp] = '--test-height';
                service['createCSS'](rootSelector);
                expect(getGenericStyles().innerText.includes(defaultGenericsHeight)).toBe(true);

                delete service.rootConfig.stylesMap[testHeightProp];
                getGenericStyles().remove();
            });

            checkKeys.forEach((scheme: string, idx: number) => {
                it(`should have the property and value correctly set within the rendered styles for "${checkKeys[idx]}" scheme`, () => {
                    const checkStyleId: string = `${COLOR_SCHEME_TAG_ID}-${checkKeys[idx]}`;
                    const checkStyleElement = document.getElementById(checkStyleId) as HTMLStyleElement;
                    const checkStyleGenericsElement = document.getElementById(COLOR_SCHEME_TAG_ID) as HTMLStyleElement;

                    expect(checkStyleElement).toBeTruthy();
                    expect(checkStyleGenericsElement).toBeTruthy();

                    // If the <style> does not exists, stops the tests to avoid extra errors.
                    if (!checkStyleElement) return;

                    const checkStyles = checkStyleElement.innerText.split(`[color-scheme="${checkKeys[idx]}"]`);

                    const rootStyles: string = checkStyles[0];
                    const individualStyles: string = checkStyles[1];

                    expect(individualStyles).not.toBe(undefined);

                    Object.keys(stylesMap).forEach((property) => {
                        // Check for generics.
                        if (property in generics) {
                            // --a11y-shadow: 5px 5px 10px -5px;
                            const rootPropertyAndValue: string = `${stylesMap[property]}:${generics[property]};`;
                            const checkGenericsStyles: string = checkStyleGenericsElement.innerText;
                            expect(checkGenericsStyles.indexOf(rootPropertyAndValue)).toBeGreaterThan(0);

                            // 'test-red' is the only scheme overriding the generic 'a11yShadow' value.
                            if (checkKeys[idx] === 'test-red') {
                                const testRedVar: string = `${stylesMap[property]}-${scheme}`;
                                const testRedRootValue: string = getProcessedProperty(scheme, idx, property);
                                const testRedIndividualValue: string = `var(${testRedVar},var(--a11y-shadow-light))`;

                                expect(rootStyles.indexOf(`${testRedVar}:${testRedRootValue};`)).toBeGreaterThan(0);
                                expect(
                                    individualStyles.indexOf(`${stylesMap[property]}:${testRedIndividualValue};`)
                                ).toBeGreaterThan(0);
                            } else {
                                expect(individualStyles.indexOf(`${stylesMap[property]}:`)).toBe(-1);
                            }
                            return;
                        }

                        // Check for the scheme.
                        const value: string = getProcessedProperty(scheme, idx, property);

                        // --a11y-bg-color-light: rgb(255 255 255 / 98%)
                        const rootProperty: string = `${stylesMap[property]}-${checkKeys[idx]}`;
                        const rootPropertyAndValue: string = `${rootProperty}:${value};`;

                        // var(--a11y-bg-color-light) // default suffix for non light/dark schemes
                        const individualPropertySuffix: string = !['light', 'dark'].includes(scheme)
                            ? `,var(${stylesMap[property]}-light)`
                            : '';

                        // --a11y-bg-color: var(--a11y-bg-color-light) // light & dark
                        // --a11y-bg-color: var(--a11y-bg-color-test-blue, var(--a11y-bg-color-light)) // rest of the schemes
                        const individualPropertyAndValue: string = `${stylesMap[property]}:var(${rootProperty}${individualPropertySuffix});`;

                        expect(rootStyles.indexOf(rootPropertyAndValue)).toBeGreaterThan(0);
                        expect(individualStyles.indexOf(individualPropertyAndValue)).toBeGreaterThan(0);
                    });
                });
            });
        });

        describe('Check the properties within the scheme', () => {
            const checkSchemes: ColorSchemes = {
                light: {
                    a11yBackgroundColor: 'rgb(255 255 255 / 98%)',
                    a11yTextColor: '#222',
                    a11yBorderColor: '#656565',
                    a11yShadowColor: '#444',
                    a11yFocusVisible: '0 0 0 2px #FFF, 0 0 0 4px #444',
                },
                dark: {
                    a11yBackgroundColor: 'rgb(31 31 31 / 98%)',
                    a11yTextColor: '#FFF',
                    a11yBorderColor: '#666',
                    a11yShadowColor: '#444',
                    a11yFocusVisible: '0 0 0 2px #FFF, 0 0 0 4px #666',
                },
                'test-red': {
                    a11yBackgroundColor: 'red',
                    a11yTextColor: 'yellow',
                    a11yBorderColor: 'blue',
                    a11yShadow: '0 0 10px purple',
                    a11yShadowColor: 'var(--a11y-shadow-color-light)',
                    a11yFocusVisible: 'var(--a11y-focus-visible-light)',
                },
                'test-blue': {
                    a11yBackgroundColor: 'orange',
                    a11yTextColor: 'olive',
                    a11yBorderColor: 'pink',
                    a11yShadowColor: 'var(--a11y-shadow-color-dark)',
                    a11yFocusVisible: 'var(--a11y-focus-visible-dark)',
                },
                'test-green': {
                    a11yBackgroundColor: 'purple',
                    a11yTextColor: 'brown',
                    a11yBorderColor: 'lime',
                    a11yShadowColor: 'var(--a11y-shadow-color-test-blue)',
                    a11yFocusVisible: 'var(--a11y-focus-visible-test-blue)',
                },
                'test-orange': {
                    a11yBackgroundColor: 'blueviolet',
                    a11yTextColor: 'teal',
                    a11yBorderColor: 'cadetblue',
                    a11yShadowColor: 'var(--a11y-shadow-color-light)',
                    a11yFocusVisible: 'var(--a11y-focus-visible-light)',
                },
            };

            checkKeys.forEach((scheme: string, idx: number) => {
                it(`should have the right properties set in "${checkKeys[idx]}" scheme`, () => {
                    expect(schemes[scheme]).toEqual(checkSchemes[scheme]);
                });
            });
        });

        // Checks that each property has the right value
        describe('Check the values of each property', () => {
            checkKeys.forEach((scheme: string, idx: number) => {
                it(`should have the right values set in "${checkKeys[idx]}" scheme`, () => {
                    Object.keys(stylesMap).forEach((property) => {
                        const value: string = getProcessedProperty(scheme, idx, property);
                        expect(schemes[scheme][property]).toEqual(value);
                    });
                });
            });
        });
    });

    describe('Check "initColorScheme()" Method', () => {
        const customLocalStorageScheme: string = 'custom-theme';
        const customParameterScheme: string = MOCK_SCHEME_RED.value;

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it('should have set the defaults as "auto"', () => {
            expect(service['chosenValue']).toEqual('auto');
            expect(localStorage.getItem(localStorageKey)).toEqual('auto');
        });

        describe(`Check when localStorage has "${customLocalStorageScheme}" (non-existing) value already saved`, () => {
            beforeEach(() => {
                localStorage.setItem(localStorageKey, customLocalStorageScheme);
                service.initColorScheme();
            });

            it(`should have the items set with "auto" value`, () => {
                expect(service['chosenValue']).toEqual('auto');
            });
        });

        describe(`Check when localStorage has "${customLocalStorageScheme}" (existing) value already saved`, () => {
            beforeEach(() => {
                localStorage.setItem(localStorageKey, customLocalStorageScheme);
                service.newScheme({
                    value: customLocalStorageScheme,
                    name: 'New Scheme',
                    scheme: {},
                });
                service.initColorScheme();
            });

            afterEach(() => service.removeScheme(customLocalStorageScheme));

            it(`should have the items set with "${customLocalStorageScheme}" value`, () => {
                expect(service['chosenValue']).toEqual(customLocalStorageScheme);
            });
        });

        describe(`Check when a custom parameter of "${customParameterScheme}" is provided to the method...`, () => {
            describe(`...and it does not exist within the schemes`, () => {
                beforeEach(() => {
                    service.globalConfig.useScheme = customParameterScheme;
                    service.initColorScheme();
                });

                it(`should have the items set with "auto" value`, () => {
                    expect(service['chosenValue']).toEqual('auto');
                });
            });

            describe(`...and it does exist within the schemes`, () => {
                beforeEach(() => {
                    service.newScheme(MOCK_SCHEME_RED);
                    service.globalConfig.useScheme = customParameterScheme;
                    service.initColorScheme();
                });

                afterEach(() => service.removeScheme(customParameterScheme));

                it(`should have the items set with "${customParameterScheme}" value`, () => {
                    expect(service['chosenValue']).toEqual(customParameterScheme);
                });
            });
        });
    });

    describe('Check "useBootstrapStyles()" Method', () => {
        const customSelectorUseBootstra: string = 'custom-bs';

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it(`should return "false" for "root" selector`, () => {
            expect(service.useBootstrapStyles(rootSelector)).toBe(false);
        });

        describe(`Check when the "${customSelectorUseBootstra}" selector is provided to the method...`, () => {
            describe(`...and it does not exist within the configs`, () => {
                it(`should return "false"`, () => {
                    expect(service.useBootstrapStyles(customSelectorUseBootstra)).toBe(false);
                });
            });

            describe(`...and it does exist within the configs`, () => {
                beforeEach(() =>
                    service.setConfig({
                        selector: customSelectorUseBootstra,
                        styles: {},
                        stylesMap: {},
                        useBootstrapStyles: true,
                    })
                );

                afterEach(() => service.removeConfig(customSelectorUseBootstra));

                it(`should return "true"`, () => {
                    expect(service.useBootstrapStyles(customSelectorUseBootstra)).toBe(true);
                });
            });

            describe(`...and it does exist within the configs but it has an established forced scheme`, () => {
                beforeEach(() =>
                    service.setConfig({
                        selector: customSelectorUseBootstra,
                        styles: {},
                        stylesMap: {},
                        useBootstrapStyles: true,
                        forceScheme: 'dark',
                    })
                );

                afterEach(() => service.removeConfig(customSelectorUseBootstra));

                it(`should return "false"`, () => {
                    expect(service.useBootstrapStyles(customSelectorUseBootstra)).toBe(false);
                });
            });
        });
    });

    describe('Check "getCurrentScheme()" Method', () => {
        const customSelectorCurrentScheme: string = 'custom-current-scheme';

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it(`should return "undefined" for a non existing selector`, () => {
            expect(service.getCurrentScheme('non-existing-selector')).toEqual(undefined);
        });

        it(`should return the current scheme`, () => {
            const currentSchemeSystem = isSystemSchemeDark ? COLOR_SCHEME_DEFAULTS.dark : COLOR_SCHEME_DEFAULTS.light;
            const currentGenerics = COLOR_SCHEME_GENERICS_DEFAULTS;
            const compareScheme = {};

            Object.keys({ ...currentSchemeSystem, ...currentGenerics }).forEach((key) => {
                compareScheme[key] = key in currentSchemeSystem ? currentSchemeSystem[key] : currentGenerics[key];
            });

            expect(service.getCurrentScheme(rootSelector)).toEqual(compareScheme);
        });

        describe(`Check for a given new custom config`, () => {
            const newConfigGenerics: ColorSchemeProperties = { genericProp: '--generic-prop' };
            const newConfigLight: ColorSchemeProperties = { schemePropLight: 'white' };
            const newConfigDark: ColorSchemeProperties = { schemePropDark: 'gray' };
            const newConfigRed: ColorSchemeProperties = { schemePropDark: 'red' };

            const newConfigFullSchemes: ColorSchemes = {
                light: newConfigLight,
                dark: newConfigDark,
                red: newConfigRed,
            };
            const newConfigFull: ColorSchemeConfig = {
                selector: customSelectorCurrentScheme,
                styles: {
                    generics: newConfigGenerics,
                    schemes: newConfigFullSchemes,
                },
                stylesMap: {},
            };

            const newConfigSimpleProperties: ColorSchemeProperties = {
                ...newConfigGenerics,
                ...newConfigLight,
                ...newConfigRed,
            };
            const newConfigSimple: ColorSchemeConfig = {
                selector: customSelectorCurrentScheme,
                styles: newConfigSimpleProperties,
                stylesMap: {},
            };

            afterEach(() => service.removeConfig(customSelectorCurrentScheme));

            it(`should return "generics" and "current scheme" properties for the provided scheme`, () => {
                service.setConfig(newConfigFull);
                const currentSchemeSystem = isSystemSchemeDark ? newConfigDark : newConfigLight;
                const currentScheme: ColorSchemeProperties = { ...newConfigGenerics, ...currentSchemeSystem };
                expect(service.getCurrentScheme(customSelectorCurrentScheme)).toEqual(currentScheme);
            });

            it(`should return "generics" and "red" properties for the provided scheme with a forced scheme, compensating the missing properties with "light" scheme`, () => {
                service.setConfig({ ...newConfigFull, forceScheme: 'red' });
                const currentScheme: ColorSchemeProperties = {
                    ...newConfigGenerics,
                    ...newConfigLight,
                    ...newConfigRed,
                };
                expect(service.getCurrentScheme(customSelectorCurrentScheme)).toEqual(currentScheme);
            });

            it(`should return "generics" and "light" properties for the provided scheme with a forced scheme that doesn't exist`, () => {
                service.setConfig({ ...newConfigFull, forceScheme: 'green' });
                const currentScheme: ColorSchemeProperties = { ...newConfigGenerics, ...newConfigLight };
                expect(service.getCurrentScheme(customSelectorCurrentScheme)).toEqual(currentScheme);
            });

            it(`should return all the originally given properties for the provided scheme when a simple list of properties was saved`, () => {
                service.setConfig(newConfigSimple);
                expect(service.getCurrentScheme(customSelectorCurrentScheme)).toEqual(newConfigSimpleProperties);
            });
        });
    });

    describe('Check "setConfig()", "updateConfig()" & "getConfig()" Method', () => {
        const newConfigSetUpdateGetSelector: string = 'set-update-get-selector';
        const newConfigFull: ColorSchemeConfig = {
            selector: newConfigSetUpdateGetSelector,
            styles: {
                generics: {
                    genericProp: 10,
                    genericPropTwo: 'blue',
                    genericPropThree: 'tail',
                },
                schemes: {
                    light: { schemePropLight: 'white' },
                    dark: { schemePropDark: 'gray' },
                    red: { schemePropRed: 'red' },
                },
            },
            stylesMap: {
                genericProp: '--generic-prop',
                genericPropTwo: 'background-color',
                genericPropThree: { property: 'color' },
                schemePropLight: '--generic-light-prop',
                schemePropDark: '--generic-dark-prop',
                schemePropRed: '--generic-red-prop',
            },
        };

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
            service.setConfig(newConfigFull);
        }));

        afterEach(() => service.removeConfig(newConfigSetUpdateGetSelector));

        it('should "get" the same config as previously "set", except for the non-variables properties', () => {
            const expectConfig: ColorSchemeConfig = service['deepCopyObj'](newConfigFull);
            delete expectConfig.stylesMap['genericPropTwo'];
            delete expectConfig.stylesMap['genericPropThree'];

            expect(service.getConfig(newConfigSetUpdateGetSelector)).toEqual(expectConfig);
        });

        it('should not "update" when the config is undefined', () => {
            const spyOnUpdateConfig = spyOn(service, 'getConfig');

            service.updateConfig('test-selector', undefined);
            expect(spyOnUpdateConfig).not.toHaveBeenCalled();
        });

        it('should console warn and not "update" when the selector does not exist', () => {
            const spyOnUpdateConfig = spyOn(console, 'warn');

            service.updateConfig('test-selector', { genericProp: 'purple' });
            expect(spyOnUpdateConfig).toHaveBeenCalledWith(ERROR_EDIT_CONFIG_NOT_FOUND('test-selector'));
        });

        it('should console error when forced scheme not found on the given schemes when trying to "update"', () => {
            const spyOnUpdateConfig = spyOn(console, 'error');

            service.updateConfig(newConfigSetUpdateGetSelector, { forceScheme: 'test-purple', schemes: { blue: {} } });
            expect(spyOnUpdateConfig).toHaveBeenCalledWith(
                ERROR_FORCED_SCHEME_SELECTOR_NOT_FOUND('test-purple', newConfigSetUpdateGetSelector)
            );
        });

        it('should not contain the non-variable property within the styles map', () => {
            const { stylesMap } = service.getConfig(newConfigSetUpdateGetSelector);
            const stylesMapExpect: ColorSchemeCSSMap = Object.assign({}, newConfigFull.stylesMap);
            delete stylesMapExpect['genericPropTwo'];
            delete stylesMapExpect['genericPropThree'];

            expect(stylesMap).toEqual(stylesMapExpect);
        });

        describe('Check "set" a config, "update" it and "get" the updated values', () => {
            it('should get the updated values for "generic" properties', () => {
                const updatedConfigOne: ColorSchemeProperties = { genericProp: 'purple' };

                service.updateConfig(newConfigSetUpdateGetSelector, updatedConfigOne);

                const { generics } = service.getConfig(newConfigSetUpdateGetSelector).styles;

                expect(generics).toEqual(
                    Object.assign({}, { ...updatedConfigOne, genericPropTwo: 'blue', genericPropThree: 'tail' })
                );
            });

            it('should get the updated values for a custom property with "schemes"', () => {
                const updatedConfigTwoLight: ColorSchemes = { light: { schemePropLight: 'white-updated' } };
                const updatedConfigTwoDark: Partial<ColorSchemes> = { dark: { schemePropDark: 'dark-updated' } };

                service.updateConfig(
                    newConfigSetUpdateGetSelector,
                    { the_schemes: { schemes: { ...updatedConfigTwoLight, ...updatedConfigTwoDark } } },
                    'the_schemes'
                );

                const { schemes } = service.getConfig(newConfigSetUpdateGetSelector).styles as {
                    schemes: ColorSchemes;
                };

                expect(schemes.light).toEqual(Object.assign({}, updatedConfigTwoLight.light));
                expect(schemes.dark).toEqual(Object.assign({}, updatedConfigTwoDark.dark));
            });

            it('should get the updated values for the given "schemes" as the config', () => {
                const updatedConfigThreeLight: ColorSchemes = { light: { schemePropLight: 'white-updated-2' } };
                const updatedConfigThreeDark: Partial<ColorSchemes> = { dark: { schemePropDark: 'dark-updated-2' } };

                service.updateConfig(newConfigSetUpdateGetSelector, {
                    schemes: { ...updatedConfigThreeLight, ...updatedConfigThreeDark },
                });

                const { schemes } = service.getConfig(newConfigSetUpdateGetSelector).styles as {
                    schemes: ColorSchemes;
                };

                expect(schemes.light).toEqual(Object.assign({}, updatedConfigThreeLight.light));
                expect(schemes.dark).toEqual(Object.assign({}, updatedConfigThreeDark.dark));
            });
        });
    });

    describe('Check "getCustomStyles()" Method', () => {
        const newConfigCustomStylesSelector: string = 'get-custom-styles-selector';
        const newConfigGenerics: ColorSchemeProperties = { genericProp: 10 };
        const newConfigLight: ColorSchemeProperties = { schemePropLight: 'white' };
        const newConfigDark: ColorSchemeProperties = { schemePropDark: 'gray' };
        const newConfigRed: ColorSchemeProperties = { schemePropRed: 'red' };
        const newConfigBlue: ColorSchemeProperties = { schemePropBlue: 'blue' };
        const newConfigFull: ColorSchemeConfig = {
            selector: newConfigCustomStylesSelector,
            styles: {},
            stylesMap: {
                genericProp: { property: '--generic-prop', suffix: 'px' },
                schemePropLight: '--generic-light-prop',
                schemePropDark: '--generic-dark-prop',
                schemePropRed: 'background-color',
                schemePropBlue: '--generic-background-color',
            },
        };

        describe('Check the styles object with "generics" and "schemes"', () => {
            beforeEach(fakeAsync(() => {
                TestBed.configureTestingModule({ providers: [ColorSchemeService] });
                service = TestBed.inject(ColorSchemeService);
                tick(5);

                service.setConfig({
                    ...newConfigFull,
                    styles: {
                        generics: newConfigGenerics,
                        schemes: {
                            light: newConfigLight,
                            dark: newConfigDark,
                            red: newConfigRed,
                            blue: newConfigBlue,
                        },
                    },
                });
            }));

            afterEach(() => service.removeConfig(newConfigCustomStylesSelector));

            it(`should not include the styles for the properties that don't start with "--"`, () => {
                const customStylesOne = service.getCustomStyles(newConfigCustomStylesSelector, {
                    genericProp: 55,
                    schemePropRed: 'orange',
                }) as unknown as Record<string, string>;

                expect(customStylesOne).toEqual({ '--generic-prop': '55px' });
            });

            it('should get the styles for the values that are different from the original ones', () => {
                const customStylesOne = service.getCustomStyles(newConfigCustomStylesSelector, {
                    genericProp: 15,
                    schemePropDark: 'orange',
                }) as unknown as Record<string, string>;

                expect(customStylesOne).toEqual({
                    '--generic-prop': '15px',
                    '--generic-dark-prop': 'orange',
                });

                const customStylesTwo = service.getCustomStyles(newConfigCustomStylesSelector, {
                    schemePropBlue: 'pink',
                }) as unknown as Record<string, string>;

                expect(customStylesTwo).toEqual({ '--generic-background-color': 'pink' });
            });

            it('should get an empty object if the same values are provided', () => {
                const customStylesOne = service.getCustomStyles(newConfigCustomStylesSelector, {
                    genericProp: 10,
                    schemePropDark: 'gray',
                }) as unknown as Record<string, string>;

                expect(customStylesOne).toEqual({});
            });
        });

        describe('Check the styles object as a plain list of properties', () => {
            beforeEach(fakeAsync(() => {
                TestBed.configureTestingModule({ providers: [ColorSchemeService] });
                service = TestBed.inject(ColorSchemeService);
                tick(5);
                service.setConfig({
                    ...newConfigFull,
                    styles: {
                        ...newConfigGenerics,
                        ...newConfigLight,
                        ...newConfigDark,
                        ...newConfigRed,
                    },
                });
            }));

            afterEach(() => service.removeConfig(newConfigCustomStylesSelector));

            it('should get the styles for the values that are different from the original ones', () => {
                const customStylesOne = service.getCustomStyles(newConfigCustomStylesSelector, {
                    genericProp: 25,
                    schemePropDark: 'lime',
                }) as unknown as Record<string, string>;

                expect(customStylesOne).toEqual({
                    '--generic-prop': '25px',
                    '--generic-dark-prop': 'lime',
                });

                const customStylesTwo = service.getCustomStyles(newConfigCustomStylesSelector, {
                    schemePropLight: 'brown',
                    schemePropDark: 'gray',
                }) as unknown as Record<string, string>;

                expect(customStylesTwo).toEqual({ '--generic-light-prop': 'brown' });
            });
        });
    });

    describe('Check "updateColorSchemeDefaults()" Method', () => {
        const defaultsGenerics: ColorSchemeProperties = { '--test-ms': '200ms', color: 'white' };
        const defaultsLight: ColorSchemeSchemeDefaults = { name: 'The New Light', a11yBackgroundColor: '#DDD' };
        const defaultsDark: ColorSchemeSchemeDefaults = { a11yBorderColor: '#111' };
        const defaultsAuto: ColorSchemeSchemeDefaults = { name: 'Automatic' };

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        afterEach(() =>
            service.updateColorSchemeDefaults({
                light: { name: 'Light', ...COLOR_SCHEME_DEFAULTS.light },
                dark: { name: 'Dark', ...COLOR_SCHEME_DEFAULTS.dark },
                auto: { name: 'Auto' },
            })
        );

        it('should get the right generic properties when provided', () => {
            expect(service.rootConfig.styles.generics).toEqual(COLOR_SCHEME_GENERICS_DEFAULTS);

            service.updateColorSchemeDefaults({ generics: defaultsGenerics });

            const { generics } = service.getConfig(rootSelector).styles;
            expect(generics).toEqual({ ...COLOR_SCHEME_GENERICS_DEFAULTS, ...defaultsGenerics });
        });

        it('should get the right updated properties and name for "light" scheme', () => {
            service.updateColorSchemeDefaults({ light: defaultsLight });

            const { light: originalLight } = COLOR_SCHEME_DEFAULTS;
            const {
                schemes: { light: lightUpdateOne },
            } = service.getConfig(rootSelector).styles as { schemes: ColorSchemes };

            expect(lightUpdateOne).toEqual({
                ...originalLight,
                a11yBackgroundColor: defaultsLight.a11yBackgroundColor, // updated one
            });

            const { name } = service.getScheme('light');
            expect(name).toEqual(defaultsLight.name);

            defaultsLight.a11yTextColor = 'pink';
            defaultsLight.a11yBorderColor = 'red';
            service.updateColorSchemeDefaults({ light: defaultsLight });

            const {
                schemes: { light: lightUpdateTwo },
            } = service.getConfig(rootSelector).styles as { schemes: ColorSchemes };

            expect(lightUpdateTwo).toEqual({
                ...originalLight,
                a11yBackgroundColor: defaultsLight.a11yBackgroundColor,
                a11yTextColor: defaultsLight.a11yTextColor,
                a11yBorderColor: defaultsLight.a11yBorderColor,
            });
        });

        it('should get the right updated properties and name for "dark" scheme', () => {
            service.updateColorSchemeDefaults({ dark: defaultsDark });

            const { dark: originalDark } = COLOR_SCHEME_DEFAULTS;
            const {
                schemes: { dark },
            } = service.getConfig(rootSelector).styles as { schemes: ColorSchemes };

            expect(dark).toEqual({
                ...originalDark,
                a11yBorderColor: defaultsDark.a11yBorderColor, // updated one
            });

            const { name } = service.getScheme('dark');
            expect(name).toEqual('Dark');
        });

        it('should get the right updated name for "auto" scheme', () => {
            service.updateColorSchemeDefaults({ auto: defaultsAuto });

            const { name } = service.getScheme('auto');
            expect(name).toEqual(defaultsAuto.name);
        });
    });

    describe('Check "isSelectorInConfig()" Method', () => {
        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it('should return "true" when the given selector does exist within the configurations', () => {
            service.setConfig({ selector: 'test-1', styles: {}, stylesMap: {} });
            expect(service.isSelectorInConfig('test-1')).toBe(true);
            service.removeConfig('test-1');
        });

        it('should return "false" when the given selector does not exist within the configurations', () => {
            expect(service.isSelectorInConfig('test-1')).toBe(false);
        });
    });

    describe('Check "removeConfig()" Method', () => {
        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it(`should not delete the given selector's config`, () => {
            service.removeConfig(rootSelector);
            expect(service.isSelectorInConfig(rootSelector)).toBe(true);
        });

        it(`should delete the given selector's config properly`, () => {
            service.setConfig({ selector: 'test-selector-1', styles: {}, stylesMap: {} });
            expect(service.isSelectorInConfig('test-selector-1')).toBe(true);
            service.removeConfig('test-selector-1');
            expect(service.isSelectorInConfig('test-selector-1')).toBe(false);
        });
    });

    describe('Check "getAttributeSelector()" Method', () => {
        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it('should get the default "attribute" and "value"', () => {
            expect(service.getAttributeSelector()).toEqual({
                attribute: COLOR_SCHEME_SELECTOR_MATCH,
                value: currentScheme,
            });
        });

        it('should get the default "attribute" and the given forced scheme as "value"', () => {
            const redSchemeKey: string = MOCK_SCHEME_RED.value;
            expect(service.getAttributeSelector(redSchemeKey)).toEqual({
                attribute: COLOR_SCHEME_SELECTOR_MATCH,
                value: redSchemeKey,
            });
        });

        it('should get the updated "attribute" and the default "value" for the scheme', () => {
            service.globalConfig.attributeSelectorMatch = 'theme';

            expect(service.getAttributeSelector()).toEqual({
                attribute: 'theme',
                value: currentScheme,
            });

            service.globalConfig.attributeSelectorMatch = COLOR_SCHEME_SELECTOR_MATCH;
        });
    });

    describe('Check "updatePageColorScheme()" Method', () => {
        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        afterEach(() => {
            service.globalConfig.attributeSelectorMatch = COLOR_SCHEME_SELECTOR_MATCH;
            service.userChosen = 'auto';
            service['updatePageColorScheme']();
            document.documentElement.removeAttribute('theme');
        });

        it('should have the default attribute selector match with the current scheme set on the <html> element', () => {
            const htmlHasAttr: boolean = document.documentElement.hasAttribute(COLOR_SCHEME_SELECTOR_MATCH);
            const htmlAttrValue: string = document.documentElement.getAttribute(COLOR_SCHEME_SELECTOR_MATCH);

            expect(htmlHasAttr).toBe(true);
            expect(htmlAttrValue).toEqual(currentScheme);
        });

        it('should have the updated attribute selector match with the current scheme set on the <html> element', () => {
            service.globalConfig.attributeSelectorMatch = 'theme';

            service['updatePageColorScheme']();

            const htmlHasAttrDefault: boolean = document.documentElement.hasAttribute(COLOR_SCHEME_SELECTOR_MATCH);
            const htmlHasAttrUpdated: boolean = document.documentElement.hasAttribute('theme');
            const htmlAttrValue: string = document.documentElement.getAttribute('theme');

            expect(htmlHasAttrDefault).toBe(false);
            expect(htmlHasAttrUpdated).toBe(true);
            expect(htmlAttrValue).toEqual(currentScheme);
        });

        it('should have the updated attribute selector match with the updated scheme set on the <html> element', () => {
            service.globalConfig.attributeSelectorMatch = 'theme';
            service.userChosen = MOCK_SCHEME_GREEN.value;

            service['updatePageColorScheme']();

            const htmlHasAttrDefault: boolean = document.documentElement.hasAttribute(COLOR_SCHEME_SELECTOR_MATCH);
            const htmlHasAttrUpdated: boolean = document.documentElement.hasAttribute('theme');
            const htmlAttrValue: string = document.documentElement.getAttribute('theme');

            expect(htmlHasAttrDefault).toBe(false);
            expect(htmlHasAttrUpdated).toBe(true);
            expect(htmlAttrValue).toEqual(MOCK_SCHEME_GREEN.value);
        });
    });

    describe('Check "getCSSProperty()" Method', () => {
        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
            tick(5);
        }));

        it('should return an object if a "string" is passed as the parameter', () => {
            const propString: string = 'thePropertyStr';
            expect(service['getCSSProperty'](propString)).toEqual({ property: propString });
        });

        it('should return the same object passed as the parameter', () => {
            const propObj: ColorSchemeCSSProperty = { property: 'theProperty', suffix: 'px' };
            expect(service['getCSSProperty'](propObj)).toEqual(propObj);
        });
    });

    describe('Check "getStyleIDFromSelector()" Method', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ providers: [ColorSchemeService] });
            service = TestBed.inject(ColorSchemeService);
        });

        it('should return the formatted string when a "weird" value is passed', () => {
            expect(service['getStyleIDFromSelector']('the--selector I   want 33')).toEqual(
                'the-selector-i-want-styles'
            );
        });
    });
});
