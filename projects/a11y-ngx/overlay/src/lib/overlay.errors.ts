const formatConsoleMsg = (msg: string): string => msg.replace(/ {2,}/g, '');

export const ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE = (): string => {
    const msg: string = `
        A11y Overlay:
        A11yOverlayModule.rootConfig() has been called more than once.
        Please, use this method just one time at a root level to establish the global config for the Overlays used in your project.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE = (): string => {
    const msg: string = `
        A11y Overlay:
        OverlayService is a singleton and has been provided more than once.
        Please remove the service from any 'providers' array you may have added it to.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_DESTROY_METHOD_UNEXISTING = (destroyMethod: string): string => {
    const msg: string = `
        A11y Overlay:
        The destroy method provided "${destroyMethod}" does not exist within your component.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED = (): string => {
    const msg: string = `
        A11y Overlay:
        You can not use 'root' or ':root' as a selector.
        Please choose another name for it.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY = (): string => {
    const msg: string = `
        A11y Overlay:
        An empty selector was provided, please use a valid value!
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED = (selector: string): string => {
    const msg: string = `
        A11y Overlay:
        The selector "${selector}" was already provided, this instance will be ignored.
    `;
    return formatConsoleMsg(msg);
};

export const ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING = (selector: string): string => {
    const msg: string = `
        A11y Overlay:
        The config you are trying to update using the selector "${selector}"
        was never configured using neither rootConfig() nor customConfig().
    `;
    return formatConsoleMsg(msg);
};
