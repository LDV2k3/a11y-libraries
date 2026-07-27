const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const libName: string = 'A11y Menu';

export const ERROR_NO_BUTTON_HOST = (element: HTMLElement): string => {
    const msg: string = `
        ${libName}:
        The menu trigger is not a button (or is of [type="submit"])!
        You must use a native '<button>' element or, if you absolutely must,
        some other element with the proper role and tabindex, like: '<span role="button" tabindex="0">...</span>'.
        Your trigger element: <${element.tagName.toLowerCase()} .../>.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_NO_DATA_PROVIDED = (): string => {
    const msg: string = `
        ${libName}:
        No menu items provided!
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE = (): string => {
    const msg: string = `
        ${libName}:
        A11yMenuModule.rootConfig() or provideA11yMenu() has been called more than once.
        Please, use this method just one time at a root level to establish the global config for the Menus used in your project.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE = (serviceClass: string): string => {
    const msg: string = `
        ${libName}:
        ${serviceClass} is a singleton and has been provided more than once.
        Please remove the service from any 'providers' array you may have added it to.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_USE_SELECTOR_NOT_DEFINED = (): string => {
    const msg: string = `
        ${libName}:
        You have to specify a selector to use the proper config.
        Please provide a valid value to the "selector" property
        when using the MenuService.initRootMenuData() method.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED = (): string => {
    const msg: string = `
        ${libName}:
        You can not use 'a11y-menu-container' or 'a11y-menu' as a selector.
        Please choose another name for it.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY = (): string => {
    const msg: string = `
        ${libName}:
        An empty selector was provided, please use a valid value!
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED = (selector: string): string => {
    const msg: string = `
        ${libName}:
        The selector "${selector}" was already provided, this instance will be ignored.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING = (selector: string): string => {
    const msg: string = `
        ${libName}:
        The config you are trying to update using the selector "${selector}"
        was never configured using A11yMenuModule.customConfig() nor provideA11yMenuFeature().
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_ITEM_VALUE_CONTEXT_NOT_FOUND = (value: string): string => {
    const msg: string = `
        ${libName}:
        The item you are trying to get (with value "${value}") does not exist.
    `;
    return formatConsoleMsg(msg);
};
