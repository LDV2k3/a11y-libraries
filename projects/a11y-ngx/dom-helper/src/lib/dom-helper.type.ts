export const TABBABLE_ELEMENT_TABINDEX_SELECTOR: string = '[tabindex]:not([tabindex=""]):not([tabindex^="-"])';
export const CONTENTEDITABLE_ELEMENT_SELECTOR: string = '[contenteditable]:not([contenteditable="false"])';

export const TABBABLE_ELEMENTS_SELECTOR: string = `
    a[href],
    area[href],
    input:not([type="hidden"]):not(:disabled):not(:is(fieldset input:disabled)),
    select:not(:disabled):not(:is(fieldset select:disabled)),
    textarea:not(:disabled):not(:is(fieldset textarea:disabled)),
    button:not(:disabled):not(:is(fieldset button:disabled)),
    fieldset:not(:disabled):not(:is(fieldset:disabled fieldset)) input:not([type="hidden"]):not(:disabled),
    fieldset:not(:disabled):not(:is(fieldset:disabled fieldset)) select:not(:disabled),
    fieldset:not(:disabled):not(:is(fieldset:disabled fieldset)) textarea:not(:disabled),
    fieldset:not(:disabled):not(:is(fieldset:disabled fieldset)) button:not(:disabled),
    *${CONTENTEDITABLE_ELEMENT_SELECTOR},
    *${TABBABLE_ELEMENT_TABINDEX_SELECTOR}
`;

export const ARIA_LABEL_TAGS_SUPPORTED: string[] = [
    'header',
    'nav',
    'main',
    'aside',
    'footer',
    'section',
    'form',
    'article',
    'details',
    'fieldset',
    'progress',
    'meter',
    'output',
    'img',
    'svg',
    'iframe',
];
export const ARIA_LABEL_INTERACTIVE_SUPPORTED_SELECTOR: string = `
    a[href],
    area[href],
    input:not([type="hidden"]),
    select,
    textarea,
    button,
    ${CONTENTEDITABLE_ELEMENT_SELECTOR}
`;
export const ARIA_LABEL_TAGS_NOT_SUPPORTED: string[] = [
    'caption',
    'code',
    'dfn',
    'del',
    'ins',
    'i',
    'em',
    'div',
    'span',
    'p',
    'b',
    'strong',
    'sub',
    'sup',
];
export const ARIA_LABEL_ROLES_NOT_SUPPORTED: string[] = [
    'caption',
    'code',
    'definition',
    'deletion',
    'emphasis',
    'generic',
    'insertion',
    'mark',
    'paragraph',
    'presentation',
    'none',
    'strong',
    'subscript',
    'suggestion',
    'superscript',
    'term',
    'time',
];
export const ARIA_LABEL_ROLES_SUPPORTED_INTERACTIVE: string[] = [
    'link',
    'button',
    'listbox',
    'combobox',
    'textbox',
    'checkbox',
    'radio',
    'slider',
    'spinbutton',
];
export const ARIA_LABEL_ROLES_SUPPORTED_NON_INTERACTIVE: string[] = [
    'group',
    'progressbar',
    'meter',
    'status',
    'img',
    'graphics-document',
    'document',
];

export enum KEY {
    UP = 'ArrowUp',
    DOWN = 'ArrowDown',
    LEFT = 'ArrowLeft',
    RIGHT = 'ArrowRight',

    HOME = 'Home',
    END = 'End',
    PAGEUP = 'PageUp',
    PAGEDOWN = 'PageDown',

    ENTER = 'Enter',
    SPACE = 'Space',
    TAB = 'Tab',

    ESCAPE = 'Escape',
}
