import {
    RecursivePartial,
    ColorSchemeCSSType,
    ColorSchemeCSSProperty,
    ColorSchemeDefaultNames,
} from './color-scheme.type.private';

export type ColorScheme = 'light' | 'dark' | 'auto' | string;

export const COLOR_SCHEME_GENERICS_DEFAULTS: ColorSchemeProperties = {
    a11yShadow: '5px 5px 10px -5px',
};

export const COLOR_SCHEME_DEFAULTS: ColorSchemes = {
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
        a11yBorderColor: '#555',
        a11yShadowColor: '#444',
        a11yFocusVisible: '0 0 0 2px #555, 0 0 0 4px #FFF',
    },
};

export type ColorSchemeChange = {
    /** @description The previous value of the Color Scheme. */
    colorSchemePrevious: ColorScheme;
    /** @description The current value of the Color Scheme. */
    colorSchemeCurrent: ColorScheme;
    /** @description Who changed the Color Scheme. */
    changedBy: 'user' | 'system';
};

export type ColorSchemes = {
    /** @description The `light` Color Scheme. */
    light: ColorSchemeProperties;
    /** @description The `dark` Color Scheme. */
    dark?: ColorSchemeProperties;
    /** @description The custom Color Schemes. */
    [customScheme: string]: ColorSchemeProperties | undefined;
};

export type ColorSchemeProperties = {
    [property: string]: ColorSchemeCSSType;
};

export type ColorSchemesStyles = ColorSchemeProperties | RecursivePartial<ColorSchemesObject>;

export type ColorSchemeConfig = ColorSchemeStylesConfig & {
    /** @description The element selector to apply the Color Scheme. */
    selector: string;
    /** @description The styles. */
    styles: ColorSchemeProperties | ColorSchemesObject;
    /** @description The styles map. */
    stylesMap: ColorSchemeCSSMap;
    /** @description The ID to apply to the `<style>` tag. */
    cssTagID?: string;
};

export type ColorSchemesObject = {
    /** @description A list of _generic_ properties for the Color Scheme, such as 'borderSize' but not 'borderColor'. */
    generics?: ColorSchemeProperties;
    /** @description A list of the Color Schemes with all their proper properties. */
    schemes?: ColorSchemes;
};

export type ColorSchemeGlobalConfig = {
    /** @description To set which Color Scheme to be used. @default 'light' */
    useScheme?: ColorScheme;
    /** @description To allow the user to change the Color Scheme. @default true */
    allowUserToChangeScheme?: boolean;
    /** @description To provide the default names for the basic Schemes. */
    defaultNames?: ColorSchemeDefaultNames;
    /** @description To provide new Color Schemes. */
    newSchemes?: ColorSchemeItem[];
    /** @description To provide new properties to the current styles map. */
    appendStylesMap?: ColorSchemeCSSMap;
    /**
     * @description The CSS attribute's name to match the Color Scheme.
     *
     * The default is 'color-scheme', which will result on `[color-scheme="dark"]` applied to the `<body>`.
     *
     * For instance, if you want to use Bootstrap (5.3 or above), they make use of 'data-bs-theme' => `[data-bs-theme="dark"]`.
     *
     * @default 'color-scheme'
     */
    attributeSelectorMatch?: string;
};

export type ColorSchemeItem = {
    /** @description The unique name (hyphen separated) of the Color Scheme. */
    value: ColorScheme;
    /** @description The readable name of the Color Scheme. */
    name: string;
    /** @description The properties for the Color Scheme. */
    scheme: ColorSchemeProperties;
};

export type ColorSchemeStylesConfig = {
    /** @description Force to use the given Color Scheme. */
    forceScheme?: ColorScheme;
    /** @description Whether it will use Bootstrap 5.3 (or higher) styles or custom. */
    useBootstrapStyles?: boolean;
};

/**
 * @description A map of all the **required** styles to apply to the Color Scheme.
 */
export type ColorSchemeCSSMap = {
    [property: string]: string | ColorSchemeCSSProperty;
};
