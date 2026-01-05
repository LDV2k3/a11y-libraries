import {
    ColorSchemeConfig,
    ColorSchemeGlobalConfig,
    ColorSchemeItem,
    ColorSchemeCSSMap,
    ColorSchemesObject,
    ColorSchemeProperties,
} from './color-scheme.type';

export const COLOR_SCHEME_STYLE_CLASS: string = 'a11y-color-scheme-styles';
export const COLOR_SCHEME_TAG_ID: string = 'a11y-color-scheme-root';
export const COLOR_SCHEME_SELECTOR_MATCH: string = 'color-scheme';

export enum SCHEME {
    LIGHT = 'light',
    DARK = 'dark',
    AUTO = 'auto',
}

export const COLOR_SCHEME_GLOBAL_CONFIG_DEFAULT: Required<ColorSchemeGlobalConfig> = {
    useScheme: SCHEME.AUTO,
    appendStylesMap: {},
    allowUserToChangeScheme: true,
    attributeSelectorMatch: COLOR_SCHEME_SELECTOR_MATCH,
    newSchemes: [],
    defaults: {},
};

export const COLOR_SCHEME_ITEMS_DEFAULTS: ColorSchemeItem[] = [
    { value: SCHEME.LIGHT, name: 'Light', scheme: {} },
    { value: SCHEME.DARK, name: 'Dark', scheme: {} },
    { value: SCHEME.AUTO, name: 'Same as System', scheme: {} },
];

export type ColorSchemeStylesGenerics = {
    a11yBackgroundColor: string;
    a11yTextColor: string;
    a11yBorderColor: string;
    a11yShadow: string;
    a11yShadowColor: string;
    a11yFocusVisible: string;
};

export const COLOR_SCHEME_BASE_MAP: ColorSchemeCSSMap = {
    a11yBackgroundColor: '--a11y-bg-color',
    a11yTextColor: '--a11y-text-color',
    a11yBorderColor: '--a11y-border-color',
    a11yShadow: '--a11y-shadow',
    a11yShadowColor: '--a11y-shadow-color',
    a11yFocusVisible: '--a11y-focus-visible',
};

export type ColorSchemeConfigs = {
    [selector: string]: ColorSchemeDefaultConfig;
};

export type ColorSchemeDefaultConfig = ColorSchemeConfig & {
    /** @description The list of Color Schemes. */
    styles: Required<ColorSchemesObject>;
};

export type ColorSchemeCSSType = string | number;

export type ColorSchemeCSSProperty = {
    /** @description The property to map within the Color Scheme. */
    property: string;
    /**
     * @description The _suffix_ to apply to the CSS property.
     *
     * For instance, if the property is of type `number` but has to result on a CSS value of milliseconds:
     * `suffix: 'ms'` => `150ms`.
     */
    suffix?: string;
};

export type ColorSchemeSchemeDefaults = Partial<ColorSchemeStylesGenerics> &
    ColorSchemeSchemeDefaultName &
    ColorSchemeProperties;

export type ColorSchemeSchemeDefaultName = Partial<{
    name: string;
}>;

export type ColorSchemeDefaults = Partial<{
    generics: ColorSchemeProperties;
    light: ColorSchemeSchemeDefaults;
    dark: ColorSchemeSchemeDefaults;
    auto: ColorSchemeSchemeDefaultName;
}>;

export type ColorSchemeCSS = {
    [id: string]: string;
};

export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Record<string, unknown> ? RecursivePartial<T[P]> : T[P];
};

export type RecursiveReadonly<T> = {
    readonly [P in keyof T]: T[P] extends Record<string, unknown> ? RecursiveReadonly<T[P]> : T[P];
};
