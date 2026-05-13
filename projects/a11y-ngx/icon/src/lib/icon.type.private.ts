export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;

export type IconType = 'string' | 'image' | 'template' | 'template-ref' | 'component';

export type IconDefaultEntryDescription = {
    /**
     * @description
     * The preferred method to pass the `icon` string value to the component.
     *
     * @values
     * - `'input'` 👉 The string sent will be applied as the value for the input established in `inputName`.
     * - `'content'` 👉 The string sent will be applied as content projection.
     */
    mainEntry: string;
};
export type IconDefaultEntryInput = IconDefaultEntryDescription & {
    mainEntry: 'input';
    /** @description The component's input name. @note Used when `mainEntry='input'`. */
    inputName: string;
};
export type IconDefaultEntryContent = IconDefaultEntryDescription & {
    mainEntry: 'content';
};
