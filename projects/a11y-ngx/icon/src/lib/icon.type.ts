import { TemplateRef, Type } from '@angular/core';

import type { Prettify, IconDefaultEntryInput, IconDefaultEntryContent } from './icon.type.private';

export type IconInputHTML = {
    /**
     * @description
     * The raw HTML snippet to be rendered.
     *
     * > ⚠️ **WARNING:** This content is rendered using `DomSanitizer.bypassSecurityTrustHtml()`.
     * >
     * > Ensure the string is trusted or pre-sanitized if it comes from user input or external APIs to prevent XSS.
     */
    html: string;
};
export type IconInputImage = {
    /** @description The image path/URL to be used in the `<img>` tag. */
    src: string;
    /** @description Ignores any `basePath` globally configured. @default false */
    ignoreBasePath?: boolean;
};
export type IconInputTemplate = TemplateRef<unknown>;
export type IconInputComponent = {
    /** @description The main Icon Component you want to render. */
    component: Type<unknown>;
} & Partial<{
    /** @description Any inputs for the component to properly work. */
    inputs: Record<string, unknown>;
    /** @description Any content to project within the component. */
    content: string;
}>;

export type Icon = string | IconInputHTML | IconInputImage | IconInputComponent | IconInputTemplate;

export type IconDefaultComponent = Prettify<
    Pick<IconInputComponent, 'component' | 'inputs'> & (IconDefaultEntryInput | IconDefaultEntryContent)
>;

export type IconGlobalStrategy = IconDefaultComponent | 'image';
export type IconCustomStrategy = IconInputTemplate | IconDefaultComponent | 'image';

export type IconConfig = Partial<{
    /**
     * @description
     * Defines the global strategy used to resolve and render string-based icon inputs.
     */
    strategy: IconGlobalStrategy;
    /**
     * @description
     * Optional base path to prepend to the icon string.
     *
     * Used with the `'image'` strategy to avoid repeating folder paths or URLs.
     *
     * @example '/assets/icons/'
     */
    basePath: string;
}>;
