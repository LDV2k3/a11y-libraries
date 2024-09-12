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
    *[tabindex]:not([tabindex=""]):not([tabindex^="-"]),
    *[contenteditable]:not([contenteditable="false"])
`;

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
